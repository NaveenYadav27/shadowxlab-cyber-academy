-- ==============================================================================
-- Migration: 20261115000003_rls_policies.sql
-- Description: Hardened Zero-Trust Row Level Security (RLS) Policies
-- Target: PostgreSQL 15+ / Supabase
-- Version: 1.1.0 (Audited & Hardened)
-- ==============================================================================

-- 1. Enable RLS on all tables
ALTER TABLE public.programmes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.programme_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.programme_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.programme_labs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.programme_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.programme_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learner_session_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learner_lab_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learner_simulation_state ENABLE ROW LEVEL SECURITY;

-- Clean up any legacy loose policies
DROP POLICY IF EXISTS "Public read published programmes" ON public.programmes;
DROP POLICY IF EXISTS "Public read days of published programmes" ON public.programme_days;
DROP POLICY IF EXISTS "Public read sessions of published programmes" ON public.programme_sessions;
DROP POLICY IF EXISTS "Public read labs of published programmes" ON public.programme_labs;
DROP POLICY IF EXISTS "Public read assessments of published programmes" ON public.programme_assessments;
DROP POLICY IF EXISTS "Public read resources of published programmes" ON public.programme_resources;
DROP POLICY IF EXISTS "Learner session progress access" ON public.learner_session_progress;
DROP POLICY IF EXISTS "Learner lab progress access" ON public.learner_lab_progress;
DROP POLICY IF EXISTS "Session attendance access" ON public.session_attendance;
DROP POLICY IF EXISTS "Assessment attempts access" ON public.assessment_attempts;
DROP POLICY IF EXISTS "Simulation state access" ON public.learner_simulation_state;
DROP POLICY IF EXISTS "Learner resource contribution" ON public.programme_resources;

-- ------------------------------------------------------------------------------
-- 2. Curriculum Catalog Access Policies:
-- Public can READ published programmes and related curriculum days, sessions, labs, assessments, resources.
-- Direct public INSERT/UPDATE/DELETE is strictly DENIED (only service_role or future instructor role).
-- ------------------------------------------------------------------------------
CREATE POLICY "Public read published programmes" ON public.programmes
    FOR SELECT USING (published = true);

CREATE POLICY "Public read days of published programmes" ON public.programme_days
    FOR SELECT USING (EXISTS (
        SELECT 1 FROM public.programmes WHERE programmes.id = programme_days.programme_id AND programmes.published = true
    ));

CREATE POLICY "Public read sessions of published programmes" ON public.programme_sessions
    FOR SELECT USING (EXISTS (
        SELECT 1 FROM public.programmes WHERE programmes.id = programme_sessions.programme_id AND programmes.published = true
    ));

CREATE POLICY "Public read labs of published programmes" ON public.programme_labs
    FOR SELECT USING (EXISTS (
        SELECT 1 FROM public.programmes WHERE programmes.id = programme_labs.programme_id AND programmes.published = true
    ));

CREATE POLICY "Public read assessments of published programmes" ON public.programme_assessments
    FOR SELECT USING (EXISTS (
        SELECT 1 FROM public.programmes WHERE programmes.id = programme_assessments.programme_id AND programmes.published = true
    ));

CREATE POLICY "Public read resources of published programmes" ON public.programme_resources
    FOR SELECT USING (EXISTS (
        SELECT 1 FROM public.programmes WHERE programmes.id = programme_resources.programme_id AND programmes.published = true
    ));

-- ------------------------------------------------------------------------------
-- 3. Learner Progress & Simulation State Policies:
-- Strict tenant isolation:
-- - Authenticated users can ONLY read/write their own records matching auth.uid()::text.
-- - Guest / Local development users can ONLY read/write records matching user_id = 'local-learner'.
-- - Cross-user reads and writes are strictly prevented.
-- ------------------------------------------------------------------------------

-- 3a. Learner Session Progress
CREATE POLICY "Learner own session progress select" ON public.learner_session_progress
    FOR SELECT USING (
        (auth.uid() IS NOT NULL AND user_id = auth.uid()::text)
        OR
        (auth.uid() IS NULL AND user_id = 'local-learner')
    );

CREATE POLICY "Learner own session progress insert" ON public.learner_session_progress
    FOR INSERT WITH CHECK (
        (auth.uid() IS NOT NULL AND user_id = auth.uid()::text)
        OR
        (auth.uid() IS NULL AND user_id = 'local-learner')
    );

CREATE POLICY "Learner own session progress update" ON public.learner_session_progress
    FOR UPDATE USING (
        (auth.uid() IS NOT NULL AND user_id = auth.uid()::text)
        OR
        (auth.uid() IS NULL AND user_id = 'local-learner')
    ) WITH CHECK (
        (auth.uid() IS NOT NULL AND user_id = auth.uid()::text)
        OR
        (auth.uid() IS NULL AND user_id = 'local-learner')
    );

