-- ==============================================================================
-- Migration: 20261115000001_initial_schema.sql
-- Description: Normalized schema for ShadowXLab Cybersecurity Academy
-- Target: PostgreSQL 15+ / Supabase
-- Version: 1.1.0 (Audited & Hardened)
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- Helper: updated_at trigger function
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ------------------------------------------------------------------------------
-- 1. Table: programmes
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.programmes (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    instructor TEXT NOT NULL DEFAULT '',
    location TEXT NOT NULL DEFAULT '',
    start_date DATE,
    end_date DATE,
    duration_label TEXT NOT NULL DEFAULT '',
    initial_progress INTEGER NOT NULL DEFAULT 0 CHECK (initial_progress >= 0 AND initial_progress <= 100),
    published BOOLEAN NOT NULL DEFAULT false,
    archived BOOLEAN NOT NULL DEFAULT false,
    capstone_title TEXT NOT NULL DEFAULT '',
    completion_rules JSONB NOT NULL DEFAULT '{"completeAllSessions": true, "passScore": 70}'::jsonb,
    is_system_seed BOOLEAN NOT NULL DEFAULT false,
    seed_version INTEGER NOT NULL DEFAULT 1,
    customized_by_user BOOLEAN NOT NULL DEFAULT false,
    created_by TEXT NOT NULL DEFAULT 'system',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_programmes_published ON public.programmes(published);
CREATE INDEX IF NOT EXISTS idx_programmes_archived ON public.programmes(archived);
CREATE INDEX IF NOT EXISTS idx_programmes_seed ON public.programmes(is_system_seed, seed_version);

DROP TRIGGER IF EXISTS trg_programmes_updated_at ON public.programmes;
CREATE TRIGGER trg_programmes_updated_at
    BEFORE UPDATE ON public.programmes
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ------------------------------------------------------------------------------
-- 2. Table: programme_days
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.programme_days (
    programme_id TEXT NOT NULL REFERENCES public.programmes(id) ON DELETE CASCADE,
    day_id TEXT NOT NULL,
    day_index INTEGER NOT NULL,
    title TEXT NOT NULL,
    topics TEXT[] NOT NULL DEFAULT '{}',
    is_system_seed BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    PRIMARY KEY (programme_id, day_id)
);

CREATE INDEX IF NOT EXISTS idx_programme_days_order ON public.programme_days(programme_id, day_index);

DROP TRIGGER IF EXISTS trg_programme_days_updated_at ON public.programme_days;
CREATE TRIGGER trg_programme_days_updated_at
    BEFORE UPDATE ON public.programme_days
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ------------------------------------------------------------------------------
-- 3. Table: programme_sessions
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.programme_sessions (
    id TEXT NOT NULL,
    programme_id TEXT NOT NULL,
    day_id TEXT NOT NULL,
    session_index INTEGER NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    title TEXT NOT NULL,
    kind TEXT NOT NULL CHECK (kind IN ('lesson', 'lab', 'capstone', 'assessment')),
    description TEXT NOT NULL DEFAULT '',
    is_system_seed BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    PRIMARY KEY (programme_id, id),
    FOREIGN KEY (programme_id, day_id) REFERENCES public.programme_days(programme_id, day_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_sessions_lookup ON public.programme_sessions(programme_id, day_id, session_index);
CREATE INDEX IF NOT EXISTS idx_sessions_session_id ON public.programme_sessions(id);

DROP TRIGGER IF EXISTS trg_programme_sessions_updated_at ON public.programme_sessions;
CREATE TRIGGER trg_programme_sessions_updated_at
    BEFORE UPDATE ON public.programme_sessions
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ------------------------------------------------------------------------------
-- 4. Table: programme_labs
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.programme_labs (
    id TEXT NOT NULL,
    programme_id TEXT NOT NULL,
    day_id TEXT NOT NULL,
    title TEXT NOT NULL,
    instructions TEXT[] NOT NULL DEFAULT '{}',
    checklist TEXT[] NOT NULL DEFAULT '{}',
    is_system_seed BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    PRIMARY KEY (programme_id, id),
    FOREIGN KEY (programme_id, day_id) REFERENCES public.programme_days(programme_id, day_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_labs_lookup ON public.programme_labs(programme_id, day_id);
CREATE INDEX IF NOT EXISTS idx_labs_lab_id ON public.programme_labs(id);

DROP TRIGGER IF EXISTS trg_programme_labs_updated_at ON public.programme_labs;
CREATE TRIGGER trg_programme_labs_updated_at
    BEFORE UPDATE ON public.programme_labs
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ------------------------------------------------------------------------------
-- 5. Table: programme_assessments
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.programme_assessments (
    id TEXT NOT NULL,
    programme_id TEXT NOT NULL REFERENCES public.programmes(id) ON DELETE CASCADE,
    question_index INTEGER NOT NULL,
    prompt TEXT NOT NULL,
    options TEXT[] NOT NULL DEFAULT '{}',
    answer INTEGER NOT NULL DEFAULT 0,
    is_system_seed BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    PRIMARY KEY (programme_id, id)
);

CREATE INDEX IF NOT EXISTS idx_assessments_order ON public.programme_assessments(programme_id, question_index);

DROP TRIGGER IF EXISTS trg_programme_assessments_updated_at ON public.programme_assessments;
CREATE TRIGGER trg_programme_assessments_updated_at
    BEFORE UPDATE ON public.programme_assessments
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ------------------------------------------------------------------------------
-- 6. Table: programme_resources
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.programme_resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    programme_id TEXT NOT NULL REFERENCES public.programmes(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    url TEXT NOT NULL DEFAULT '',
    kind TEXT NOT NULL DEFAULT 'Reference',
    created_by TEXT NOT NULL DEFAULT 'system',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_resources_programme ON public.programme_resources(programme_id);

-- ------------------------------------------------------------------------------
-- 7. Table: learner_session_progress
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.learner_session_progress (
    user_id TEXT NOT NULL DEFAULT 'local-learner',
    programme_id TEXT NOT NULL,
    session_id TEXT NOT NULL,
    completed BOOLEAN NOT NULL DEFAULT true,
    completed_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    PRIMARY KEY (user_id, programme_id, session_id),
    FOREIGN KEY (programme_id, session_id) REFERENCES public.programme_sessions(programme_id, id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_learner_session_progress_user ON public.learner_session_progress(user_id);

-- ------------------------------------------------------------------------------
-- 8. Table: learner_lab_progress
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.learner_lab_progress (
    user_id TEXT NOT NULL DEFAULT 'local-learner',
    programme_id TEXT NOT NULL,
    checklist_key TEXT NOT NULL, -- Format: "<lab_id>-<index>"
    checked BOOLEAN NOT NULL DEFAULT true,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    PRIMARY KEY (user_id, programme_id, checklist_key),
    FOREIGN KEY (programme_id) REFERENCES public.programmes(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_learner_lab_progress_user ON public.learner_lab_progress(user_id);

DROP TRIGGER IF EXISTS trg_learner_lab_progress_updated_at ON public.learner_lab_progress;
CREATE TRIGGER trg_learner_lab_progress_updated_at
    BEFORE UPDATE ON public.learner_lab_progress
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ------------------------------------------------------------------------------
-- 9. Table: session_attendance
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.session_attendance (
    user_id TEXT NOT NULL DEFAULT 'local-learner',
    programme_id TEXT NOT NULL,
    session_id TEXT NOT NULL,
    attended BOOLEAN NOT NULL DEFAULT true,
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    PRIMARY KEY (user_id, programme_id, session_id),
    FOREIGN KEY (programme_id, session_id) REFERENCES public.programme_sessions(programme_id, id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_session_attendance_user ON public.session_attendance(user_id);

-- ------------------------------------------------------------------------------
-- 10. Table: assessment_attempts
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.assessment_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL DEFAULT 'local-learner',
    programme_id TEXT NOT NULL REFERENCES public.programmes(id) ON DELETE CASCADE,
    score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
    answers JSONB NOT NULL DEFAULT '{}'::jsonb,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_assessment_attempts_user ON public.assessment_attempts(user_id, programme_id);

-- ------------------------------------------------------------------------------
-- 11. Table: learner_simulation_state
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.learner_simulation_state (
    user_id TEXT NOT NULL DEFAULT 'local-learner',
    programme_id TEXT NOT NULL REFERENCES public.programmes(id) ON DELETE CASCADE,
    firewall_enabled BOOLEAN NOT NULL DEFAULT true,
    nat_enabled BOOLEAN NOT NULL DEFAULT false,
    vpn_connected BOOLEAN NOT NULL DEFAULT false,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    PRIMARY KEY (user_id, programme_id)
);

CREATE INDEX IF NOT EXISTS idx_learner_simulation_user ON public.learner_simulation_state(user_id);

DROP TRIGGER IF EXISTS trg_learner_simulation_state_updated_at ON public.learner_simulation_state;
CREATE TRIGGER trg_learner_simulation_state_updated_at
    BEFORE UPDATE ON public.learner_simulation_state
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
