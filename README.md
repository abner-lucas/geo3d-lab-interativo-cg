# Geo3D — Laboratório Interativo de Computação Gráfica

Aplicação web completa, moderna e acessível desenvolvida para as atividades práticas de **Computação Gráfica**, coordenada e orientada pelo **Prof. Me. Ábner Lucas**.

---

## 🌟 Principais Recursos e Diferenciais

1. **Acessibilidade Inclusiva (WCAG 2.2 AA):**
   - Projetada especificamente para estudantes surdos e usuários com baixa compreensão de leitura textual.
   - Comunicação eminentemente visual através de modelos 3D em tempo real, diagramas nítidos de planificações e ícones autoexplicativos.
   - Alternativa para todas as ações de arrastar e soltar por meio de clique direto e teclado.
   - Ausência completa de cronômetros e penalidades por tempo.
   - Modo de Movimento Reduzido (*Reduced Motion*) ativável com um clique.
   - Espaço reservado para inserção de vídeos reais de mediação em Libras.

2. **Laboratório 3D Interativo (Three.js):**
   - 5 sólidos fundamentais: **Cubo**, **Paralelepípedo**, **Prisma Triangular**, **Pirâmide de Base Quadrada** e **Cilindro**.
   - Animação matemática real de dobrar (*fold*) e desdobrar (*unfold*) o sólido em sua planificação bidimensional válida (especialmente a Cruz Latina 1-4-1 do cubo).
   - Rotação 3D livre por mouse/toque e por botões direcionais acessíveis.
   - Destaque colorido individualizado de faces, aproximação (zoom) e restauração de ponto de vista.

3. **Motor de Avaliação (10 Desafios em 5 Blocos Pedagógicos — Nota 10,0):**
   - **Bloco 1 (2,0 pts):** Reconhecimento 2D e 3D (Q1: Objeto 3D; Q2: Classificador 2D vs 3D).
   - **Bloco 2 (3,0 pts):** Planificações e Sólidos (Q3: Cubo; Q4: Prisma Triangular; Q5: Cilindro).
   - **Bloco 3 (2,0 pts):** Previsão e Dobradura Virtual (Q6: Previsão de sólido; Q7: Molde válido vs inválidos com validação animada).
   - **Bloco 4 (1,5 pts):** Manipulação 3D (Q8: Descoberta de face oposta escondida; Q9: Identificação da vista de cima).
   - **Bloco 5 (1,5 pts):** Composição de Formas (Q10: Construção de casa 3D com cubo e prisma triangular).

4. **Ambiente Docente Completo:**
   - Gestão de turmas e cadastro de estudantes por pseudônimos (em conformidade com a LGPD).
   - Geração de códigos individuais de acesso (ex: `GEO-ALUNA-01`).
   - Bloqueio e desbloqueio da avaliação oficial.
   - Métricas em tempo real: estudantes, tentativas em andamento, concluídas, média da turma e questão com maior taxa de erro.
   - Inspeção individual de cada uma das 10 questões respondidas.
   - Registro de observações pedagógicas.
   - Ajuste justificado de nota com auditoria completa (*Audit Log*).
   - Exportação de resultados em arquivo CSV.

---

## 🔑 Códigos de Demonstração

### Estudantes:
- `GEO-ALUNA-01` (Estudante 01 - Luiza)
- `GEO-ALUNO-02` (Estudante 02 - Gabriel - avaliação já preenchida para demonstração)
- `GEO-ALUNA-03` (Estudante 03 - Sofia)
- `GEO-ALUNO-04` (Estudante 04 - Lucas)

### Professor:
- Código de Acesso Docente: `PROF-2026`

---

## 🗄️ Banco de Dados (Supabase & PostgreSQL)

O arquivo com todo o schema DDL, índices e políticas de segurança RLS está em:
`/supabase/schema.sql`

### Como rodar no Supabase:
1. Crie um projeto em [supabase.com](https://supabase.com).
2. Abra o **SQL Editor** do projeto.
3. Cole o conteúdo de `/supabase/schema.sql` e clique em **Run**.
4. Configure as variáveis no seu `.env.local` ou na Vercel:
   ```env
   NEXT_PUBLIC_SUPABASE_URL="https://seu-id.supabase.co"
   NEXT_PUBLIC_SUPABASE_ANON_KEY="sua-anon-key"
   SUPABASE_SERVICE_ROLE_KEY="sua-service-role-key"
   ```

*Nota: Se as variáveis do Supabase não forem fornecidas, o Geo3D opera com seu motor de persistência servidor embutido, garantindo funcionamento imediato sem falhas.*

---

## 🚀 Publicação na Vercel

1. Suba o repositório no GitHub/GitLab.
2. Acesse [vercel.com](https://vercel.com) e importe o projeto.
3. Configure o Framework Preset como **Next.js**.
4. (Opcional) Adicione as variáveis do Supabase na seção *Environment Variables*.
5. Clique em **Deploy**.
