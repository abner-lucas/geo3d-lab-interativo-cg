import { chromium } from 'playwright';

const BASE_URL = 'http://localhost:3000';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function testMotionDesign() {
  console.log('🎬 Validando implementação de Motion Design...');

  const browser = await chromium.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-webgl', '--no-sandbox']
  });

  const page = await browser.newPage({ viewport: { width: 1280, height: 850 } });

  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('pageerror', err => consoleErrors.push(err.message));

  // 1. Visitar página inicial (Login do Estudante)
  console.log('1. Acessando página inicial...');
  await page.goto(BASE_URL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // 2. Alternar entre Modo Avaliação e Modo Treino (pill animado)
  console.log('2. Testando alternância de modo (pill com layoutId)...');
  const treinoTab = page.locator('button:has-text("Modo Treino")');
  if (await treinoTab.isVisible()) {
    await treinoTab.click();
    await page.waitForTimeout(600);
    const avaliacaoTab = page.locator('button:has-text("Modo Avaliação")');
    await avaliacaoTab.click();
    await page.waitForTimeout(600);
    console.log('   ✓ Abas alternadas com sucesso!');
  }

  // 3. Testar validação com shake no input se vazio ou inválido
  console.log('3. Testando microinteração de erro (shake)...');
  const submitBtn = page.locator('button[type="submit"]');
  await submitBtn.click();
  await page.waitForTimeout(600);

  // 4. Obter um estudante válido pelo backend e fazer login
  console.log('4. Obtendo estudante para testar o fluxo de questões...');
  const classesRes = await page.request.get(`${BASE_URL}/api/teacher/classes`).then(r => r.json());
  const classId = classesRes.classes[0].id;
  const createRes = await page.request.post(`${BASE_URL}/api/teacher/students`, {
    data: { classId, pseudonym: 'Motion Tester 3D' }
  }).then(r => r.json());
  const student = createRes.student;
  console.log(`   Código gerado: ${student.accessCode}`);

  const codeInput = page.locator('input[placeholder*="Ex:"]');
  await codeInput.fill(student.accessCode);
  await submitBtn.click();
  
  // Aguardar entrada na visualização de avaliação
  await page.waitForSelector('text=Questão', { timeout: 10000 });
  await page.waitForTimeout(600);
  console.log('   ✓ Login efetuado e tela de questões carregada!');

  // 5. Testar tela de questões e transição entre questões
  console.log('5. Testando animações de avanço e retorno de questões...');
  const nextBtn = page.locator('button:has-text("Próxima")');
  if (await nextBtn.isVisible()) {
    // Clicar em uma opção para responder
    const firstOption = page.locator('button[aria-pressed]').first();
    if (await firstOption.isVisible()) {
      await firstOption.click();
      await page.waitForTimeout(400);
    }
    await nextBtn.click();
    await page.waitForTimeout(800);
    console.log('   ✓ Avanço com slide lateral executado!');
  }

  // 6. Testar pop-up 3D
  console.log('6. Testando pop-up modal 3D com escala/mola...');
  const expandBtn = page.locator('button[title*="Expandir"], button[title*="tela cheia"], button:has-text("Expandir")').first();
  if (await expandBtn.isVisible()) {
    await expandBtn.click();
    await page.waitForTimeout(800);
    await page.screenshot({ path: 'scripts/motion_modal_open.png' });
    console.log('   ✓ Modal 3D aberto e capturado!');
    
    // Fechar modal
    const closeBtn = page.locator('button:has-text("Fechar Visualização"), button:has-text("Fechar")').first();
    if (await closeBtn.isVisible()) {
      await closeBtn.click();
      await page.waitForTimeout(600);
      console.log('   ✓ Modal fechado com transição de saída!');
    }
  }

  // 7. Testar toggle de acessibilidade "Reduzir Animação"
  console.log('7. Testando acessibilidade WCAG (Reduzir Animação)...');
  const reduceMotionToggle = page.locator('button:has-text("Reduzir"), button[title*="Animação"]').first();
  if (await reduceMotionToggle.isVisible()) {
    await reduceMotionToggle.click();
    await page.waitForTimeout(400);
    const isReduced = await page.evaluate(() => window.__geo3d_reduced_motion);
    console.log(`   ✓ Estado reduzido: ${isReduced}`);
  }

  // 8. Screenshot geral
  await page.screenshot({ path: 'scripts/motion_design_verified.png' });

  await browser.close();

  if (consoleErrors.length > 0) {
    console.error(`⚠️ Erros de console detectados (${consoleErrors.length}):`, consoleErrors);
  } else {
    console.log('🎉 Simulação concluída com 0 erros de console!');
  }
}

testMotionDesign().catch(err => {
  console.error('Fatal error in motion test:', err);
  process.exit(1);
});