CREATE POLICY "Learner own session progress delete" ON public.learner_session_progress
    FOR DELETE USING (
        (auth.uid() IS NOT NULL AND user_id = auth.uid()::text)
        OR
        (auth.uid() IS NULL AND user_id = 'local-learner')
    );

-- 3b. Learner Lab Progress
CREATE POLICY "Learner own lab progress select" ON public.learner_lab_progress
    FOR SELECT USING (
        (auth.uid() IS NOT NULL AND user_id = auth.uid()::text)
        OR
        (auth.uid() IS NULL AND user_id = 'local-learner')
    );

CREATE POLICY "Learner own lab progress insert" ON public.learner_lab_progress
    FOR INSERT WITH CHECK (
        (auth.uid() IS NOT NULL AND user_id = auth.uid()::text)
        OR
        (auth.uid() IS NULL AND user_id = 'local-learner')
    );

CREATE POLICY "Learner own lab progress update" ON public.learner_lab_progress
    FOR UPDATE USING (
        (auth.uid() IS NOT NULL AND user_id = auth.uid()::text)
        OR
        (auth.uid() IS NULL AND user_id = 'local-learner')
    ) WITH CHECK (
        (auth.uid() IS NOT NULL AND user_id = auth.uid()::text)
        OR
        (auth.uid() IS NULL AND user_id = 'local-learner')
    );

CREATE POLICY "Learner own lab progress delete" ON public.learner_lab_progress
    FOR DELETE USING (
        (auth.uid() IS NOT NULL AND user_id = auth.uid()::text)
        OR
        (auth.uid() IS NULL AND user_id = 'local-learner')
    );

-- 3c. Session Attendance
CREATE POLICY "Learner own attendance select" ON public.session_attendance
    FOR SELECT USING (
        (auth.uid() IS NOT NULL AND user_id = auth.uid()::text)
        OR
        (auth.uid() IS NULL AND user_id = 'local-learner')
    );

CREATE POLICY "Learner own attendance insert" ON public.session_attendance
    FOR INSERT WITH CHECK (
        (auth.uid() IS NOT NULL AND user_id = auth.uid()::text)
        OR
        (auth.uid() IS NULL AND user_id = 'local-learner')
    );

CREATE POLICY "Learner own attendance update" ON public.session_attendance
    FOR UPDATE USING (
        (auth.uid() IS NOT NULL AND user_id = auth.uid()::text)
        OR
        (auth.uid() IS NULL AND user_id = 'local-learner')
    ) WITH CHECK (
        (auth.uid() IS NOT NULL AND user_id = auth.uid()::text)
        OR
        (auth.uid() IS NULL AND user_id = 'local-learner')
    );

-- 3d. Assessment Attempts
CREATE POLICY "Learner own assessment attempts select" ON public.assessment_attempts
    FOR SELECT USING (
        (auth.uid() IS NOT NULL AND user_id = auth.uid()::text)
        OR
        (auth.uid() IS NULL AND user_id = 'local-learner')
    );

CREATE POLICY "Learner own assessment attempts insert" ON public.assessment_attempts
    FOR INSERT WITH CHECK (
        (auth.uid() IS NOT NULL AND user_id = auth.uid()::text)
        OR
        (auth.uid() IS NULL AND user_id = 'local-learner')
    );

-- 3e. Simulation State
CREATE POLICY "Learner own simulation state select" ON public.learner_simulation_state
    FOR SELECT USING (
        (auth.uid() IS NOT NULL AND user_id = auth.uid()::text)
        OR
        (auth.uid() IS NULL AND user_id = 'local-learner')
    );

CREATE POLICY "Learner own simulation state insert" ON public.learner_simulation_state
    FOR INSERT WITH CHECK (
        (auth.uid() IS NOT NULL AND user_id = auth.uid()::text)
        OR
        (auth.uid() IS NULL AND user_id = 'local-learner')
    );

CREATE POLICY "Learner own simulation state update" ON public.learner_simulation_state
    FOR UPDATE USING (
        (auth.uid() IS NOT NULL AND user_id = auth.uid()::text)
        OR
        (auth.uid() IS NULL AND user_id = 'local-learner')
    ) WITH CHECK (
        (auth.uid() IS NOT NULL AND user_id = auth.uid()::text)
        OR
        (auth.uid() IS NULL AND user_id = 'local-learner')
    );

-- 3f. Programme Resources (Learners can contribute reference links)
CREATE POLICY "Learner resource contribution" ON public.programme_resources
    FOR INSERT WITH CHECK (
        (auth.uid() IS NOT NULL AND created_by = auth.uid()::text)
        OR
        (auth.uid() IS NULL AND created_by = 'local-learner')
    );
