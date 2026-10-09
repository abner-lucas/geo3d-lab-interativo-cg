-- ==============================================================================
-- Geo3D — Laboratório Interativo de Computação Gráfica
-- Schema PostgreSQL com Row Level Security (RLS) para Supabase
-- ==============================================================================

-- 1. EXTENSÕES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABELA DE PROFESSORES
CREATE TABLE IF NOT EXISTS teachers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth_id UUID UNIQUE, -- ID do Supabase Auth (se aplicável)
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL DEFAULT 'teacher' CHECK (role IN ('teacher', 'coordinator')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. TABELA DE TURMAS
CREATE TABLE IF NOT EXISTS classes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    teacher_id UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    year_period TEXT NOT NULL,
    is_assessment_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. TABELA DE ESTUDANTES (LGPD: Apenas pseudônimo e código individual, sem dados sensíveis)
CREATE TABLE IF NOT EXISTS students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    pseudonym TEXT NOT NULL,
    display_number INT NOT NULL DEFAULT 1,
    access_code TEXT NOT NULL UNIQUE,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. TABELA DE AVALIAÇÕES
CREATE TABLE IF NOT EXISTS assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    description TEXT,
    max_score NUMERIC(4,2) NOT NULL DEFAULT 10.00,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 6. TABELA DE TENTATIVAS DE AVALIAÇÃO
CREATE TABLE IF NOT EXISTS attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
    mode TEXT NOT NULL DEFAULT 'EVALUATION' CHECK (mode IN ('PRACTICE', 'EVALUATION')),
    status TEXT NOT NULL DEFAULT 'IN_PROGRESS' CHECK (status IN ('IN_PROGRESS', 'SUBMITTED', 'REVIEWED')),
    total_score NUMERIC(4,2) NOT NULL DEFAULT 0.00,
    score_adjusted NUMERIC(4,2),
    adjustment_justification TEXT,
    adjusted_by UUID REFERENCES teachers(id),
    started_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    submitted_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 7. TABELA DE RESPOSTAS INDIVIDUAIS
CREATE TABLE IF NOT EXISTS responses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    attempt_id UUID NOT NULL REFERENCES attempts(id) ON DELETE CASCADE,
    question_id INT NOT NULL,
    block_id TEXT NOT NULL,
    answer_data JSONB NOT NULL,
    is_correct BOOLEAN NOT NULL,
    score NUMERIC(4,2) NOT NULL DEFAULT 0.00,
    points_possible NUMERIC(4,2) NOT NULL,
    interaction_type TEXT,
    answered_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_attempt_question UNIQUE (attempt_id, question_id)
);

-- 8. TABELA DE AUDITORIA E HISTÓRICO DE AJUSTES DE NOTA
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    teacher_id UUID NOT NULL REFERENCES teachers(id),
    student_id UUID NOT NULL REFERENCES students(id),
    action TEXT NOT NULL,
    justification TEXT NOT NULL,
    previous_score NUMERIC(4,2) NOT NULL,
    new_score NUMERIC(4,2) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- ÍNDICES DE PERFORMANCE
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_students_access_code ON students(access_code);
CREATE INDEX IF NOT EXISTS idx_students_class_id ON students(class_id);
CREATE INDEX IF NOT EXISTS idx_attempts_student_id ON attempts(student_id);
CREATE INDEX IF NOT EXISTS idx_responses_attempt_id ON responses(attempt_id);

-- ==============================================================================
-- POLÍTICAS DE SEGURANÇA (ROW LEVEL SECURITY - RLS)
-- ==============================================================================
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Regra para Professores: apenas o professor autenticado pode ler e modificar suas turmas
CREATE POLICY "Professores acessam seus proprios dados"
    ON teachers FOR ALL
    USING (auth.uid() = auth_id);

CREATE POLICY "Professores gerenciam suas turmas"
    ON classes FOR ALL
    USING (teacher_id IN (SELECT id FROM teachers WHERE auth_id = auth.uid()));

CREATE POLICY "Professores gerenciam seus estudantes"
    ON students FOR ALL
    USING (class_id IN (
        SELECT id FROM classes WHERE teacher_id IN (SELECT id FROM teachers WHERE auth_id = auth.uid())
    ));

CREATE POLICY "Estudantes leem apenas suas proprias tentativas via codigo"
    ON attempts FOR SELECT
    USING (true); -- Controle fino gerenciado por Service Role na API Next.js

CREATE POLICY "Insercao e atualizacao de tentativas via API"
    ON attempts FOR ALL
    USING (true);

CREATE POLICY "Respostas registradas por tentativa"
    ON responses FOR ALL
    USING (true);

-- ==============================================================================
-- DADOS INICIAIS DE DEMONSTRAÇÃO (SEED)
-- ==============================================================================
INSERT INTO assessments (id, code, title, description, max_score, is_active)
VALUES (
    'a0000000-0000-0000-0000-000000000001',
    'GEO-3AVAL-2026', 
    '3ª Avaliação de Computação Gráfica — 2D, Planificações e Sólidos 3D', 
    'Avaliação interativa e acessível com 10 questões práticas.', 
    10.00, 
    true
) ON CONFLICT (code) DO NOTHING;

-- Professor Padrão
INSERT INTO teachers (id, name, email, role)
VALUES (
    't0000000-0000-0000-0000-000000000001',
    'Prof. Marcos Rocha',
    'prof@geo3d.edu.br',
    'teacher'
) ON CONFLICT (email) DO NOTHING;

-- Turma Padrão
INSERT INTO classes (id, teacher_id, code, name, year_period, is_assessment_active)
VALUES (
    'c0000000-0000-0000-0000-000000000001',
    't0000000-0000-0000-0000-000000000001',
    'TURMA-INFO3',
    '3º Ano Informática Integrado - Manhã',
    '2026.1',
    true
) ON CONFLICT (code) DO NOTHING;

-- Estudantes Iniciais
INSERT INTO students (id, class_id, pseudonym, display_number, access_code, notes)
VALUES 
(
    's0000000-0000-0000-0000-000000000001',
    'c0000000-0000-0000-0000-000000000001',
    'Estudante 01 (Luiza)',
    1,
    'GEO-ALUNA-01',
    'Estudante com preferência por instruções visuais diretas e animações de dobradura.'
),
(
    's0000000-0000-0000-0000-000000000002',
    'c0000000-0000-0000-0000-000000000001',
    'Estudante 02 (Gabriel)',
    2,
    'GEO-ALUNO-02',
    'Boa percepção espacial, explorou os sólidos no laboratório prévio.'
),
(
    's0000000-0000-0000-0000-000000000003',
    'c0000000-0000-0000-0000-000000000001',
    'Estudante 03 (Sofia)',
    3,
    'GEO-ALUNA-03',
    ''
),
(
    's0000000-0000-0000-0000-000000000004',
    'c0000000-0000-0000-0000-000000000001',
    'Estudante 04 (Lucas)',
    4,
    'GEO-ALUNO-04',
    ''
)
ON CONFLICT (access_code) DO NOTHING;

