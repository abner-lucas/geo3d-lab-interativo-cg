import { chromium } from 'playwright';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function diagnose() {
  const browser = await chromium.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-webgl', '--no-sandbox']
  });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  
  page.on('console', msg => console.log('LOG:', msg.type(), msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));

  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  console.log('Title:', await page.title());

  const headerButtons = await page.$$eval('header button', btns => btns.map(b => b.innerText.trim().replace(/\n/g, ' ')));
  console.log('Header buttons:', headerButtons);

  const labBtn = page.locator('header button:has-text("Laboratório 3D")').first();
  console.log('Lab btn count:', await labBtn.count());
  await labBtn.click();
  await page.waitForTimeout(1000);

  const bodyText = await page.innerText('body');
  console.log('Contains Laboratório 3D text:', bodyText.includes('Laboratório 3D de Geometria Espacial'));

  const allButtons = await page.$$eval('button', btns => btns.map(b => b.innerText.trim().replace(/\n/g, ' ')));
  console.log('All buttons on page after click:', allButtons);

  await browser.close();
}

diagnose().catch(console.error);

