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
  '/marketflow/deals',
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
const previewStubHeader = 'x-pegasus-preview-stub';
const previewStubValue = 'backend-unavailable';
const previewStubApiPaths = new Set(['/api/auth/user']);
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

function json(response, status, body, headers = {}) {
  response.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    ...headers,
  });
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
    json(
      response,
      404,
      { message: 'Backend unavailable in rendered accessibility check' },
      { [previewStubHeader]: previewStubValue },
    );
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

function isAllowedBrowserUrl(rawUrl) {
  try {
    const url = new URL(rawUrl);
    if (!['http:', 'https:', 'ws:', 'wss:'].includes(url.protocol)) return true;
    if (url.protocol === 'http:' || url.protocol === 'https:') return url.origin === baseUrl;
    const webSocketOrigin = `${url.protocol === 'wss:' ? 'https:' : 'http:'}//${url.host}`;
    return webSocketOrigin === baseUrl;
  } catch {
    return false;
  }
}

async function newGuardedContext(browser, options) {
  const blockedEgress = [];
  const context = await browser.newContext({
    ...options,
    serviceWorkers: 'block',
  });
  await context.route('**/*', async (route) => {
    const request = route.request();
    if (!isAllowedBrowserUrl(request.url())) {
      const url = new URL(request.url());
      blockedEgress.push({
        protocol: url.protocol,
        url: request.url(),
        method: request.method(),
        resourceType: request.resourceType(),
        reason: 'outside exact rendered-preview origin',
      });
      await route.abort('blockedbyclient');
      return;
    }
    await route.continue();
  });
  await context.routeWebSocket('**/*', async (webSocket) => {
    if (!isAllowedBrowserUrl(webSocket.url())) {
      const url = new URL(webSocket.url());
      blockedEgress.push({
        protocol: url.protocol,
        url: webSocket.url(),
        resourceType: 'websocket',
        reason: 'outside exact rendered-preview origin',
      });
      await webSocket.close({ code: 1008, reason: 'Browser egress outside the preview origin is disabled' });
      return;
    }
    webSocket.connectToServer();
  });
  return { context, blockedEgress };
}

const failures = [];
const interactionFailures = [];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function isSameOriginAssetOrApi(request) {
  const url = new URL(request.url());
  if (url.origin !== baseUrl) return false;
  if (url.pathname.startsWith('/api/')) return true;
  return ['stylesheet', 'script', 'image', 'media', 'font', 'xhr', 'fetch', 'manifest']
    .includes(request.resourceType());
}

function monitorPageHealth(page) {
  const health = {
    pageErrors: [],
    consoleErrors: [],
    requestFailures: [],
    responseFailures: [],
    previewStubUrls: new Set(),
  };

  page.on('pageerror', (error) => health.pageErrors.push(String(error)));
  page.on('console', (message) => {
    if (message.type() !== 'error') return;
    health.consoleErrors.push({
      text: message.text(),
      location: message.location(),
    });
  });
  page.on('requestfailed', (request) => {
    if (!isSameOriginAssetOrApi(request)) return;
    health.requestFailures.push({
      url: request.url(),
      method: request.method(),
      resourceType: request.resourceType(),
      error: request.failure()?.errorText ?? 'unknown failure',
    });
  });
  page.on('response', (response) => {
    if (response.status() < 400 || !isSameOriginAssetOrApi(response.request())) return;
    const url = new URL(response.url());
    const isAllowedPreviewStub = previewStubApiPaths.has(url.pathname)
      && response.status() === 404
      && response.headers()[previewStubHeader] === previewStubValue;
    if (isAllowedPreviewStub) {
      health.previewStubUrls.add(response.url());
      return;
    }
    health.responseFailures.push({
      url: response.url(),
      status: response.status(),
      resourceType: response.request().resourceType(),
    });
  });

  return health;
}

function browserHealthFailures(health, blockedEgress, blockedEgressStart) {
  const consoleErrors = health.consoleErrors.filter(({ text, location }) => {
    const isAllowedPreviewNoise = health.previewStubUrls.has(location.url)
      && /^Failed to load resource:.*404/i.test(text);
    return !isAllowedPreviewNoise;
  });
  return {
    pageErrors: health.pageErrors,
    consoleErrors,
    requestFailures: health.requestFailures,
    responseFailures: health.responseFailures,
    blockedEgress: blockedEgress.slice(blockedEgressStart),
  };
}

function hasBrowserHealthFailures(browserHealth) {
  return Object.values(browserHealth).some((entries) => entries.length > 0);
}

