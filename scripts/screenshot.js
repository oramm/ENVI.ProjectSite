/**
 * Puppeteer screenshot utility for localhost testing
 * Usage:
 *   yarn screenshot
 *   yarn screenshot http://localhost:9000/other-page
 *   yarn screenshot http://localhost:9000/page custom-name.png
 */
const puppeteer = require('puppeteer');

function parseArgs(argv) {
  const result = {
    url: 'http://localhost:9000/docs/',
    output: 'screenshot.png',
    mockLogin: false,
    timeoutMs: 30000,
  };

  const positional = [];
  for (const arg of argv) {
    if (arg === '--mock-login') {
      result.mockLogin = true;
      continue;
    }
    if (arg.startsWith('--timeout=')) {
      const value = Number(arg.slice('--timeout='.length));
      if (!Number.isNaN(value) && value > 0) result.timeoutMs = value;
      continue;
    }
    if (arg.startsWith('-')) continue;
    positional.push(arg);
  }

  if (positional[0]) result.url = positional[0];
  if (positional[1]) result.output = positional[1];
  return result;
}

async function clickMockLoginIfPresent(page) {
  const candidates = [
    'DEV: Mock Login',
    'Mock Login',
    'DEV MODE',
  ];

  for (const text of candidates) {
    const clicked = await page.evaluate((t) => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const match = buttons.find((b) => (b.textContent || '').includes(t));
      if (!match) return false;
      match.click();
      return true;
    }, text);
    if (clicked) return true;
  }
  return false;
}

const { url, output, mockLogin, timeoutMs } = parseArgs(process.argv.slice(2));

(async () => {
  console.log(`📸 Taking screenshot of: ${url}`);
  if (mockLogin) console.log('🔐 Mock login enabled: will click DEV login if visible');

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  try {
    await page.goto(url, {
      waitUntil: 'networkidle0',
      timeout: timeoutMs
    });

    if (mockLogin) {
      const didClick = await clickMockLoginIfPresent(page);
      if (didClick) {
        await page.waitForFunction(
          () => {
            const hasNavbar = !!document.querySelector('.navbar');
            const hasUserDropdown = !!document.querySelector('#user-nav-dropdown');
            return hasNavbar || hasUserDropdown;
          },
          { timeout: timeoutMs }
        );
        await page.waitForNetworkIdle({ idleTime: 500, timeout: timeoutMs });
      } else {
        console.warn('⚠️ Mock login button not found on the page (is ENABLE_DEV_LOGIN=true in the bundle/dev server?)');
      }
    }

    await page.screenshot({
      path: output,
      fullPage: true
    });

    console.log(`✅ Screenshot saved to: ${output}`);
  } catch (error) {
    console.error('❌ Error taking screenshot:', error.message);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
