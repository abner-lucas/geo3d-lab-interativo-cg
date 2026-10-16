import { chromium } from 'playwright';

const BASE_URL = 'http://localhost:3000';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function testTeacherLogout() {
  console.log('🚀 Testando Botão de Encerrar Sessão no Painel Docente...');

  const browser = await chromium.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-webgl', '--no-sandbox']
  });

  const page = await browser.newPage({ viewport: { width: 1280, height: 850 } });

  // Handle confirm dialogs automatically
  page.on('dialog', async dialog => {
    console.log(`💬 Diálogo de confirmação capturado: "${dialog.message()}"`);
    await dialog.accept();
  });

  try {
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });

    // 1. Clicar em Professor no cabeçalho
    console.log('1. Acessando autenticação do professor...');
    await page.locator('header button:has-text("Professor")').first().click();
    await page.waitForTimeout(600);

    // 2. Preencher senha docente
    await page.locator('input[type="password"]').first().fill('PROF-2026');
    await page.locator('button[type="submit"]:has-text("ENTRAR NO PAINEL")').first().click();
    await page.waitForTimeout(1000);

    // 3. Verificar se entrou no Painel Docente
    const dashboardTitle = page.locator('text=Acompanhamento de Atividades');
    await dashboardTitle.waitFor({ state: 'visible', timeout: 5000 });
    console.log('✅ Painel Docente acessado com sucesso!');

    // 4. Verificar botão "Encerrar Sessão"
    const logoutBtn = page.locator('button:has-text("Encerrar Sessão")').first();
    const isLogoutBtnVisible = await logoutBtn.isVisible();
    console.log('✅ Botão "Encerrar Sessão" presente e visível?', isLogoutBtnVisible);

    // Salvar screenshot do painel com o botão
    await page.screenshot({ path: 'scripts/painel_docente_encerrar_sessao.png' });
    console.log('📸 Screenshot salva em scripts/painel_docente_encerrar_sessao.png');

    // 5. Clicar em "Encerrar Sessão"
    console.log('5. Clicando em "Encerrar Sessão"...');
    await logoutBtn.click();
    await page.waitForTimeout(1000);

    // 6. Verificar se voltou para a tela inicial / login do estudante
    const studentLoginScreen = page.locator('text=Código Individual do Estudante');
    const isBackAtHome = await studentLoginScreen.isVisible();
    console.log('✅ Retornou à tela inicial após encerrar sessão?', isBackAtHome);

    // 7. Clicar novamente em "Professor" no cabeçalho para garantir que a sessão foi encerrada
    console.log('7. Clicando novamente em "Professor" no cabeçalho...');
    await page.locator('header button:has-text("Professor")').first().click();
    await page.waitForTimeout(600);

    // 8. Deve solicitar a senha novamente (tela de TEACHER_AUTH)
    const isPasswordPromptVisible = await page.locator('input[type="password"]').isVisible();
    console.log('✅ Acesso bloqueado exigindo senha novamente?', isPasswordPromptVisible);

    if (isLogoutBtnVisible && isBackAtHome && isPasswordPromptVisible) {
      console.log('\n🎉 SUCESSO TOTAL: Sessão docente encerrada com segurança!');
    } else {
      console.error('⚠️ ALERTA: Falha na validação do encerramento de sessão!');
    }

  } finally {
    await browser.close();
  }
}

testTeacherLogout().catch(console.error);
