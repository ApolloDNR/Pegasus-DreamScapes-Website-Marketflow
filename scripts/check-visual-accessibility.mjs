import { existsSync } from 'node:fs';
import { mkdir, readFile, stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const buildRoot = path.join(projectRoot, 'dist/public');
const axeSource = await readFile(path.join(projectRoot, 'node_modules/axe-core/axe.min.js'), 'utf8');

const routes = [
  '/',
  '/property-owners',
  '/deal-partners',
  '/how-we-operate',
  '/development',
  '/investments',
  '/strategy-lab',
  '/marketflow',
  '/bring-an-opportunity',
  '/work-with-apollo',
  '/connect',
  '/peggy',
  '/contact',
  '/privacy',
  '/terms',
  '/disclosures',
  '/__launch-404-check',
];

const viewports = [
  ['desktop', { width: 1440, height: 940 }],
  ['tablet', { width: 768, height: 1024 }],
  ['mobile', { width: 390, height: 844 }],
];

const colorSchemes = ['dark', 'light'];
const interactionsOnly = process.env.A11Y_INTERACTIONS_ONLY === '1';
const screenshotDir = process.env.A11Y_SCREENSHOT_DIR
  ? path.resolve(process.env.A11Y_SCREENSHOT_DIR)
  : null;
if (screenshotDir) await mkdir(screenshotDir, { recursive: true });

const mimeTypes = {
  '.avif': 'image/avif',
  '.css': 'text/css; charset=utf-8',
  '.gif': 'image/gif',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webmanifest': 'application/manifest+json',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.xml': 'application/xml; charset=utf-8',
};

function json(response, status, body) {
  response.writeHead(status, { 'content-type': 'application/json; charset=utf-8' });
  response.end(JSON.stringify(body));
}

const server = createServer(async (request, response) => {
  const pathname = decodeURIComponent(new URL(request.url || '/', 'http://127.0.0.1').pathname);

  if (pathname === '/api/site-content') {
    json(response, 200, []);
    return;
  }
  if (pathname === '/api/config/supabase') {
    json(response, 200, {});
    return;
  }
  if (pathname.startsWith('/api/')) {
    json(response, 404, { message: 'Backend unavailable in rendered accessibility check' });
    return;
  }

  const candidate = path.resolve(buildRoot, `.${pathname}`);
  let filePath = candidate === buildRoot || candidate.startsWith(`${buildRoot}${path.sep}`)
    ? candidate
    : path.join(buildRoot, 'index.html');

  try {
    if ((await stat(filePath)).isDirectory()) filePath = path.join(filePath, 'index.html');
  } catch {
    filePath = path.join(buildRoot, 'index.html');
  }

  try {
    const body = await readFile(filePath);
    response.writeHead(200, {
      'content-type': mimeTypes[path.extname(filePath)] || 'application/octet-stream',
    });
    response.end(body);
  } catch {
    response.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
    response.end('Not found');
  }
});

await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const address = server.address();
if (!address || typeof address === 'string') throw new Error('Accessibility server did not expose a TCP port');
const baseUrl = `http://127.0.0.1:${address.port}`;

const candidates = [
  process.env.CHROME_PATH,
  chromium.executablePath(),
  '/usr/bin/google-chrome',
  '/usr/bin/google-chrome-stable',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
  '/tmp/chromium',
].filter(Boolean);
const executablePath = candidates.find((candidate) => existsSync(candidate));
if (!executablePath) {
  server.close();
  throw new Error('No Chromium executable found. Set CHROME_PATH to run the rendered accessibility gate.');
}

const serverlessChromium = executablePath === '/tmp/chromium';
const launchBrowser = () => chromium.launch({
  executablePath,
  headless: true,
  ...(serverlessChromium ? {
    ignoreDefaultArgs: ['--enable-unsafe-swiftshader'],
    args: [
      '--no-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--disable-software-rasterizer',
      '--single-process',
      '--no-zygote',
    ],
    env: {
      ...process.env,
      HOME: '/tmp',
      XDG_CACHE_HOME: '/tmp',
      FONTCONFIG_PATH: '/etc/fonts',
    },
  } : { args: ['--no-sandbox', '--disable-dev-shm-usage'] }),
});

const failures = [];
const interactionFailures = [];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function runInteraction(name, options, check) {
  const browser = await launchBrowser();
  const context = await browser.newContext({
    viewport: options.viewport ?? viewports[0][1],
    colorScheme: options.colorScheme ?? 'dark',
    reducedMotion: 'reduce',
  });
  if (options.seedConsent !== false) {
    await context.addInitScript(() => {
      localStorage.setItem('pegasus-cookie-consent', JSON.stringify({
        essential: true,
        analytics: false,
        marketing: false,
        decidedAt: '2026-01-01T00:00:00.000Z',
      }));
    });
  }
  const page = await context.newPage();
  const pageErrors = [];
  page.on('pageerror', (error) => pageErrors.push(String(error)));

  try {
    await check(page);
    assert(pageErrors.length === 0, `Browser errors: ${pageErrors.join('; ')}`);
    console.log(`[interaction] ${name}: PASS`);
  } catch (error) {
    interactionFailures.push({ name, error: String(error), pageErrors });
    console.log(`[interaction] ${name}: FAIL`);
  } finally {
    await context.close();
    await browser.close();
  }
}

async function openPage(page, route) {
  const response = await page.goto(`${baseUrl}${route}`, { waitUntil: 'load', timeout: 45_000 });
  assert(response?.ok(), `${route} returned ${response?.status() ?? 'no response'}`);
  await page.locator('h1').first().waitFor({ state: 'attached', timeout: 10_000 });
}

try {
  for (const colorScheme of interactionsOnly ? [] : colorSchemes) {
    for (const [viewportName, viewport] of viewports) {
      const browser = await launchBrowser();
      const context = await browser.newContext({
        viewport,
        colorScheme,
        reducedMotion: 'reduce',
      });

      for (const route of routes) {
        const page = await context.newPage();
        const pageErrors = [];
        page.on('pageerror', (error) => pageErrors.push(String(error)));

        const response = await page.goto(`${baseUrl}${route}`, { waitUntil: 'load', timeout: 45_000 });
        await page.locator('h1').first().waitFor({ state: 'attached', timeout: 10_000 });
        await page.waitForTimeout(650);
        await page.addScriptTag({ content: axeSource });

        const violations = await page.evaluate(async () => {
          const result = await globalThis.axe.run(document, {
            runOnly: {
              type: 'tag',
              values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22a', 'wcag22aa'],
            },
          });
          return result.violations
            .filter((violation) => violation.impact === 'critical' || violation.impact === 'serious')
            .map((violation) => ({
              id: violation.id,
              impact: violation.impact,
              help: violation.help,
              nodes: violation.nodes.map((node) => ({
                target: node.target.join(' '),
                summary: node.failureSummary,
              })),
            }));
        });

        if (screenshotDir && colorScheme === 'dark') {
          const slug = route === '/' ? 'home' : route.replace(/^\//, '').replace(/[^a-z0-9]+/gi, '-');
          await page.screenshot({
            path: path.join(screenshotDir, `${slug}-${viewportName}.png`),
            fullPage: true,
          });
        }

        if (!response?.ok() || pageErrors.length || violations.length) {
          failures.push({
            colorScheme,
            viewport: viewportName,
            route,
            status: response?.status(),
            pageErrors,
            violations,
          });
        }
        const passed = response?.ok() && !pageErrors.length && !violations.length;
        console.log(`[a11y] ${colorScheme} ${viewportName} ${route}: ${passed ? 'PASS' : 'FAIL'}`);
        await page.close();
      }

      await context.close();
      await browser.close();
    }
  }

  await runInteraction('desktop navigation directory', {}, async (page) => {
    await openPage(page, '/');
    const more = page.getByRole('button', { name: /^More/ });
    await more.focus();
    await page.keyboard.press('Enter');
    await page.getByRole('region', { name: 'More Pegasus pages' }).waitFor({ state: 'visible' });
  });

  await runInteraction('mobile navigation destination', { viewport: viewports[2][1] }, async (page) => {
    await openPage(page, '/');
    const menuButton = page.locator('button[aria-controls="mobile-menu"]');
    await menuButton.click();
    assert(await menuButton.getAttribute('aria-expanded') === 'true', 'Mobile menu did not expand');
    const dialog = page.getByRole('dialog', { name: 'Primary navigation' });
    await dialog.getByRole('link', { name: 'Strategy Lab', exact: true }).first().click();
    await page.waitForURL(/\/strategy-lab$/);
    await page.locator('h1').first().waitFor({ state: 'attached' });
  });

  await runInteraction('theme toggle persistence', { colorScheme: 'dark' }, async (page) => {
    await openPage(page, '/');
    const root = page.locator('.pg-root');
    assert(await root.getAttribute('data-theme') === 'dark', 'Dark theme was not initialized');
    await page.getByRole('button', { name: 'Switch to light mode' }).click();
    await page.waitForFunction(() => document.querySelector('.pg-root')?.getAttribute('data-theme') !== 'dark');
    assert(await page.evaluate(() => localStorage.getItem('pegasus-ui-theme')) === 'light', 'Theme choice was not persisted');
  });

  await runInteraction('homepage primary CTA', {}, async (page) => {
    await openPage(page, '/');
    await page.locator('nav a[href="/bring-an-opportunity"]').click();
    await page.waitForURL(/\/bring-an-opportunity$/);
  });

  await runInteraction('opportunity intake initial validation', {}, async (page) => {
    await openPage(page, '/bring-an-opportunity');
    assert(await page.getByRole('button', { name: 'Continue' }).isDisabled(), 'Empty intake could advance past the first step');
  });

  await runInteraction('Strategy Lab primary interaction', {}, async (page) => {
    await openPage(page, '/strategy-lab');
    await page.getByRole('button', { name: /Open instrument library/ }).click();
    await page.locator('#lab-instruments-title').waitFor({ state: 'visible' });
  });

  await runInteraction('MarketFlow reviewed access path', {}, async (page) => {
    await openPage(page, '/marketflow');
    await page.getByRole('button', { name: /Request reviewed access/ }).click();
    await page.waitForURL(/\/marketflow\/access$/);
    await page.locator('h1').first().waitFor({ state: 'attached' });
  });

  await runInteraction('Peggy open and close', {}, async (page) => {
    await openPage(page, '/peggy');
    const fab = page.locator('.peggy-fab');
    const panel = page.locator('.peggy-panel');
    await fab.click();
    assert(await fab.getAttribute('aria-expanded') === 'true', 'Peggy did not open');
    assert(await panel.getAttribute('aria-hidden') === 'false', 'Peggy panel remained hidden');
    await fab.click();
    assert(await fab.getAttribute('aria-expanded') === 'false', 'Peggy did not close');
    await fab.click();
    await panel.getByTestId('peggy-route-submit').click();
    await page.waitForURL(/\/bring-an-opportunity$/);
  });

  await runInteraction('contact form validation', {}, async (page) => {
    await openPage(page, '/contact');
    await page.getByRole('button', { name: 'Request My Review' }).click();
    assert(await page.locator('form input:invalid').count() >= 3, 'Empty contact form did not expose required invalid fields');
  });

  await runInteraction('cookie preference choice', { seedConsent: false }, async (page) => {
    await openPage(page, '/');
    const banner = page.getByTestId('cookie-consent-banner');
    await banner.waitFor({ state: 'visible', timeout: 5_000 });
    await page.getByTestId('button-cookie-customize').click();
    await page.getByTestId('cookie-consent-details').waitFor({ state: 'visible' });
    await page.getByTestId('toggle-cookie-analytics').click();
    await page.getByTestId('button-cookie-save').click();
    await banner.waitFor({ state: 'detached' });
    const consent = await page.evaluate(() => JSON.parse(localStorage.getItem('pegasus-cookie-consent') || '{}'));
    assert(consent.analytics === true && typeof consent.decidedAt === 'string', 'Cookie choice was not persisted');
  });

  await runInteraction('keyboard focus order', {}, async (page) => {
    await openPage(page, '/');
    const sequence = [];
    for (let index = 0; index < 8; index += 1) {
      await page.keyboard.press('Tab');
      await page.waitForTimeout(250);
      const focused = await page.evaluate(() => {
        const element = document.activeElement;
        if (!(element instanceof HTMLElement)) return null;
        const rect = element.getBoundingClientRect();
        const style = getComputedStyle(element);
        return {
          tag: element.tagName,
          label: element.getAttribute('aria-label') || element.textContent?.trim().slice(0, 80) || '',
          visible: style.visibility !== 'hidden' && style.display !== 'none'
            && rect.bottom > 0 && rect.right > 0
            && rect.top < innerHeight && rect.left < innerWidth,
        };
      });
      assert(focused && ['A', 'BUTTON', 'INPUT'].includes(focused.tag), `Tab ${index + 1} did not land on an interactive control`);
      assert(focused.visible, `Tab ${index + 1} landed on a non-visible control`);
      sequence.push(`${focused.tag}:${focused.label}`);
    }
    assert(new Set(sequence).size >= 6, 'Keyboard focus did not advance through a meaningful order');
  });

  await runInteraction('branded 404 recovery', {}, async (page) => {
    await openPage(page, '/__launch-404-check');
    await page.getByTestId('button-404-home').click();
    await page.waitForURL(new RegExp(`${baseUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/?$`));
    await page.locator('h1').first().waitFor({ state: 'attached' });
  });
} finally {
  await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
}

if (failures.length || interactionFailures.length) {
  console.error(JSON.stringify({ routeFailures: failures, interactionFailures }, null, 2));
  process.exit(1);
}

if (!interactionsOnly) {
  console.log(`[a11y] PASS: ${routes.length * viewports.length * colorSchemes.length} rendered route/viewport/theme checks`);
}
console.log('[interaction] PASS: 12 rendered launch journeys');
