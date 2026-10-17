import { chromium } from 'playwright';

const BASE_URL = 'http://localhost:3000';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function testVertexFix() {
  console.log('🧪 Iniciando teste visual das correções de vértices...');

  const browser = await chromium.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-webgl', '--no-sandbox']
  });

  const page = await browser.newPage({ viewport: { width: 1366, height: 900 } });

  try {
    // 1. Acessar página inicial
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    // 2. Ir para o Laboratório 3D
    console.log('1. Acessando Laboratório 3D...');
    const labBtn = page.locator('header button:has-text("Laboratório 3D")');
    await labBtn.click();
    await page.waitForTimeout(1000);

    // A. Testar Cubo em 0% Fechado
    console.log('2. Capturando Cubo em 0% Fechado...');
    await page.locator('button:has-text("Cubo")').click();
    await page.waitForTimeout(800);
    await page.screenshot({ path: 'scripts/vertex_cube_closed.png' });

    // B. Testar Paralelepípedo em 0% Fechado
    console.log('3. Capturando Paralelepípedo em 0% Fechado...');
    await page.locator('button:has-text("Paralelepípedo")').click();
    await page.waitForTimeout(800);
    await page.screenshot({ path: 'scripts/vertex_cuboid_closed.png' });

    // C. Testar Cilindro (deve ter 0 vértices - sem bolas roxas!)
    console.log('4. Capturando Cilindro (0 vértices)...');
    await page.locator('button:has-text("Cilindro")').click();
    await page.waitForTimeout(800);
    await page.screenshot({ path: 'scripts/vertex_cylinder_closed.png' });

    // D. Testar Pirâmide Quadrada
    console.log('5. Capturando Pirâmide Quadrada...');
    await page.locator('button:has-text("Pirâmide Quadrada")').click();
    await page.waitForTimeout(800);
    await page.screenshot({ path: 'scripts/vertex_pyramid_closed.png' });

    // E. Testar no Modo Estudante / Treino
    console.log('6. Testando Modo Treino...');
    const studentBtn = page.locator('header button:has-text("Estudante")');
    await studentBtn.click();
    await page.waitForTimeout(1000);

    const treinoTab = page.locator('button:has-text("Modo Treino")');
    if (await treinoTab.isVisible()) {
      await treinoTab.click();
      await page.waitForTimeout(600);
    }

    // Criar estudante para ver questão 3D
    const classesRes = await page.request.get(`${BASE_URL}/api/teacher/classes`).then(r => r.json());
    const classId = classesRes.classes[0].id;
    const createRes = await page.request.post(`${BASE_URL}/api/teacher/students`, {
      data: { classId, pseudonym: 'Tester Vertices' }
    }).then(r => r.json());
    const student = createRes.student;

    const codeInput = page.locator('input[placeholder*="Ex:"]');
    await codeInput.fill(student.accessCode);
    await Promise.all([
      page.waitForResponse(r => r.url().includes('/api/student/login') && r.status() === 200),
      page.locator('button[type="submit"]').click()
    ]);
    await page.waitForTimeout(1000);

    // Navegar até o passo com visualizador 3D (Passo 2 do tutorial)
    const nextBtn = page.locator('button:has-text("Próximo Passo")');
    if (await nextBtn.isVisible()) {
      await nextBtn.click();
      await page.waitForTimeout(1000);
    }

    await page.screenshot({ path: 'scripts/vertex_assessment_mode.png' });
    console.log('   ✓ Screenshot do modo treino capturado em scripts/vertex_assessment_mode.png');

    console.log('✅ TESTES CONCLUÍDOS COM SUCESSO!');
  } catch (err) {
    console.error('❌ Erro no teste:', err);
    throw err;
  } finally {
    await browser.close();
  }
}

testVertexFix();

