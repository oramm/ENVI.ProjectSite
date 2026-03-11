/**
 * Puppeteer screenshot utility for localhost testing
 * Usage:
 *   yarn screenshot
 *   node scripts/screenshot.js http://localhost:9000/docs/#/persons tmp/ui-browser-loop/persons.png
 *   node scripts/screenshot.js http://localhost:9000/docs/#/contract/1770 tmp/ui-browser-loop/contract-1770.png --mock-login
 */
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

function parseArgs(argv) {
  const result = {
    url: 'http://localhost:9000/docs/#/',
    output: 'tmp/ui-browser-loop/ui-browser-loop.png',
    mockLogin: false,
    timeoutMs: 30000,
    viewportWidth: 1920,
    viewportHeight: 1080,
    waitForSelector: null,
    waitForText: null,
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
    if (arg.startsWith('--viewport=')) {
      const value = arg.slice('--viewport='.length);
      const [width, height] = value.split('x').map(Number);
      if (!Number.isNaN(width) && width > 0) result.viewportWidth = width;
      if (!Number.isNaN(height) && height > 0) result.viewportHeight = height;
      continue;
    }
    if (arg.startsWith('--selector=')) {
      result.waitForSelector = arg.slice('--selector='.length);
      continue;
    }
    if (arg.startsWith('--text=')) {
      result.waitForText = arg.slice('--text='.length);
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

async function waitForText(page, text, timeoutMs) {
  await page.waitForFunction(
    (expectedText) => document.body?.innerText?.includes(expectedText),
    { timeout: timeoutMs },
    text,
  );
}

const {
  url,
  output,
  mockLogin,
  timeoutMs,
  viewportWidth,
  viewportHeight,
  waitForSelector,
  waitForText: expectedText,
} = parseArgs(process.argv.slice(2));

function ensureOutputDirectory(filePath) {
  const outputDir = path.dirname(filePath);
  if (!outputDir || outputDir === '.') return;
  fs.mkdirSync(outputDir, { recursive: true });
}

(async () => {
  console.log(`📸 Taking screenshot of: ${url}`);
  if (mockLogin) console.log('🔐 Mock login enabled: will click DEV login if visible');
  ensureOutputDirectory(output);

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: viewportWidth, height: viewportHeight });

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

    if (waitForSelector) {
      await page.waitForSelector(waitForSelector, { timeout: timeoutMs });
    }

    if (expectedText) {
      await waitForText(page, expectedText, timeoutMs);
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
