import { chromium } from 'playwright';

const BASE_URL = 'http://localhost:3000';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function runFullSimulation() {
  console.log('🚀 Iniciando Simulação Completa de Interações com img2threejs...');

  // 1. Obter classId e criar estudante exclusivo para o teste
  const classesRes = await fetch(`${BASE_URL}/api/teacher/classes`).then(r => r.json());
  const classId = classesRes.classes[0].id;
  
  const createStudentRes = await fetch(`${BASE_URL}/api/teacher/students`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ classId, pseudonym: 'Estudante Validação 3D' })
  }).then(r => r.json());
  
  const testStudent = createStudentRes.student;
  console.log(`👤 Estudante de teste criado: ${testStudent.pseudonym} (${testStudent.accessCode})`);

  const browser = await chromium.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-webgl', '--no-sandbox']
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 850 }
  });

  const page = await context.newPage();

  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
      console.error('❌ Browser Console Error:', msg.text());
    }
  });

  page.on('pageerror', err => {
    consoleErrors.push(err.message);
    console.error('❌ Browser Page Uncaught Error:', err.message);
  });

  try {
    // =========================================================================
    // ETAPA 1: LABORATÓRIO DE EXPLORAÇÃO LIVRE (TODOS OS 5 SÓLIDOS IMG2THREEJS)
    // =========================================================================
    console.log('\n--- 1. Testando Modo de Exploração Livre e Animações 3D ---');
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });

    // Navegar para o Laboratório 3D pelo cabeçalho
    const labHeaderBtn = page.locator('header button:has-text("Laboratório 3D")').first();
    await labHeaderBtn.click();
    await page.waitForTimeout(800);

    const solids = [
      { name: 'Cubo', id: 'cube' },
      { name: 'Paralelepípedo', id: 'cuboid' },
      { name: 'Prisma Triangular', id: 'triangular_prism' },
      { name: 'Pirâmide Quadrada', id: 'square_pyramid' },
      { name: 'Cilindro', id: 'cylinder' }
    ];

    for (const solid of solids) {
      console.log(`\n  ➡️ Testando sólido: ${solid.name} (${solid.id})`);
      
      // Clicar na aba do sólido
      const solidTab = page.locator(`button:has-text("${solid.name}")`).first();
      await solidTab.click();
      await page.waitForTimeout(600);

      // Verificar presença do canvas 3D
      const canvasEl = page.locator('canvas').first();
      await canvasEl.waitFor({ state: 'visible', timeout: 5000 });

      // Testar interação de desdobramento (Abrir Planificação)
      const openFoldBtn = page.locator('button:has-text("ABRIR PLANIFICAÇÃO")').first();
      if (await openFoldBtn.isVisible()) {
        console.log('    Animando abertura da planificação...');
        await openFoldBtn.click();
        await page.waitForTimeout(1400); // Aguardar duração da animação (1100ms)
        
        // Verificar se virou botão de fechar
        const closeFoldBtn = page.locator('button:has-text("FECHAR SÓLIDO 3D")').first();
        const hasClose = await closeFoldBtn.isVisible();
        console.log('    Planificação aberta com sucesso? ', hasClose);

        // Testar fechar de volta
        console.log('    Animando fechamento do sólido 3D...');
        await closeFoldBtn.click();
        await page.waitForTimeout(1400);
      }

      // Testar separação de faces no espaço 3D (Vista Explodida)
      const explodeBtn = page.locator('button[title*="Separar faces"], button[aria-label="Separar faces em 3D"]').first();
      if (await explodeBtn.isVisible()) {
        console.log('    Testando vista explodida de faces...');
        await explodeBtn.click();
        await page.waitForTimeout(900);
        await explodeBtn.click(); // Reagrupar
        await page.waitForTimeout(900);
      }

      // Testar botões de rotação directional e reset
      const rotateUp = page.locator('button[title="Girar para Cima"]').first();
      if (await rotateUp.isVisible()) {
        await rotateUp.click();
        await page.waitForTimeout(200);
      }
      const resetBtn = page.locator('button[title="Restaurar Posição Inicial"]').first();
      if (await resetBtn.isVisible()) {
        await resetBtn.click();
        await page.waitForTimeout(300);
      }

      // Testar hover raycasting na tela 3D
      const box = await canvasEl.boundingBox();
      if (box) {
        await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
        await page.waitForTimeout(300);
      }
    }

    // =========================================================================
    // ETAPA 2: MODO TREINO (3 QUESTÕES SIMPLES)
    // =========================================================================
    console.log('\n--- 2. Testando Modo Treino (Ambientação) ---');
    // Voltar para Home / Login
    const studentHeaderBtn = page.locator('header button:has-text("Estudante")').first();
    await studentHeaderBtn.click();
    await page.waitForTimeout(600);

    // Selecionar Modo Treino e digitar código
    const practiceModeBtn = page.locator('button:has-text("MODO TREINO")').first();
    await practiceModeBtn.click();
    await page.waitForTimeout(300);

    const codeInput = page.locator('input[placeholder*="GEO-"]').first();
    await codeInput.fill(testStudent.accessCode);
    await page.waitForTimeout(300);

    const loginSubmitBtn = page.locator('button[type="submit"]').first();
    await loginSubmitBtn.click();
    await page.waitForTimeout(1500);

    // Treino Passo 1: Selecionar Linha Reta
    console.log('  ➡️ Treino Passo 1: Marcando Linha Reta...');
    const straightLineOption = page.locator('button:has-text("Linha Reta")').first();
    await straightLineOption.click();
    await page.waitForTimeout(400);

    const nextBtn1 = page.locator('button:has-text("Próximo Passo")').first();
    await nextBtn1.click();
    await page.waitForTimeout(800);

    // Treino Passo 2: Visualizador 3D cuboid
    console.log('  ➡️ Treino Passo 2: Interagindo com 3D e marcando opção...');
    const openFoldPractice = page.locator('button:has-text("ABRIR PLANIFICAÇÃO")').first();
    if (await openFoldPractice.isVisible()) {
      await openFoldPractice.click();
      await page.waitForTimeout(1300);
    }
    const optionPractice2 = page.locator('button:has-text("As partes se abrem")').first();
    await optionPractice2.click();
    await page.waitForTimeout(400);

    const nextBtn2 = page.locator('button:has-text("Próximo Passo")').first();
    await nextBtn2.click();
    await page.waitForTimeout(800);

    // Treino Passo 3: Encaixe das peças
    console.log('  ➡️ Treino Passo 3: Encaixando peças...');
    const blueBtn = page.locator('button:has-text("Colocar Azul")').first();
    await blueBtn.click();
    await page.waitForTimeout(300);

    const yellowBtn = page.locator('button:has-text("Colocar Amarela")').last();
    await yellowBtn.click();
    await page.waitForTimeout(300);

    const finishPracticeBtn = page.locator('button:has-text("CONCLUIR TREINO")').first();
    await finishPracticeBtn.click();
    await page.waitForTimeout(500);

    const confirmPracticeBtn = page.locator('button:has-text("Confirmar e Enviar")').first();
    if (await confirmPracticeBtn.isVisible()) {
      await confirmPracticeBtn.click();
      await page.waitForTimeout(1200);
    }
    console.log('  🎉 Modo Treino concluído com sucesso!');

    // =========================================================================
    // ETAPA 3: MODO AVALIAÇÃO (QUESTÕES 1 A 10 COM IMG2THREEJS E CASA 3D)
    // =========================================================================
    console.log('\n--- 3. Testando Modo Avaliação e Composição 3D (Questão 10) ---');
    const exitPracticeBtn = page.locator('button:has-text("Voltar para a Tela Inicial")').first();
    await exitPracticeBtn.waitFor({ state: 'visible', timeout: 10000 });
    await exitPracticeBtn.click();
    await page.waitForTimeout(800);

    // Selecionar Modo Avaliação e digitar código
    const evalModeBtn = page.locator('button:has-text("MODO AVALIAÇÃO")').first();
    await evalModeBtn.click();
    await page.waitForTimeout(300);

    const codeInputEval = page.locator('input[placeholder*="GEO-"]').first();
    await codeInputEval.fill(testStudent.accessCode);
    await page.waitForTimeout(300);

    const evalSubmitBtn = page.locator('button[type="submit"]').first();
    await evalSubmitBtn.click();
    await page.waitForTimeout(1500);

    // Questão 1 (Cubo)
    console.log('  ➡️ Questão 1: Selecionando Cubo (Figura C)...');
    const q1Cubo = page.locator('button:has-text("Figura C")').first();
    await q1Cubo.click();
    await page.waitForTimeout(400);
    await page.locator('button:has-text("Próxima")').first().click();
    await page.waitForTimeout(800);

    // Questão 2 (Classificador 2D vs 3D)
    console.log('  ➡️ Questão 2: Classificando figuras 2D e 3D...');
    const btn2D = page.locator('button:has-text("2D")');
    const count2D = await btn2D.count();
    for (let i = 0; i < count2D; i++) {
      await btn2D.nth(i).click().catch(() => {});
      await page.waitForTimeout(150);
    }
    await page.locator('button:has-text("Próxima")').first().click();
    await page.waitForTimeout(800);

    // Questão 3 (Cilindro)
    console.log('  ➡️ Questão 3: Identificando Cilindro...');
    const q3Cylinder = page.locator('button:has-text("Cilindro")').first();
    await q3Cylinder.click();
    await page.waitForTimeout(400);
    await page.locator('button:has-text("Próxima")').first().click();
    await page.waitForTimeout(800);

    // Navegar até a Questão 8
    console.log('  ➡️ Navegando até Questão 8...');
    for (let q = 4; q <= 7; q++) {
      const anyOpt = page.locator('button[aria-pressed]').first();
      if (await anyOpt.isVisible()) await anyOpt.click();
      await page.waitForTimeout(300);
      await page.locator('button:has-text("Próxima")').first().click();
      await page.waitForTimeout(800);
    }

    // Questão 8: Cor da face oposta à azul no Cubo 3D
    console.log('  ➡️ Questão 8: Interagindo com Cubo 3D e selecionando Vermelho...');
    const q8Canvas = page.locator('canvas').first();
    await q8Canvas.waitFor({ state: 'visible' });
    const rotateRight = page.locator('button[title="Girar para Direita"]').first();
    if (await rotateRight.isVisible()) {
      await rotateRight.click();
      await rotateRight.click();
      await page.waitForTimeout(300);
    }
    const redOption = page.locator('button:has-text("Vermelho"), button:has-text("Vermelha")').first();
    await redOption.click();
    await page.waitForTimeout(400);
    await page.locator('button:has-text("Próxima")').first().click();
    await page.waitForTimeout(800);

    // Questão 9: Vista Superior Prisma
    console.log('  ➡️ Questão 9: Vista superior do Prisma...');
    const vistaA = page.locator('button:has-text("Vista A")').first();
    await vistaA.click();
    await page.waitForTimeout(400);
    await page.locator('button:has-text("Próxima")').first().click();
    await page.waitForTimeout(800);

    // Questão 10: Composição da Casa 3D com live preview!
    console.log('  ➡️ Questão 10: Montando Casa 3D (Cubo na Base + Prisma no Telhado)...');
    const baseBtn = page.locator('button:has-text("Pôr na Base")').first(); // Cubo
    await baseBtn.click();
    await page.waitForTimeout(500);

    const roofBtn = page.locator('button:has-text("Pôr no Telhado")').nth(1); // Prisma Triangular
    await roofBtn.click();
    await page.waitForTimeout(600);

    const completedText = page.locator('text=Estrutura completa');
    const isComplete = await completedText.isVisible();
    console.log('    Estrutura da Casa 3D completa com sucesso? ', isComplete);

    // Finalizar avaliação
    const finishEvalBtn = page.locator('button:has-text("FINALIZAR AVALIAÇÃO")').first();
    await finishEvalBtn.click();
    await page.waitForTimeout(600);

    // Confirmar modal
    const confirmBtn = page.locator('button:has-text("Confirmar e Enviar")').first();
    await confirmBtn.click();
    await page.waitForTimeout(1500);
    console.log('  🎉 Avaliação entregue e corrigida com sucesso!');

    console.log('\n======================================================');
    if (consoleErrors.length === 0) {
      console.log('✅ TODAS AS SIMULAÇÕES E ANIMAÇÕES CONCLUÍDAS COM 0 ERROS!');
    } else {
      console.warn(`⚠️ Concluído com ${consoleErrors.length} avisos/erros no console:`, consoleErrors);
    }
    console.log('======================================================\n');

  } catch (err) {
    console.error('❌ Falha na simulação:', err);
  } finally {
    // Limpar estudante de teste do banco
    if (testStudent?.id) {
      await fetch(`${BASE_URL}/api/teacher/students?studentId=${testStudent.id}`, { method: 'DELETE' });
      console.log(`🧹 Estudante de teste ${testStudent.id} removido.`);
    }
    await browser.close();
  }
}

runFullSimulation();
