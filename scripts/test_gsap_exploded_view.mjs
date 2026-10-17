import { chromium } from 'playwright';

const BASE_URL = 'http://localhost:3000';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function testGsapExplodedView() {
  console.log('🧪 Iniciando teste automatizado da Visão Explodida com GSAP...');

  const browser = await chromium.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-webgl', '--no-sandbox']
  });

  const page = await browser.newPage({ viewport: { width: 1366, height: 900 } });

  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('pageerror', err => consoleErrors.push(err.message));

  try {
    // 1. Acessar página
    console.log('1. Acessando página inicial...');
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    // 2. Mudar para o Laboratório 3D de Exploração
    console.log('2. Navegando para o Laboratório 3D (ExplorationLab)...');
    const labBtn = page.locator('header button:has-text("Laboratório 3D")');
    await labBtn.click();
    await page.waitForTimeout(1000);

    // 3. Verificar botão de Modo Raio-X
    console.log('3. Localizando botão "Ativar Modo Raio-X"...');
    const xrayBtn = page.locator('button:has-text("Ativar Modo Raio-X")');
    if (!(await xrayBtn.isVisible())) {
      throw new Error('Botão "Ativar Modo Raio-X" não encontrado!');
    }
    console.log('   ✓ Botão encontrado.');

    // 4. Clicar no botão para ativar o modo de dissecação GSAP
    console.log('4. Ativando Modo Raio-X & Visão Explodida...');
    await xrayBtn.click();
    await page.waitForTimeout(1200);

    // 5. Verificar painel de controle GSAP
    console.log('5. Validando presença do deck de controle GSAP...');
    const deckHeader = page.locator('text=Linha do Tempo GSAP: Dissecação em 60 FPS');
    if (!(await deckHeader.isVisible())) {
      throw new Error('Deck GSAP não abriu!');
    }
    console.log('   ✓ Deck GSAP aberto com sucesso!');

    // 6. Testar presets de estágio
    console.log('6. Testando presets rápidos (50% Dissecado e 100% Raio-X)...');
    const preset50 = page.locator('button:has-text("50% Dissecado")');
    await preset50.click();
    await page.waitForTimeout(900);
    console.log('   ✓ Preset 50% acionado.');

    const preset100 = page.locator('button:has-text("100% Raio-X")');
    await preset100.click();
    await page.waitForTimeout(900);
    console.log('   ✓ Preset 100% acionado.');

    // 7. Verificar se o callout pedagógico e badges reativos apareceram
    console.log('7. Verificando badges reativos e callout pedagógico...');
    const callout = page.locator('text=Como a Visão Explodida Funciona?');
    if (await callout.isVisible()) {
      console.log('   ✓ Callout pedagógico visível!');
    } else {
      console.warn('   ⚠️ Callout pedagógico não localizado.');
    }

    // 8. Testar alternância de sólidos (ex: Pirâmide Quadrada e Cilindro)
    console.log('8. Testando dissecação em Pirâmide Quadrada...');
    const pyramidBtn = page.locator('button:has-text("Pirâmide Quadrada")');
    await pyramidBtn.click();
    await page.waitForTimeout(1000);

    // 9. Capturar screenshot comprobatório
    console.log('9. Capturando screenshot da visão explodida com GSAP...');
    await page.screenshot({
      path: 'scripts/gsap_exploded_view_verified.png',
      fullPage: true
    });
    console.log('   ✓ Screenshot salvo em scripts/gsap_exploded_view_verified.png');

    console.log('✅ TODOS OS TESTES DA VISÃO EXPLODIDA COM GSAP FORAM CONCLUÍDOS COM SUCESSO!');
  } catch (err) {
    console.error('❌ Erro no teste:', err);
    throw err;
  } finally {
    await browser.close();
  }
}

testGsapExplodedView();