async function runInteraction(name, options, check) {
  const browser = await launchBrowser();
  const { context, blockedEgress } = await newGuardedContext(browser, {
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
  const blockedEgressStart = blockedEgress.length;
  const health = monitorPageHealth(page);

  try {
    await check(page);
    const browserHealth = browserHealthFailures(health, blockedEgress, blockedEgressStart);
    assert(!hasBrowserHealthFailures(browserHealth), `Browser health failures: ${JSON.stringify(browserHealth)}`);
    console.log(`[interaction] ${name}: PASS`);
  } catch (error) {
    interactionFailures.push({
      name,
      error: String(error),
      browserHealth: browserHealthFailures(health, blockedEgress, blockedEgressStart),
    });
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
      const { context, blockedEgress } = await newGuardedContext(browser, {
        viewport,
        colorScheme,
        reducedMotion: 'reduce',
      });

      for (const route of routes) {
        const blockedEgressStart = blockedEgress.length;
        const page = await context.newPage();
        const health = monitorPageHealth(page);

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

        const browserHealth = browserHealthFailures(health, blockedEgress, blockedEgressStart);
        if (!response?.ok() || hasBrowserHealthFailures(browserHealth) || violations.length) {
          failures.push({
            colorScheme,
            viewport: viewportName,
            route,
            status: response?.status(),
            browserHealth,
            violations,
          });
        }
        const passed = response?.ok() && !hasBrowserHealthFailures(browserHealth) && !violations.length;
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

  await runInteraction('mobile navigation destination', { viewport: viewports[2][1], seedConsent: false }, async (page) => {
    await openPage(page, '/');
    const menuButton = page.locator('button[aria-controls="mobile-menu"]');
    await menuButton.click();
    assert(await menuButton.getAttribute('aria-expanded') === 'true', 'Mobile menu did not expand');
    const dialog = page.getByRole('dialog', { name: 'Primary navigation' });
    await dialog.getByRole('link', { name: 'Strategy Lab', exact: true }).first().click();
    await page.waitForURL(/\/strategy-lab$/);
    await page.locator('h1').first().waitFor({ state: 'attached' });

    await openPage(page, '/');
    const banner = page.getByTestId('cookie-consent-banner');
    await banner.waitFor({ state: 'visible', timeout: 5_000 });
    await menuButton.click();
    assert(await menuButton.getAttribute('aria-expanded') === 'true', 'Mobile menu did not re-open');
    await dialog.getByRole('button', { name: 'Talk to Peggy', exact: true }).click();

    const panel = page.locator('.peggy-panel');
    await panel.waitFor({ state: 'visible' });
    assert(await panel.getAttribute('aria-hidden') === 'false', 'Peggy panel remained hidden');
    const geometry = await page.evaluate(() => {
      const panelElement = document.querySelector('.peggy-panel');
      const bannerElement = document.querySelector('[data-testid="cookie-consent-banner"]');
      if (!(panelElement instanceof HTMLElement) || !(bannerElement instanceof HTMLElement)) return null;
      const panelRect = panelElement.getBoundingClientRect();
      const bannerRect = bannerElement.getBoundingClientRect();
      const style = getComputedStyle(panelElement);
      const overlapsConsent = panelRect.left < bannerRect.right
        && panelRect.right > bannerRect.left
        && panelRect.top < bannerRect.bottom
        && panelRect.bottom > bannerRect.top;
      return {
        renderedVisible: style.display !== 'none' && style.visibility !== 'hidden' && Number(style.opacity) > 0,
        insideViewport: panelRect.left >= 0
          && panelRect.right <= innerWidth
          && panelRect.top >= 0
          && panelRect.bottom <= innerHeight,
        overlapsConsent,
        panelRect: panelRect.toJSON(),
        bannerRect: bannerRect.toJSON(),
      };
    });
    assert(geometry?.renderedVisible, 'Peggy panel was not rendered visibly');
    assert(geometry?.insideViewport, `Peggy panel escaped the mobile viewport: ${JSON.stringify(geometry)}`);
    assert(!geometry?.overlapsConsent, `Peggy panel overlapped cookie consent: ${JSON.stringify(geometry)}`);
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
    const homepagePrimaryCta = page
      .locator('[data-hv="arrival"]')
      .getByRole('link', { name: 'Bring an Opportunity', exact: true });
    assert(await homepagePrimaryCta.count() === 1, 'Homepage hero did not expose one primary conversion CTA');
    await homepagePrimaryCta.waitFor({ state: 'visible' });
    assert(
      await homepagePrimaryCta.getAttribute('href') === '/bring-an-opportunity',
      'Homepage hero CTA did not use the canonical intake URL',
    );
    await homepagePrimaryCta.click();
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

  await runInteraction('MarketFlow public boundaries and reviewed access path', {}, async (page) => {
    await openPage(page, '/marketflow/deals');
    await page.locator('.pg-root nav').waitFor({ state: 'visible' });
    assert(await page.locator('.pg-root footer').count() === 1, 'Premium public footer was not rendered');
    await page.getByRole('heading', { name: /Reviewed opportunities are not shown as sample inventory/i }).waitFor({ state: 'visible' });
    const submitDeal = page.getByTestId('button-marketflow-submit-deal');
    assert(
      await submitDeal.evaluate((element) => element.closest('a')?.getAttribute('href'))
        === '/bring-an-opportunity?intent=deal-jv',
      'MarketFlow deal CTA did not use the canonical JV intake URL',
    );
    assert(await page.getByTestId('text-deals-title').count() === 0, 'Private deal inventory rendered anonymously');
    assert(await page.locator('[data-testid^="card-deal-"]').count() === 0, 'Private deal cards rendered anonymously');
    assert(await page.getByTestId('button-sidebar-toggle').count() === 0, 'Operator sidebar chrome rendered anonymously');

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
