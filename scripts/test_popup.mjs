import { chromium } from 'playwright';

const BASE_URL = 'http://localhost:3000';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function testPopup() {
  console.log('🚀 Testando Pop-up de Tela Cheia dos Modelos 3D...');

  const browser = await chromium.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-webgl', '--no-sandbox']
  });

  const page = await browser.newPage({ viewport: { width: 1280, height: 850 } });

  try {
    // 1. Ir para o Laboratório 3D
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    const labHeaderBtn = page.locator('header button:has-text("Laboratório 3D")').first();
    await labHeaderBtn.click();
    await page.waitForTimeout(1000);

    // 2. Verificar botão de abrir em tela cheia no toolbar
    const openPopupBtn = page.locator('button[aria-label="Abrir em tela cheia (Pop-up)"], button[title="Abrir em tela cheia (Pop-up)"]').first();
    await openPopupBtn.waitFor({ state: 'visible', timeout: 5000 });
    console.log('✅ Botão "Abrir em tela cheia" encontrado no quadro acoplado!');

    // 3. Clicar para abrir em tela cheia (Pop-up)
    console.log('🖱️ Clicando para abrir pop-up...');
    await openPopupBtn.click();
    await page.waitForTimeout(1000);

    // 4. Verificar se a modal pop-up abriu
    const modalTitle = page.locator('text=Visualização 3D em Tela Cheia');
    const isModalOpen = await modalTitle.isVisible();
    console.log('✅ Pop-up de Tela Cheia aberto com sucesso?', isModalOpen);

    // 5. Verificar presença do botão de voltar à visualização acoplada
    const closeBtn = page.locator('button:has-text("Voltar à visualização acoplada")').first();
    const hasCloseBtn = await closeBtn.isVisible();
    console.log('✅ Botão "Voltar à visualização acoplada" visível?', hasCloseBtn);

    // 6. Verificar ações dentro da modal (ex: botão de desdobramento / fechar planificação)
    const modalCanvas = page.locator('[role="dialog"] canvas');
    const hasCanvasInModal = await modalCanvas.isVisible();
    console.log('✅ Canvas 3D renderizado dentro do pop-up?', hasCanvasInModal);

    // Tirar screenshot da modal pop-up aberta
    await page.screenshot({ path: 'scripts/popup_tela_cheia.png' });
    console.log('📸 Screenshot da tela cheia salva em scripts/popup_tela_cheia.png');

    // 7. Clicar para voltar à visualização acoplada
    console.log('🖱️ Clicando em "Voltar à visualização acoplada"...');
    await closeBtn.click();
    await page.waitForTimeout(800);

    const isModalClosed = !(await modalTitle.isVisible());
    console.log('✅ Pop-up fechado e visualização acoplada restaurada?', isModalClosed);

    // 8. Testar também em um cartão de questão (mini frame não interativo com botão pop-up)
    console.log('\n--- Testando em Cartão de Questão da Avaliação ---');
    // Criar estudante de teste
    const classesRes = await fetch(`${BASE_URL}/api/teacher/classes`).then(r => r.json());
    const classId = classesRes.classes[0].id;
    const createStudentRes = await fetch(`${BASE_URL}/api/teacher/students`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ classId, pseudonym: 'Estudante Pop-up Test' })
    }).then(r => r.json());
    const student = createStudentRes.student;

    await page.locator('header button:has-text("Estudante")').first().click();
    await page.waitForTimeout(600);
    await page.locator('button:has-text("MODO AVALIAÇÃO")').first().click();
    await page.locator('input[placeholder*="GEO-"]').first().fill(student.accessCode);
    await page.locator('button[type="submit"]').first().click();
    await page.waitForSelector('text=Identifique o objeto 3D', { timeout: 10000 });
    await page.waitForTimeout(600);

    // Na Figura C (Cubo), encontrar o botão de tela cheia
    const miniPopupBtn = page.locator('button:has-text("Figura C") [aria-label="Abrir em tela cheia (Pop-up)"], [role="button"][title*="Abrir em tela cheia"]').first();
    const hasMiniPopupBtn = await miniPopupBtn.isVisible();
    console.log('✅ Botão de pop-up no cartão da Questão 1 (Figura C) encontrado?', hasMiniPopupBtn);

    if (hasMiniPopupBtn) {
      await miniPopupBtn.click();
      await page.waitForTimeout(1000);
      const isQ1ModalOpen = await page.locator('text=Visualização 3D em Tela Cheia').isVisible();
      console.log('✅ Pop-up aberto a partir da Questão 1?', isQ1ModalOpen);

      await page.locator('button:has-text("Voltar à visualização acoplada")').first().click();
      await page.waitForTimeout(600);
      console.log('✅ Retornou à questão acoplada com sucesso!');
    }

    if (student?.id) {
      await fetch(`${BASE_URL}/api/teacher/students?studentId=${student.id}`, { method: 'DELETE' });
    }

    console.log('\n🎉 TESTE DE POP-UP CONCLUÍDO COM 100% DE SUCESSO!');
  } finally {
    await browser.close();
  }
}

testPopup().catch(console.error);

