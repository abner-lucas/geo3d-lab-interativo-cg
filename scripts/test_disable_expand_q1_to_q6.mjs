import { chromium } from 'playwright';

const BASE_URL = 'http://localhost:3000';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function testDisableExpandQ1toQ6() {
  console.log('🧪 Iniciando teste de remoção do botão expandir nas questões 1 a 6...');

  const browser = await chromium.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-webgl', '--no-sandbox']
  });

  const page = await browser.newPage({ viewport: { width: 1366, height: 900 } });

  try {
    // 1. Acessar página inicial
    console.log('1. Acessando página inicial...');
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    // 2. Garantir Modo Avaliação
    console.log('2. Criando estudante para Modo Avaliação...');
    const classesRes = await page.request.get(`${BASE_URL}/api/teacher/classes`).then(r => r.json());
    const classId = classesRes.classes[0].id;
    const createRes = await page.request.post(`${BASE_URL}/api/teacher/students`, {
      data: { classId, pseudonym: 'Tester No Expand' }
    }).then(r => r.json());
    const student = createRes.student;

    const avaliacaoTab = page.locator('button:has-text("Modo Avaliação")');
    if (await avaliacaoTab.isVisible()) {
      await avaliacaoTab.click();
      await page.waitForTimeout(500);
    }

    const codeInput = page.locator('input[placeholder*="Ex:"]');
    await codeInput.fill(student.accessCode);
    await Promise.all([
      page.waitForResponse(r => r.url().includes('/api/student/login') && r.status() === 200),
      page.locator('button[type="submit"]').click()
    ]);
    await page.waitForTimeout(1200);

    // Navegar diretamente pelas questões de 1 a 6
    for (let qNum = 1; qNum <= 6; qNum++) {
      console.log(`Checking Questão ${qNum}...`);
      await page.locator(`button[aria-label="Ir para questão ${qNum}"]`).click();
      await page.waitForTimeout(800);

      const expandBtns = await page.locator('[aria-label="Abrir em tela cheia (Pop-up)"]').count();
      if (expandBtns > 0) {
        throw new Error(`Questão ${qNum} possui ${expandBtns} botões de expandir! Deveria ter 0.`);
      }
      console.log(`   ✓ Questão ${qNum}: 0 botões de expandir.`);

      if (qNum === 3) {
        await page.waitForTimeout(1000);
        await page.screenshot({ path: 'scripts/q3_without_expand.png', fullPage: true });
        console.log('   ✓ Screenshot de evidência da Questão 3 salvo em scripts/q3_without_expand.png');
      }
    }

    console.log('✅ TESTE CONCLUÍDO COM SUCESSO: TODAS AS QUESTÕES DE 1 A 6 NÃO POSSUEM BOTÃO DE EXPANDIR!');
  } catch (err) {
    console.error('❌ Erro no teste:', err);
    throw err;
  } finally {
    await browser.close();
  }
}

testDisableExpandQ1toQ6();

