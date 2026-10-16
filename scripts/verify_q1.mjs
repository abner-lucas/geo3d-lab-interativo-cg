import { chromium } from 'playwright';

const BASE_URL = 'http://localhost:3000';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function verifyQ1() {
  console.log('🔍 Testando visualização da Questão 1 sem spoilers...');

  // 1. Obter classId e criar estudante exclusivo para o teste
  const classesRes = await fetch(`${BASE_URL}/api/teacher/classes`).then(r => r.json());
  const classId = classesRes.classes[0].id;
  
  const createStudentRes = await fetch(`${BASE_URL}/api/teacher/students`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ classId, pseudonym: 'Estudante Q1 Check' })
  }).then(r => r.json());
  
  const testStudent = createStudentRes.student;
  console.log(`👤 Estudante criado: ${testStudent.pseudonym} (${testStudent.accessCode})`);

  const browser = await chromium.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-webgl', '--no-sandbox']
  });

  const page = await browser.newPage({ viewport: { width: 1280, height: 850 } });

  try {
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });

    // Fazer login em MODO AVALIAÇÃO
    await page.locator('button:has-text("MODO AVALIAÇÃO")').first().click();
    await page.locator('input[placeholder*="GEO-"]').first().fill(testStudent.accessCode);
    await page.locator('button[type="submit"]').first().click();
    await page.waitForSelector('text=Identifique o objeto 3D', { timeout: 10000 });
    await page.waitForTimeout(800);

    // Na Questão 1, inspecionar todo o texto presente
    const q1Text = await page.innerText('main');
    console.log('Conteúdo da Questão 1:');
    console.log('-----------------------------------');
    console.log(q1Text);
    console.log('-----------------------------------');

    const hasSolido3DFechado = q1Text.includes('Sólido 3D Fechado');
    const hasSuperficiePlana2D = q1Text.includes('Superfície plana (2D)');
    const hasPossuiVolume3D = q1Text.includes('Possui Volume (3D)');

    console.log('Verificações:');
    console.log('  ❌ Possui "Sólido 3D Fechado"?', hasSolido3DFechado);
    console.log('  ❌ Possui "Superfície plana (2D)"?', hasSuperficiePlana2D);
    console.log('  ❌ Possui "Possui Volume (3D)"?', hasPossuiVolume3D);

    if (!hasSolido3DFechado && !hasSuperficiePlana2D && !hasPossuiVolume3D) {
      console.log('✅ SUCESSO: Todos os spoilers foram removidos com perfeição!');
    } else {
      console.error('⚠️ ALERTA: Ainda existem spoilers na tela!');
    }

    // Salvar screenshot da Questão 1
    await page.screenshot({ path: 'scripts/q1_sem_spoilers.png' });
    console.log('📸 Screenshot salva em scripts/q1_sem_spoilers.png');

  } finally {
    if (testStudent?.id) {
      await fetch(`${BASE_URL}/api/teacher/students?studentId=${testStudent.id}`, { method: 'DELETE' });
      console.log(`🧹 Estudante de teste ${testStudent.id} removido.`);
    }
    await browser.close();
  }
}

verifyQ1().catch(console.error);

