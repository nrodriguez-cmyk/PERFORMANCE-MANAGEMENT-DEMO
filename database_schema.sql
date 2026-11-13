-- ========================================================================
-- SISTEMA INTEGRAL DE GESTIÓN DEL DESEMPEÑO Y TALENTO — EL CANGURO, C.A.
-- Esquema Oficial de Base de Datos para PostgreSQL / Supabase
-- ========================================================================

-- 1. EXTENSIÓN PARA UUIDs (Opcional si se requiere generación nativa)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABLA: COLABORADORES (Censo Organizacional y Ficha Demográfica)
CREATE TABLE IF NOT EXISTS collaborators (
    id VARCHAR(64) PRIMARY KEY,
    id_number VARCHAR(32) UNIQUE NOT NULL,
    first_name VARCHAR(128) NOT NULL,
    last_name VARCHAR(128) NOT NULL,
    position VARCHAR(128) NOT NULL,
    department VARCHAR(128) NOT NULL,
    directorate VARCHAR(128) NOT NULL,
    location VARCHAR(128) DEFAULT 'Red de Tiendas',
    birth_date VARCHAR(32),
    hire_date VARCHAR(32),
    tenure_years NUMERIC(4,1) DEFAULT 0,
    study_field VARCHAR(128),
    education_degree VARCHAR(128),
    education_level VARCHAR(64) DEFAULT 'Diversificado',
    analytical_account VARCHAR(128),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_collab_id_num ON collaborators(id_number);
CREATE INDEX IF NOT EXISTS idx_collab_dir ON collaborators(directorate);
CREATE INDEX IF NOT EXISTS idx_collab_pos ON collaborators(position);

-- 2.0 TABLA: CATÁLOGO DE CARGOS Y NIVELES DE GESTIÓN
CREATE TABLE IF NOT EXISTS job_positions (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(128) UNIQUE NOT NULL,
    management_level VARCHAR(32) NOT NULL, -- 'ESTRATÉGICO', 'TÉCNICO / INTERMEDIO', 'OPERATIVO'
    directorate VARCHAR(128) NOT NULL,
    code VARCHAR(32),
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_job_pos_name ON job_positions(name);
CREATE INDEX IF NOT EXISTS idx_job_pos_level ON job_positions(management_level);
CREATE INDEX IF NOT EXISTS idx_job_pos_dir ON job_positions(directorate);

-- 2.1 TABLA: USUARIOS Y CREDENCIALES (Login: Usuario = Cédula, Password = Cédula)
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    collaborator_id VARCHAR(64) NOT NULL REFERENCES collaborators(id) ON DELETE CASCADE,
    username VARCHAR(32) UNIQUE NOT NULL,      -- Número de identificación (Cédula)
    password_hash VARCHAR(255) NOT NULL,       -- Número de identificación por defecto
    role VARCHAR(32) DEFAULT 'colaborador',    -- 'colaborador', 'supervisor', 'director', 'admin'
    management_level VARCHAR(32) NOT NULL,     -- 'ESTRATÉGICO', 'TÉCNICO', 'OPERATIVO'
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_collab ON users(collaborator_id);

-- 3. TABLA: EVALUACIONES (360°, 180°, Piloto, Promoción)
CREATE TABLE IF NOT EXISTS evaluations (
    id VARCHAR(128) PRIMARY KEY,
    collaborator_id VARCHAR(64) NOT NULL REFERENCES collaborators(id) ON DELETE CASCADE,
    evaluator_name VARCHAR(128),
    evaluator_position VARCHAR(128),
    evaluator_role VARCHAR(32) NOT NULL, -- 'self', 'supervisor', 'peer', 'subordinate', 'hr', 'promotion'
    evaluation_type VARCHAR(32) DEFAULT 'standard', -- 'standard', 'pilot', 'promotion'
    period VARCHAR(32) DEFAULT '2026-Q1',
    scores JSONB DEFAULT '{}'::jsonb,
    checked_behaviors JSONB DEFAULT '{}'::jsonb,
    open_answers JSONB DEFAULT '{}'::jsonb,
    comments TEXT,
    final_score NUMERIC(4,2) DEFAULT 0,
    final_percent NUMERIC(5,2) DEFAULT 0,
    is_locked BOOLEAN DEFAULT FALSE,
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_eval_collab ON evaluations(collaborator_id);
CREATE INDEX IF NOT EXISTS idx_eval_role ON evaluations(evaluator_role);
CREATE INDEX IF NOT EXISTS idx_eval_period ON evaluations(period);

-- 4. TABLA: PLANES DE DESARROLLO INDIVIDUAL (PDI)
CREATE TABLE IF NOT EXISTS pdi_records (
    id VARCHAR(128) PRIMARY KEY,
    collaborator_id VARCHAR(64) NOT NULL REFERENCES collaborators(id) ON DELETE CASCADE,
    mentor_name VARCHAR(128),
    mentor_role VARCHAR(128),
    goals JSONB DEFAULT '[]'::jsonb,
    breaches JSONB DEFAULT '[]'::jsonb,
    signatures JSONB DEFAULT '{}'::jsonb,
    status VARCHAR(32) DEFAULT 'En Ejecución',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pdi_collab ON pdi_records(collaborator_id);

-- 5. TABLA: PROCESOS DE PROMOCIÓN Y SUCESIÓN
CREATE TABLE IF NOT EXISTS promotion_records (
    id VARCHAR(128) PRIMARY KEY,
    collaborator_id VARCHAR(64) NOT NULL REFERENCES collaborators(id) ON DELETE CASCADE,
    target_position VARCHAR(128) NOT NULL,
    current_position VARCHAR(128) NOT NULL,
    status VARCHAR(32) DEFAULT 'En Evaluación', -- 'En Evaluación', 'Aprobado', 'No Aprobado', 'En Reserva'
    committee_decision VARCHAR(32),
    readiness_level VARCHAR(32), -- 'Listo Ya (0-6 meses)', 'Mediano Plazo (6-12 meses)', 'Largo Plazo (1-2 años)'
    candidate_scores JSONB DEFAULT '{}'::jsonb,
    supervisor_scores JSONB DEFAULT '{}'::jsonb,
    committee_feedback JSONB DEFAULT '{}'::jsonb,
    nine_box_quadrant VARCHAR(64),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_prom_collab ON promotion_records(collaborator_id);

-- 6. TABLA: PERFILES PSICOMÉTRICOS BIG FIVE (OCEAN)
CREATE TABLE IF NOT EXISTS psychometric_profiles (
    id VARCHAR(128) PRIMARY KEY,
    collaborator_id VARCHAR(64) NOT NULL REFERENCES collaborators(id) ON DELETE CASCADE,
    openness NUMERIC(5,2) DEFAULT 0,
    conscientiousness NUMERIC(5,2) DEFAULT 0,
    extraversion NUMERIC(5,2) DEFAULT 0,
    agreeableness NUMERIC(5,2) DEFAULT 0,
    neuroticism NUMERIC(5,2) DEFAULT 0,
    archetype VARCHAR(128),
    report_markdown TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_psycho_collab ON psychometric_profiles(collaborator_id);
