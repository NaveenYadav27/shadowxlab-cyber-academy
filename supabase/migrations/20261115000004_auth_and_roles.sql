-- ==============================================================================
-- Migration: 20261115000004_auth_and_roles.sql
-- Description: RBAC, User Roles Table, and Security Functions for ShadowXLab
-- Target: PostgreSQL 15+ / Supabase
-- Version: 1.0.0
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. Table: user_roles
-- Note: Roles are NEVER stored in user_metadata to prevent client-side privilege escalation.
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_roles (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'instructor', 'administrator')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS trg_user_roles_updated_at ON public.user_roles;
CREATE TRIGGER trg_user_roles_updated_at
    BEFORE UPDATE ON public.user_roles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ------------------------------------------------------------------------------
-- 2. Security Definer Helper Functions
-- ------------------------------------------------------------------------------

-- Returns current authenticated user's role, or 'guest' if unauthenticated
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public, pg_temp
AS $$
DECLARE
    assigned_role TEXT;
BEGIN
    IF auth.uid() IS NULL THEN
        RETURN 'guest';
    END IF;

    SELECT role INTO assigned_role
    FROM public.user_roles
    WHERE user_id = auth.uid();

    RETURN COALESCE(assigned_role, 'student');
END;
$$;

-- Checks if the authenticated user has a specific role
CREATE OR REPLACE FUNCTION public.has_role(required_role TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public, pg_temp
AS $$
BEGIN
    IF auth.uid() IS NULL THEN
        RETURN false;
    END IF;

    RETURN EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = auth.uid() AND role = required_role
    );
END;
$$;

-- Checks if the authenticated user is an instructor or administrator
CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public, pg_temp
AS $$
BEGIN
    IF auth.uid() IS NULL THEN
        RETURN false;
    END IF;

    RETURN EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = auth.uid() AND role IN ('instructor', 'administrator')
    );
END;
$$;

-- ------------------------------------------------------------------------------
-- 3. Automatic Default Role Assignment Trigger for New Users
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'student')
    ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ------------------------------------------------------------------------------
-- 4. RLS Policies for user_roles
-- ------------------------------------------------------------------------------

-- Users can read their own role
DROP POLICY IF EXISTS "Users can read own role" ON public.user_roles;
CREATE POLICY "Users can read own role" ON public.user_roles
    FOR SELECT USING (
        auth.uid() = user_id
        OR
        public.has_role('administrator')
    );

-- Only administrators or service_role can update roles
DROP POLICY IF EXISTS "Admins can update roles" ON public.user_roles;
CREATE POLICY "Admins can update roles" ON public.user_roles
    FOR UPDATE USING (
        public.has_role('administrator')
    ) WITH CHECK (
        public.has_role('administrator')
    );

-- Only administrators or service_role can delete roles
DROP POLICY IF EXISTS "Admins can delete roles" ON public.user_roles;
CREATE POLICY "Admins can delete roles" ON public.user_roles
    FOR DELETE USING (
        public.has_role('administrator')
    );

-- ------------------------------------------------------------------------------
-- 5. Updated RLS Policies for Role-Gated Operations
-- ------------------------------------------------------------------------------

-- Programme Management: Administrators can insert, update, delete master curriculum
DROP POLICY IF EXISTS "Admins can insert programmes" ON public.programmes;
CREATE POLICY "Admins can insert programmes" ON public.programmes
    FOR INSERT WITH CHECK (
        public.has_role('administrator')
    );

DROP POLICY IF EXISTS "Admins can update programmes" ON public.programmes;
CREATE POLICY "Admins can update programmes" ON public.programmes
    FOR UPDATE USING (
        public.has_role('administrator')
    ) WITH CHECK (
        public.has_role('administrator')
    );

DROP POLICY IF EXISTS "Admins can delete programmes" ON public.programmes;
CREATE POLICY "Admins can delete programmes" ON public.programmes
    FOR DELETE USING (
        public.has_role('administrator')
    );

-- Attendance: Instructors and Administrators can record attendance for any session
-- (Revoke self-marking attendance to enforce instructor-only attendance control)
DROP POLICY IF EXISTS "Learner own attendance insert" ON public.session_attendance;
DROP POLICY IF EXISTS "Learner own attendance update" ON public.session_attendance;

DROP POLICY IF EXISTS "Staff can manage session attendance" ON public.session_attendance;
CREATE POLICY "Staff can manage session attendance" ON public.session_attendance
    FOR ALL USING (
        public.is_staff()
    ) WITH CHECK (
        public.is_staff()
    );
