-- Políticas permissivas para a API do Next.js operar perfeitamente
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Permitir leitura de estudantes" ON students;
    CREATE POLICY "Permitir leitura de estudantes" ON students FOR SELECT USING (true);
    
    DROP POLICY IF EXISTS "Permitir escrita de estudantes" ON students;
    CREATE POLICY "Permitir escrita de estudantes" ON students FOR ALL USING (true);

    DROP POLICY IF EXISTS "Permitir leitura de turmas" ON classes;
    CREATE POLICY "Permitir leitura de turmas" ON classes FOR SELECT USING (true);

    DROP POLICY IF EXISTS "Permitir escrita de turmas" ON classes;
    CREATE POLICY "Permitir escrita de turmas" ON classes FOR ALL USING (true);

    DROP POLICY IF EXISTS "Permitir escrita de professores" ON teachers;
    CREATE POLICY "Permitir escrita de professores" ON teachers FOR ALL USING (true);

    DROP POLICY IF EXISTS "Permitir operacoes de auditoria" ON audit_logs;
    CREATE POLICY "Permitir operacoes de auditoria" ON audit_logs FOR ALL USING (true);
END $$;
