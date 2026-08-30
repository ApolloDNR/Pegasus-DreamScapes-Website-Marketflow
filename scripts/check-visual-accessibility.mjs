import { existsSync } from 'node:fs';
import { mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import path from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';
import { sitemapEntries } from '../shared/seo-routes.ts';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const buildRoot = path.join(projectRoot, 'dist/public');
const axeSource = await readFile(path.join(projectRoot, 'node_modules/axe-core/axe.min.js'), 'utf8');

const releaseRoutes = [
  '/',
  '/property-owners',
  '/deal-partners',
  '/how-we-operate',
  '/development',
  '/capital',
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

const fullPublicRouteExtras = [
  '/marketflow/buyboxes',
  '/marketflow/deals',
  '/strategy-lab/library',
  '/strategy-lab/submitted',
  '/strategy-lab/blueprint-confirmed',
  '/strategy-lab?tool=calculators',
  '/login',
  '/signup',
  '/forgot-password',
  '/reset-password',
  '/saved',
  '/snapshot/calc/rendered-qa-calculator',
  '/snapshot/property/rendered-qa-property',
  '/snapshot/rendered-qa-status',
  '/__launch-404-check',
];

const fullPublicRoutes = [...new Set([
  ...sitemapEntries().map(({ path: route }) => route),
  ...fullPublicRouteExtras,
])];
const publicRouteCoverage = process.env.A11Y_PUBLIC_ROUTE_COVERAGE === 'full'
  ? 'full'
  : 'release';
const routes = publicRouteCoverage === 'full' ? fullPublicRoutes : releaseRoutes;

const viewports = [
  ['desktop-1440', { width: 1440, height: 940 }],
  ['tablet-1024', { width: 1024, height: 900 }],
  ['tablet-768', { width: 768, height: 1024 }],
  ['mobile-390', { width: 390, height: 844 }],
];

const colorSchemes = ['dark', 'light'];
const previewStubHeader = 'x-pegasus-preview-stub';
const previewStubValue = 'backend-unavailable';
const qaResponseHeader = 'x-pegasus-qa-response';
const qaFailureMarker = 'marker-503';
const previewStubApiPaths = new Set(['/api/auth/user']);
const previewStubTokenApiPrefixes = [
  '/api/property-analyses/by-token/',
  '/api/shared-analyses/',
];
const renderedQaPropertyToken = 'rendered-qa-property';
const renderedQaCalculatorToken = 'rendered-qa-calculator';
const publicAnalysisOutputContext = {
  source: 'user_entered_inputs_and_automated_model',
  verifiedByPegasus: false,
  label: 'Generated from user-entered, unverified inputs and automated model assumptions.',
  disclaimer: 'This shared output does not represent a Pegasus review or recommendation, offer, valuation, appraisal, financing commitment, or guarantee.',
};

function isAllowedPreviewStubApiPath(pathname) {
  if (previewStubApiPaths.has(pathname)) return true;
  return previewStubTokenApiPrefixes.some((prefix) => {
    if (!pathname.startsWith(prefix)) return false;
    const token = pathname.slice(prefix.length);
    return token.length > 0 && !token.includes('/');
  });
}

const interactionsOnly = process.env.A11Y_INTERACTIONS_ONLY === '1';
const expectedRouteCheckCount = interactionsOnly
  ? 0
  : routes.length * viewports.length * colorSchemes.length;
let interactionJourneyCount = 0;
let screenshotCount = 0;
const screenshotDir = process.env.A11Y_SCREENSHOT_DIR
  ? path.resolve(process.env.A11Y_SCREENSHOT_DIR)
  : null;
if (screenshotDir) await mkdir(screenshotDir, { recursive: true });

async function captureScreenshot(page, filename) {
  if (!screenshotDir) return;
  await page.screenshot({
    path: path.join(screenshotDir, filename),
    fullPage: true,
  });
  screenshotCount += 1;
}

const pendingControlledReleases = new Set();

function createControlledRelease(label, timeoutMs = 10_000) {
  let released = false;
  let waitPromise;
  let resolveGate;
  let timeout;
  const releaseControl = {
    wait() {
      if (released) return Promise.resolve();
      if (!waitPromise) {
        waitPromise = new Promise((resolve, reject) => {
          resolveGate = resolve;
          timeout = setTimeout(
            () => {
              pendingControlledReleases.delete(releaseControl);
              reject(new Error(`${label} was not released within ${timeoutMs}ms`));
            },
            timeoutMs,
          );
        });
      }
      return waitPromise;
    },
    release() {
      if (released) return;
      released = true;
      pendingControlledReleases.delete(releaseControl);
      clearTimeout(timeout);
      resolveGate?.();
    },
  };
  pendingControlledReleases.add(releaseControl);
  return releaseControl;
}

function releasePendingControlledEvents() {
  for (const releaseControl of [...pendingControlledReleases]) {
    releaseControl.release();
  }
}

function getViewport(name) {
  const viewport = viewports.find(([candidate]) => candidate === name)?.[1];
  if (!viewport) throw new Error(`Unknown rendered QA viewport: ${name}`);
  return viewport;
}

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

const renderedQaPropertySnapshot = {
  id: 84,
  visibility: 'full',
  address: '200 Model Avenue',
  city: 'Oakland',
  state: 'CA',
  zip: '94601',
  propertyInput: {
    address: '200 Model Avenue',
    city: 'Oakland',
    state: 'CA',
    zip: '94601',
    askingPrice: 500000,
    arvEstimate: 700000,
    rehabBudget: 90000,
    marketRent: 3200,
    beds: 3,
    baths: 2,
    sqft: 1400,
  },
  snapshot: {
    engineVersion: 'rendered-qa-v1',
    topLane: 'flip',
    lanes: [{
      lane: 'flip',
      laneLabel: 'Fix and Flip',
      headline: 'The automated model identifies a possible value-add path from the entered assumptions.',
      verdict: 'possible',
      verdictLabel: 'Possible fit',
      economics: {
        primaryMetric: 'Modeled gross spread',
        primaryValue: '$110K',
      },
    }],
    totalCashIn: 215000,
    risks: [{
      category: 'valuation',
      severity: 'watch',
      title: 'Entered ARV requires independent verification',
      detail: 'The model uses a visitor-entered after-repair value and does not independently verify comparable sales.',
    }],
    capitalStack: [{
      source: 'down_payment',
      label: 'Modeled cash contribution',
      amount: 125000,
      note: 'Illustrative assumption only',
    }],
    memo: {
      paragraph: 'This automated summary reflects the supplied property facts and assumptions. It has not been reviewed or verified by Pegasus.',
      nextStep: 'Independently verify the property facts, scope, valuation, and financing assumptions.',
    },
  },
  createdAt: '2026-01-01T00:00:00.000Z',
  outputContext: publicAnalysisOutputContext,
};

const renderedQaCalculatorAnalysis = {
  id: 85,
  name: 'Rendered QA ROI model',
  calculatorType: 'roi',
  propertyAddress: '200 Model Avenue, Oakland, CA',
  inputs: {
    purchasePrice: 500000,
    rehabBudget: 90000,
    projectedSalePrice: 700000,
  },
  results: {
    modeledGrossSpread: 110000,
    modeledReturnOnCost: 18.64,
  },
  primaryMetric: 'Modeled gross spread',
  primaryValue: '$110,000',
  secondaryMetric: 'Modeled return on cost',
  secondaryValue: '18.64%',
  scenarioLabel: 'User-entered base case',
  notes: 'User-entered note: figures are unverified and provided only for deterministic rendered QA.',
  sharedAt: '2026-01-01T00:00:00.000Z',
  createdAt: '2026-01-01T00:00:00.000Z',
  viewCount: 0,
  outputContext: publicAnalysisOutputContext,
};

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
  if (pathname === '/api/projects') {
    json(response, 200, []);
    return;
  }
  if (pathname === '/api/projects/nelson-dr') {
    json(response, 200, {
      id: 1,
      slug: 'nelson-dr',
      createdAt: '2025-09-23T00:00:00.000Z',
    });
    return;
  }
  if (pathname === `/api/property-analyses/by-token/${renderedQaPropertyToken}`) {
    json(response, 200, renderedQaPropertySnapshot);
    return;
  }
  if (pathname === `/api/property-analyses/by-token/${renderedQaCalculatorToken}`) {
    json(
      response,
      404,
      { message: 'No property snapshot exists for this calculator token' },
      { [previewStubHeader]: previewStubValue },
    );
    return;
  }
  if (pathname === `/api/shared-analyses/${renderedQaCalculatorToken}`) {
    json(response, 200, renderedQaCalculatorAnalysis);
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
const launchedBrowsers = new Set();
async function launchBrowser() {
  const browser = await chromium.launch({
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
  launchedBrowsers.add(browser);
  browser.on('disconnected', () => launchedBrowsers.delete(browser));
  return browser;
}

function isAllowedBrowserUrl(rawUrl) {
  try {
    const url = new URL(rawUrl);
    if (['about:', 'data:', 'blob:'].includes(url.protocol)) return true;
    if (!['http:', 'https:', 'ws:', 'wss:'].includes(url.protocol)) return false;
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

function observeBrowserEvent(promise) {
  return promise.then(
    (value) => ({ status: 'fulfilled', value }),
    (error) => ({ status: 'rejected', error }),
  );
}

function unwrapBrowserEvent(observation) {
  if (observation.status === 'rejected') throw observation.error;
  return observation.value;
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
    consoleWarnings: [],
    requestFailures: [],
    responseFailures: [],
    previewStubUrls: new Set(),
    activeRequests: new Set(),
    requestActivityGeneration: 0,
    lastRequestActivityAt: Date.now(),
  };

  const markRequestActivity = () => {
    health.requestActivityGeneration += 1;
    health.lastRequestActivityAt = Date.now();
  };

  page.on('request', (request) => {
    if (!isSameOriginAssetOrApi(request)) return;
    health.activeRequests.add(request);
    markRequestActivity();
  });
  page.on('requestfinished', (request) => {
    if (!isSameOriginAssetOrApi(request)) return;
    health.activeRequests.delete(request);
    markRequestActivity();
  });
  page.on('pageerror', (error) => health.pageErrors.push(String(error)));
  page.on('console', (message) => {
    if (!['error', 'warning', 'warn'].includes(message.type())) return;
    const entry = {
      text: message.text(),
      location: message.location(),
    };
    if (message.type() === 'error') health.consoleErrors.push(entry);
    else health.consoleWarnings.push(entry);
  });
  page.on('requestfailed', (request) => {
    if (!isSameOriginAssetOrApi(request)) return;
    health.activeRequests.delete(request);
    markRequestActivity();
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
    const isAllowedPreviewStub = isAllowedPreviewStubApiPath(url.pathname)
      && response.status() === 404
      && response.headers()[previewStubHeader] === previewStubValue;
    const isAllowedQaFailure = response.status() === 503
      && response.headers()[qaResponseHeader] === qaFailureMarker;
    if (isAllowedPreviewStub || isAllowedQaFailure) {
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
  const keepUnexpectedConsoleEntry = ({ text, location }) => {
    const isAllowedPreviewNoise = health.previewStubUrls.has(location.url)
      && /^Failed to load resource:/i.test(text);
    const isExpectedHermeticMapFallback = text === 'Google Maps API key not configured.';
    return !isAllowedPreviewNoise && !isExpectedHermeticMapFallback;
  };
  return {
    pageErrors: health.pageErrors,
    consoleErrors: health.consoleErrors.filter(keepUnexpectedConsoleEntry),
    consoleWarnings: health.consoleWarnings.filter(keepUnexpectedConsoleEntry),
    requestFailures: health.requestFailures,
    responseFailures: health.responseFailures,
    blockedEgress: blockedEgress.slice(blockedEgressStart),
  };
}

function hasBrowserHealthFailures(browserHealth) {
  return Object.values(browserHealth).some((entries) => entries.length > 0);
}

async function settleRenderedPage(page) {
  const settleStatus = await page.evaluate(async () => {
    const nextFrame = () => new Promise((resolve) => requestAnimationFrame(resolve));
    const completesWithin = (promise, timeoutMs) => new Promise((resolve) => {
      const timer = setTimeout(() => resolve(false), timeoutMs);
      Promise.resolve(promise).then(
        () => {
          clearTimeout(timer);
          resolve(true);
        },
        () => {
          clearTimeout(timer);
          resolve(false);
        },
      );
    });
    const increment = Math.max(window.innerHeight, 480);
    let offset = 0;
    let stableBottomPasses = 0;

    for (let pass = 0; pass < 160 && stableBottomPasses < 2; pass += 1) {
      const documentHeight = document.documentElement.scrollHeight;
      window.scrollTo(0, offset);
      await nextFrame();
      const nextHeight = document.documentElement.scrollHeight;
      if (offset >= nextHeight - window.innerHeight) stableBottomPasses += 1;
      else stableBottomPasses = 0;
      offset = Math.min(offset + increment, nextHeight);
    }
    window.scrollTo(0, document.documentElement.scrollHeight);
    await nextFrame();

    const fontsReady = await completesWithin(document.fonts.ready, 5_000);
    const fontsTimedOut = !fontsReady;

    const imageDecode = Promise.allSettled(
      Array.from(document.images, (image) => image.decode()),
    );
    const imagesDecoded = await completesWithin(imageDecode, 5_000);
    const imageDecodeTimedOut = !imagesDecoded;

    window.scrollTo(0, 0);
    await nextFrame();
    await nextFrame();
    return { fontsReady, fontsTimedOut, imageDecodeTimedOut };
  });

  const renderedState = await page.evaluate(() => {
    const root = document.documentElement;
    const hasHorizontalOverflow = root.scrollWidth > window.innerWidth + 1;
    const overflowElements = hasHorizontalOverflow
      ? Array.from(document.querySelectorAll('body *'))
        .map((element) => {
          const rect = element.getBoundingClientRect();
          return {
            tag: element.tagName.toLowerCase(),
            id: element.id,
            className: typeof element.className === 'string' ? element.className.slice(0, 120) : '',
            left: Math.round(rect.left),
            right: Math.round(rect.right),
          };
        })
        .filter(({ left, right }) => left < -1 || right > window.innerWidth + 1)
        .slice(0, 12)
      : [];
    const runningAnimations = document.getAnimations()
      .filter((animation) => animation.playState === 'running')
      .map((animation) => {
        const target = animation.effect?.target;
        return {
          tag: target instanceof Element ? target.tagName.toLowerCase() : 'unknown',
          id: target instanceof Element ? target.id : '',
          className: target instanceof Element && typeof target.className === 'string'
            ? target.className.slice(0, 120)
            : '',
        };
      })
      .slice(0, 12);
    const brokenImages = Array.from(document.images)
      .filter((image) => image.complete && image.naturalWidth === 0)
      .map((image) => image.currentSrc || image.src)
      .slice(0, 12);
    const incompleteImages = Array.from(document.images)
      .filter((image) => !image.complete)
      .map((image) => image.currentSrc || image.src)
      .slice(0, 12);

    return {
      reducedMotionRequested: matchMedia('(prefers-reduced-motion: reduce)').matches,
      runningAnimations,
      horizontalOverflow: hasHorizontalOverflow
        ? { viewportWidth: window.innerWidth, scrollWidth: root.scrollWidth, overflowElements }
        : null,
      brokenImages,
      incompleteImages,
    };
  });
  return { ...settleStatus, ...renderedState };
}

function hasRenderedPageFailures(renderedPage) {
  return !renderedPage.fontsReady
    || renderedPage.fontsTimedOut
    || renderedPage.imageDecodeTimedOut
    || !renderedPage.reducedMotionRequested
    || renderedPage.runningAnimations.length > 0
    || renderedPage.horizontalOverflow !== null
    || renderedPage.brokenImages.length > 0
    || renderedPage.incompleteImages.length > 0;
}

async function waitForActiveRequestCount(
  health,
  expectedCount,
  timeoutMs = 8_000,
  stableMs = 150,
) {
  const deadline = Date.now() + timeoutMs;
  let stableSince = null;
  let observedGeneration = health.requestActivityGeneration;
  while (Date.now() < deadline) {
    if (health.requestActivityGeneration !== observedGeneration) {
      observedGeneration = health.requestActivityGeneration;
      stableSince = null;
    }
    if (health.activeRequests.size === expectedCount) {
      stableSince ??= Math.max(Date.now(), health.lastRequestActivityAt);
      if (
        Date.now() - stableSince >= stableMs &&
        Date.now() - health.lastRequestActivityAt >= stableMs
      ) break;
    } else {
      stableSince = null;
    }
    await delay(50);
  }
  const stableForMs = stableSince === null ? 0 : Date.now() - stableSince;
  return {
    expectedCount,
    actualCount: health.activeRequests.size,
    stableForMs,
    requiredStableMs: stableMs,
    requestActivityGeneration: health.requestActivityGeneration,
    millisSinceRequestActivity: Date.now() - health.lastRequestActivityAt,
    settled: health.activeRequests.size === expectedCount
      && stableForMs >= stableMs
      && Date.now() - health.lastRequestActivityAt >= stableMs,
    urls: [...health.activeRequests].map((request) => request.url()).sort(),
  };
}

async function settleEvidenceState(
  page,
  health,
  expectedActiveRequests = 0,
  timeoutMs = 8_000,
) {
  // Evidence is a two-phase fixed point. The first full-page render activates
  // lazy assets, and the first request wait lets their responses update the
  // DOM. The second pass then inspects that updated DOM and reconfirms the
  // expected request state immediately before evidence is accepted.
  await settleRenderedPage(page);
  const firstRequestState = await waitForActiveRequestCount(
    health,
    expectedActiveRequests,
    timeoutMs,
  );
  const renderedPage = await settleRenderedPage(page);
  const requestState = await waitForActiveRequestCount(
    health,
    expectedActiveRequests,
    timeoutMs,
  );
  return { firstRequestState, renderedPage, requestState };
}

async function settleAfterInteraction(page, health, timeoutMs = 8_000) {
  await delay(100);
  const { firstRequestState, renderedPage, requestState } =
    await settleEvidenceState(page, health, 0, timeoutMs);
  assert(
    !hasRenderedPageFailures(renderedPage),
    `Rendered page did not settle after interaction: ${JSON.stringify(renderedPage)}`,
  );
  assert(
    firstRequestState.settled && requestState.settled,
    `Interaction left same-origin requests unsettled: ${JSON.stringify({ firstRequestState, requestState })}`,
  );
  return renderedPage;
}

async function captureEvidenceScreenshot(
  page,
  health,
  filename,
  { expectedActiveRequests = 0 } = {},
) {
  const { firstRequestState, renderedPage, requestState } =
    await settleEvidenceState(page, health, expectedActiveRequests);
  assert(
    !hasRenderedPageFailures(renderedPage),
    `Screenshot ${filename} captured an unsettled page: ${JSON.stringify(renderedPage)}`,
  );
  assert(
    firstRequestState.settled && requestState.settled,
    `Screenshot ${filename} had ambiguous request state: ${JSON.stringify({ firstRequestState, requestState })}`,
  );
  await captureScreenshot(page, filename);
}

async function runInteraction(name, options, check) {
  interactionJourneyCount += 1;
  const browser = await launchBrowser();
  const { context, blockedEgress } = await newGuardedContext(browser, {
    viewport: options.viewport ?? getViewport('desktop-1440'),
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
    await check(page, health);
    await settleAfterInteraction(page, health);
    const browserHealth = browserHealthFailures(health, blockedEgress, blockedEgressStart);
    assert(!hasBrowserHealthFailures(browserHealth), `Browser health failures: ${JSON.stringify(browserHealth)}`);
    console.log(`[interaction] ${name}: PASS`);
  } catch (error) {
    const failure = {
      name,
      error: String(error),
      browserHealth: browserHealthFailures(health, blockedEgress, blockedEgressStart),
    };
    interactionFailures.push(failure);
    console.error(`[interaction-detail] ${JSON.stringify(failure)}`);
    console.log(`[interaction] ${name}: FAIL`);
  } finally {
    releasePendingControlledEvents();
    try {
      await page.unrouteAll({ behavior: 'wait' });
    } finally {
      try {
        await context.close();
      } finally {
        await browser.close();
      }
    }
  }
}

async function openPage(page, route) {
  const response = await page.goto(`${baseUrl}${route}`, { waitUntil: 'load', timeout: 45_000 });
  assert(response?.ok(), `${route} returned ${response?.status() ?? 'no response'}`);
  await page.locator('h1').first().waitFor({ state: 'attached', timeout: 10_000 });
  await settleRenderedPage(page);
}

const approvedMarketflowFixtures = {
  wholesale: {
    id: 501,
    propertyAddress: '501 Evidence Avenue',
    address: '501 Evidence Avenue',
    city: 'Oakland',
    state: 'CA',
    zipCode: '94612',
    propertyType: 'Single Family',
    arv: 640000,
    askingPrice: 425000,
    contractPrice: 415000,
    repairEstimate: 65000,
    assignmentFee: 10000,
    bedrooms: 3,
    bathrooms: 2,
    squareFeet: 1680,
    description: 'Deterministic rendered-QA wholesale fixture.',
    canRequestJv: true,
    negotiationAllowed: true,
    status: 'active',
    photos: [],
    images: [],
  },
  capital: {
    id: 601,
    title: 'Evidence Row Rehabilitation',
    location: 'Richmond, CA',
    strategy: 'value-add',
    structure: 'EQUITY',
    fundingGoal: 1200000,
    amountRaised: 480000,
    minInvestment: 25000,
    projectedReturn: '18% target IRR',
    askingProfitSplit: '70 / 30',
    status: 'OPEN',
    images: [],
  },
  listing: {
    id: 701,
    propertyAddress: '701 Proof Place',
    city: 'Berkeley',
    state: 'CA',
    zipCode: '94704',
    propertyType: 'Single Family',
    listPrice: 825000,
    bedrooms: 3,
    bathrooms: 2,
    sqft: 1540,
    listingType: 'on_market',
    status: 'active',
    images: [],
  },
};

async function installApprovedMarketflowStubs(page, { initialState = 'loading' } = {}) {
  const inventoryState = {
    wholesale: initialState,
    capital: initialState,
    listings: initialState,
  };
  const loadingGates = initialState === 'loading'
    ? {
      wholesale: createControlledRelease('wholesale inventory loading state', 45_000),
      capital: createControlledRelease('capital inventory loading state', 45_000),
      listings: createControlledRelease('listing inventory loading state', 45_000),
    }
    : {};
  let canRequestJv = true;
  let savedItems = [];

  const fulfillJson = (route, status, body, headers = {}) => route.fulfill({
    status,
    contentType: 'application/json',
    headers,
    body: JSON.stringify(body),
  });

  await page.route(`${baseUrl}/api/**`, async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const { pathname } = url;
    const method = request.method();

    if (pathname === '/api/site-content') return fulfillJson(route, 200, []);
    if (pathname === '/api/config/supabase') return fulfillJson(route, 200, {});
    if (pathname === '/api/config/google-maps') return fulfillJson(route, 200, {});
    if (pathname === '/api/auth/user') {
      return fulfillJson(route, 200, {
        id: 'qa-marketflow-operator',
        email: 'qa.marketflow@pegasus.test',
        firstName: 'QA',
        lastName: 'Operator',
        role: 'pegasus_wholesaler',
        roles: ['pegasus_wholesaler'],
        isAdmin: false,
        isStaff: true,
        createdAt: '2026-01-01T00:00:00.000Z',
      });
    }
    if (pathname === '/api/supabase/profile/qa-marketflow-operator') {
      return fulfillJson(route, 200, {
        id: 'qa-marketflow-profile',
        user_id: 'qa-marketflow-operator',
        primary_role: 'pegasus_wholesaler',
        display_name: 'QA Operator',
        is_pegasus_badged: true,
        pegasus_role_type: 'pegasus_wholesaler',
        created_at: '2026-01-01T00:00:00.000Z',
        updated_at: '2026-01-01T00:00:00.000Z',
      });
    }

    const laneByPath = {
      '/api/wholesale-deals': 'wholesale',
      '/api/capital-projects': 'capital',
      '/api/listings': 'listings',
    };
    const lane = laneByPath[pathname];
    if (lane && method === 'GET') {
      if (inventoryState[lane] === 'loading') await loadingGates[lane].wait();
      if (inventoryState[lane] === 'error') {
        return fulfillJson(
          route,
          503,
          { message: `Rendered QA ${lane} marker-503` },
          { [qaResponseHeader]: qaFailureMarker },
        );
      }
      if (inventoryState[lane] === 'empty') return fulfillJson(route, 200, []);
      const fixture = lane === 'wholesale'
        ? { ...approvedMarketflowFixtures.wholesale, canRequestJv }
        : approvedMarketflowFixtures[lane === 'capital' ? 'capital' : 'listing'];
      return fulfillJson(route, 200, [fixture]);
    }

    if (pathname === '/api/wholesale-deals/501' && method === 'GET') {
      return fulfillJson(route, 200, {
        ...approvedMarketflowFixtures.wholesale,
        canRequestJv,
      });
    }
    if (pathname === '/api/listings/701' && method === 'GET') {
      return fulfillJson(route, 200, approvedMarketflowFixtures.listing);
    }
    if (pathname === '/api/supabase/saved-items') {
      if (method === 'GET') return fulfillJson(route, 200, savedItems);
      assert(method === 'POST' || method === 'DELETE', `Unsafe saved-item method ${method}`);
      const payload = request.postDataJSON();
      assert(
        ['wholesale_deal', 'capital_project', 'listing'].includes(payload.itemType),
        `Unexpected saved-item type ${payload.itemType}`,
      );
      assert(typeof payload.itemId === 'string', 'Saved-item id was not normalized to a string');
      savedItems = method === 'POST'
        ? [{
          id: 'qa-saved-item',
          externalUserId: 'qa-marketflow-operator',
          itemType: payload.itemType,
          itemId: payload.itemId,
          createdAt: '2026-01-01T00:00:00.000Z',
        }]
        : [];
      return fulfillJson(route, 200, method === 'POST' ? savedItems[0] : { deleted: true });
    }

    const emptyArrayPaths = new Set([
      '/api/supabase/notifications',
      '/api/marketplace/wholesaler/jv-requests',
      '/api/supabase/capital-commitments',
      '/api/supabase/buyer-offers',
      '/api/notifications',
      '/api/saved-searches',
      '/api/investor-activity',
    ]);
    if (emptyArrayPaths.has(pathname) && method === 'GET') return fulfillJson(route, 200, []);
    if (pathname === '/api/notifications/unread-count' && method === 'GET') {
      return fulfillJson(route, 200, { count: 0 });
    }
    if (pathname === '/api/analytics/track' && method === 'POST') {
      return fulfillJson(route, 201, { recorded: true });
    }

    return fulfillJson(route, 418, {
      message: `Unrecognized rendered-QA API contract: ${method} ${pathname}`,
    });
  });

  return {
    inventoryState,
    releaseLoadingAsError() {
      for (const lane of ['wholesale', 'capital', 'listings']) {
        inventoryState[lane] = 'error';
        loadingGates[lane].release();
      }
    },
    setLaneState(lane, state) {
      inventoryState[lane] = state;
    },
    setCanRequestJv(value) {
      canRequestJv = value;
    },
  };
}

async function captureInventoryState(
  page,
  health,
  testId,
  filename,
  options,
) {
  await page.getByTestId(testId).waitFor({ state: 'visible', timeout: 18_000 });
  await captureEvidenceScreenshot(page, health, filename, options);
}

let fatalFailure = null;
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
        await settleRenderedPage(page);
        const firstRequestState = await waitForActiveRequestCount(health, 0);
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
        const renderedPage = await settleRenderedPage(page);
        const requestState = await waitForActiveRequestCount(health, 0);
        const requestsSettled = firstRequestState.settled && requestState.settled;

        if (
          screenshotDir &&
          requestsSettled &&
          !hasRenderedPageFailures(renderedPage)
        ) {
          const slug = route === '/' ? 'home' : route.replace(/^\//, '').replace(/[^a-z0-9]+/gi, '-');
          await captureScreenshot(page, `${slug}-${viewportName}-${colorScheme}.png`);
        }

        const browserHealth = browserHealthFailures(health, blockedEgress, blockedEgressStart);
        if (!response?.ok()
          || !requestsSettled
          || hasBrowserHealthFailures(browserHealth)
          || hasRenderedPageFailures(renderedPage)
          || violations.length) {
          const failure = {
            colorScheme,
            viewport: viewportName,
            route,
            status: response?.status(),
            firstRequestState,
            requestState,
            browserHealth,
            renderedPage,
            violations,
          };
          failures.push(failure);
          console.error(`[a11y-detail] ${JSON.stringify(failure)}`);
        }
        const passed = response?.ok()
          && requestsSettled
          && !hasBrowserHealthFailures(browserHealth)
          && !hasRenderedPageFailures(renderedPage)
          && !violations.length;
        console.log(`[a11y] ${colorScheme} ${viewportName} ${route}: ${passed ? 'PASS' : 'FAIL'}`);
        await page.close();
      }

      await context.close();
      await browser.close();
    }
  }

  await runInteraction('desktop navigation spine', {}, async (page) => {
    await openPage(page, '/');
    const navigation = page.locator('nav');
    const expected = [
      ['How We Operate', '/how-we-operate'],
      ['Property Owners', '/property-owners'],
      ['Deal Partners', '/deal-partners'],
      ['Our Work', '/our-work'],
      ['About', '/about'],
    ];
    for (const [label, href] of expected) {
      const link = navigation.getByRole('link', { name: label, exact: true });
      assert(await link.count() === 1, `Desktop navigation did not expose exactly one ${label} link`);
      assert(await link.getAttribute('href') === href, `${label} did not resolve to ${href}`);
    }
    assert(await navigation.getByRole('button', { name: /^More/ }).count() === 0, 'Desktop navigation regressed to a More directory');
  });

  await runInteraction('mobile navigation destination', { viewport: getViewport('mobile-390'), seedConsent: false }, async (page) => {
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
    await page.waitForFunction(() => {
      const panelElement = document.querySelector('.peggy-panel');
      if (!(panelElement instanceof HTMLElement)) return false;
      const style = getComputedStyle(panelElement);
      return style.display !== 'none'
        && style.visibility !== 'hidden'
        && Number(style.opacity) >= 0.99;
    });
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

    const geometrySelectors = [
      '.hv-hero-top',
      '[data-testid="approved-home-hero-image"]',
      '.hv-eyebrow-row',
      '.hv-h1',
      '.hv-cta-row',
      '.hv-hero-statbar',
      'nav > div:nth-child(2)',
    ];
    const geometryAt = async () => page.evaluate((selectors) => {
      const hero = document.querySelector('[data-testid="approved-home-hero-image"]');
      return {
        src: hero?.currentSrc || hero?.getAttribute('src'),
        objectPosition: hero ? getComputedStyle(hero).objectPosition : null,
        boxes: selectors.map((selector) => {
          const element = document.querySelector(selector);
          const rect = element?.getBoundingClientRect();
          return rect ? { selector, x: rect.x, y: rect.y, width: rect.width, height: rect.height } : null;
        }),
      };
    }, geometrySelectors);

    for (const viewport of [
      { width: 1440, height: 940 },
      { width: 1024, height: 900 },
      { width: 390, height: 844 },
    ]) {
      await page.setViewportSize(viewport);
      await page.evaluate(async () => {
        await document.fonts.ready;
        await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      });
      const before = await geometryAt();
      await page.getByRole('button', { name: 'Switch to light mode' }).click();
      await page.waitForFunction(() => document.querySelector('.pg-root')?.getAttribute('data-theme') !== 'dark');
      const after = await geometryAt();

      assert(before.src === after.src, `Theme changed hero source at ${viewport.width}px`);
      assert(before.objectPosition === after.objectPosition, `Theme changed hero crop at ${viewport.width}px`);
      for (const geometry of [before, after]) {
        const frame = geometry.boxes[0];
        const image = geometry.boxes[1];
        assert(frame && image, `Hero frame or image was missing at ${viewport.width}px`);
        assert(
          Math.abs(frame.x - image.x) <= 2
            && Math.abs(frame.y - image.y) <= 2
            && Math.abs(frame.width - image.width) <= 2
            && Math.abs(frame.height - image.height) <= 2,
          `Hero image did not fill its stable frame at ${viewport.width}px: frame=${JSON.stringify(frame)} image=${JSON.stringify(image)}`,
        );
      }
      before.boxes.forEach((box, index) => {
        const next = after.boxes[index];
        assert(box && next, `Theme geometry selector was missing at ${viewport.width}px`);
        for (const key of ['x', 'y', 'width', 'height']) {
          const delta = Math.abs(box[key] - next[key]);
          assert(
            delta <= 2,
            `Theme shifted ${box.selector} ${key} at ${viewport.width}px: before=${box[key]} after=${next[key]} delta=${delta}`,
          );
        }
      });

      if (viewport.width !== 390) {
        await page.getByRole('button', { name: 'Switch to dark mode' }).click();
        await page.waitForFunction(() => document.querySelector('.pg-root')?.getAttribute('data-theme') === 'dark');
      }
    }

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
    const destinationHeading = page.getByRole('heading', {
      name: 'Bring the property, the contract, the project, or the plan.',
      level: 1,
      exact: true,
    });
    await destinationHeading.waitFor({ state: 'visible' });
  });

  for (const [intakeViewportName, intakeViewport] of viewports) {
    await runInteraction(
      `opportunity intake submission states ${intakeViewportName}`,
      { viewport: intakeViewport },
      async (page, health) => {
        let attempt = 0;
        const firstAttemptRelease = createControlledRelease(
          `${intakeViewportName} first intake response`,
        );
        const secondAttemptRelease = createControlledRelease(
          `${intakeViewportName} retry intake response`,
        );
        const expectedPayload = {
          hp_company: '',
          sourcePage: '/bring-an-opportunity',
          leadSource: 'public_website_v1',
          visitorType: 'owner',
          contactName: 'Avery Stone',
          email: 'qa.intake@example.com',
          phone: '5105550191',
          preferredContactMethod: 'Email',
          bestTimeToContact: 'Weekday mornings',
          propertyAddress: '291 Pegasus Way',
          city: 'Richmond',
          state: 'CA',
          zipCode: '94801',
          propertyType: 'Single-family',
          occupancyStatus: 'Vacant',
          condition: 'Moderate repairs',
          situation: 'Just exploring',
          goal: 'Not sure',
          urgency: 'No immediate deadline',
          estimatedValue: 650000,
          estimatedDebt: 225000,
          notes: 'Rendered QA exact-safe submission.',
          consentAccepted: true,
        };
        const expectedPayloadKeys = [...Object.keys(expectedPayload), 'ts_elapsed_ms'].sort();

        await page.route(`${baseUrl}/api/opportunities`, async (route) => {
          const request = route.request();
          assert(request.method() === 'POST', `Intake used unsafe method ${request.method()}`);
          const payload = request.postDataJSON();
          assert(
            JSON.stringify(Object.keys(payload).sort()) === JSON.stringify(expectedPayloadKeys),
            `Intake payload keys changed: ${JSON.stringify(Object.keys(payload).sort())}`,
          );
          const { ts_elapsed_ms: elapsedMs, ...staticPayload } = payload;
          assert(
            Number.isFinite(elapsedMs) && elapsedMs >= 0 && elapsedMs < 60_000,
            `Intake elapsed marker was invalid: ${elapsedMs}`,
          );
          assert(
            JSON.stringify(staticPayload) === JSON.stringify(expectedPayload),
            `Intake payload changed: ${JSON.stringify(staticPayload)}`,
          );

          attempt += 1;
          assert(attempt <= 2, `Intake made an unexpected attempt ${attempt}`);
          await (attempt === 1 ? firstAttemptRelease.wait() : secondAttemptRelease.wait());
          if (attempt === 1) {
            await route.fulfill({
              status: 503,
              contentType: 'application/json',
              headers: { [qaResponseHeader]: qaFailureMarker },
              body: JSON.stringify({ message: 'Rendered QA marker-503' }),
            });
            return;
          }
          await route.fulfill({
            status: 201,
            contentType: 'application/json',
            body: JSON.stringify({ id: 'rendered-qa-opportunity' }),
          });
        });

        await openPage(page, '/bring-an-opportunity');
        await page.getByRole('button', { name: /^A property I own/ }).click();
        await page.getByRole('button', { name: 'Continue', exact: true }).click();

        await page.getByLabel('Property address').fill('291 Pegasus Way');
        await page.getByLabel('City').fill('Richmond');
        await page.getByLabel('State').fill('CA');
        await page.getByLabel('ZIP').fill('94801');
        await page.getByLabel('Property type').selectOption({ label: 'Single-family' });
        await page.getByLabel('Occupancy').selectOption({ label: 'Vacant' });
        await page.getByLabel('Condition').selectOption({ label: 'Moderate repairs' });
        await page.getByLabel('Estimated value (if known)').fill('$650,000');
        await page.getByLabel('Estimated mortgage balance (if relevant)').fill('$225,000');
        await page.getByLabel('Anything urgent?').fill('No immediate deadline');
        await page.getByRole('button', { name: 'Continue', exact: true }).click();

        await page.getByRole('button', { name: 'Just exploring', exact: true }).click();
        await page.getByRole('button', { name: 'Continue', exact: true }).click();
        await page.getByRole('button', { name: 'Not sure', exact: true }).click();
        await page.getByRole('button', { name: 'Continue', exact: true }).click();

        await page.getByLabel('Full name (required)').fill('Avery Stone');
        await page.getByLabel('Phone (optional)').fill('5105550191');
        await page.getByLabel('Email (required)').fill('qa.intake@example.com');
        await page.getByLabel('Preferred contact method').selectOption({ label: 'Email' });
        await page.getByLabel('Best time to contact').fill('Weekday mornings');
        await page.getByLabel('Anything else we should know?').fill('Rendered QA exact-safe submission.');
        await page.getByRole('checkbox').check();

        const firstRequestObserved = observeBrowserEvent(page.waitForRequest(
          (request) => request.url() === `${baseUrl}/api/opportunities` && request.method() === 'POST',
          { timeout: 10_000 },
        ));
        const firstResponseObserved = observeBrowserEvent(page.waitForResponse(
          (response) => response.url() === `${baseUrl}/api/opportunities` && response.status() === 503,
          { timeout: 10_000 },
        ));
        await page.getByRole('button', { name: 'Submit for Review', exact: true }).click();
        unwrapBrowserEvent(await firstRequestObserved);
        const pending = page.getByRole('button', { name: 'Sending for Review…', exact: true });
        await pending.waitFor({ state: 'visible', timeout: 5_000 });
        assert(await pending.isDisabled(), 'Intake pending control remained enabled');
        assert(await pending.getAttribute('aria-busy') === 'true', 'Intake pending control omitted aria-busy');
        await captureEvidenceScreenshot(
          page,
          health,
          `intake-pending-${intakeViewportName}.png`,
          { expectedActiveRequests: 1 },
        );
        firstAttemptRelease.release();
        unwrapBrowserEvent(await firstResponseObserved);

        const errorState = page.getByRole('alert').filter({ hasText: /could not record your submission/i });
        await errorState.waitFor({ state: 'visible', timeout: 5_000 });
        assert(
          await errorState.evaluate((element) => element === document.activeElement),
          'Intake API error did not receive focus',
        );
        await captureEvidenceScreenshot(
          page,
          health,
          `intake-error-${intakeViewportName}.png`,
        );

        const retry = page.getByRole('button', { name: 'Retry submission', exact: true });
        await retry.focus();
        await retry.evaluate((element) => element.setAttribute('data-rendered-qa-retry-identity', 'stable'));
        const secondRequestObserved = observeBrowserEvent(page.waitForRequest(
          (request) => request.url() === `${baseUrl}/api/opportunities` && request.method() === 'POST',
          { timeout: 10_000 },
        ));
        const secondResponseObserved = observeBrowserEvent(page.waitForResponse(
          (response) => response.url() === `${baseUrl}/api/opportunities` && response.status() === 201,
          { timeout: 10_000 },
        ));
        await retry.click();
        unwrapBrowserEvent(await secondRequestObserved);
        const retrying = page.getByRole('button', { name: 'Retrying…', exact: true });
        assert(
          await retrying.getAttribute('data-rendered-qa-retry-identity') === 'stable',
          'Intake retry replaced the focused control while pending',
        );
        assert(await retrying.getAttribute('aria-disabled') === 'true', 'Intake retry omitted aria-disabled while pending');
        assert(await retrying.getAttribute('aria-busy') === 'true', 'Intake retry omitted aria-busy');
        assert(
          await retrying.evaluate((element) => element === document.activeElement),
          'Intake retry lost focus while pending',
        );
        await captureEvidenceScreenshot(
          page,
          health,
          `intake-retrying-${intakeViewportName}.png`,
          { expectedActiveRequests: 1 },
        );
        await retrying.click({ force: true });
        await delay(100);
        assert(attempt === 2, 'Intake retry allowed a duplicate request while pending');
        secondAttemptRelease.release();
        unwrapBrowserEvent(await secondResponseObserved);

        const success = page.getByRole('heading', { name: 'Received.', exact: true });
        await success.waitFor({ state: 'visible', timeout: 5_000 });
        assert(
          await success.evaluate((element) => element === document.activeElement),
          'Intake success heading did not receive focus',
        );
        assert(await page.getByText('Reference: rendered-qa-opportunity').count() === 1, 'Intake success reference changed');
        await captureEvidenceScreenshot(
          page,
          health,
          `intake-success-${intakeViewportName}.png`,
        );
      },
    );
  }

  await runInteraction('Strategy Lab primary interaction', {}, async (page) => {
    await openPage(page, '/strategy-lab');
    await page.getByRole('button', { name: /Open calculators/ }).click();
    const calculators = page.getByRole('region', { name: /Decision calculators/ });
    await calculators.waitFor({ state: 'visible' });
    await calculators.getByRole('tablist').waitFor({ state: 'visible' });
    assert(await page.getByRole('tablist').count() === 1, 'Strategy Lab exposed more than one calculator selector');
    assert(await calculators.evaluate((node) => node === document.activeElement), 'Strategy Lab did not focus the calculator region');
    const cashFlow = calculators.getByRole('tab', { name: /Cash Flow/i });
    await cashFlow.click();
    assert(await cashFlow.getAttribute('aria-selected') === 'true', 'Strategy Lab did not select the requested calculator tab');
    assert(new URL(page.url()).searchParams.get('tab') === 'cashflow', 'Strategy Lab did not preserve calculator tab state in the URL');
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

  await runInteraction('MarketFlow approved inventory state matrix and JV contract', {}, async (page, health) => {
    const marketflow = await installApprovedMarketflowStubs(page);
    const control = (testId) => page.getByTestId(testId);

    await openPage(page, '/marketflow/deals');
    await page.getByTestId('button-sidebar-toggle').waitFor({ state: 'visible' });
    await captureInventoryState(
      page,
      health,
      'state-wholesale-grid-loading',
      'marketflow-wholesale-grid-loading-desktop-1440.png',
      { expectedActiveRequests: 3 },
    );
    await control('toggle-swipe-view').click();
    await captureInventoryState(
      page,
      health,
      'state-wholesale-swipe-loading',
      'marketflow-wholesale-swipe-loading-desktop-1440.png',
      { expectedActiveRequests: 3 },
    );
    await control('tab-capital').click();
    await control('toggle-grid-view').click();
    await captureInventoryState(
      page,
      health,
      'state-capital-grid-loading',
      'marketflow-capital-grid-loading-desktop-1440.png',
      { expectedActiveRequests: 3 },
    );
    await control('toggle-swipe-view').click();
    await captureInventoryState(
      page,
      health,
      'state-capital-swipe-loading',
      'marketflow-capital-swipe-loading-desktop-1440.png',
      { expectedActiveRequests: 3 },
    );
    await control('tab-listings').click();
    await captureInventoryState(
      page,
      health,
      'state-listings-grid-loading',
      'marketflow-listings-grid-loading-desktop-1440.png',
      { expectedActiveRequests: 3 },
    );

    marketflow.releaseLoadingAsError();
    await captureInventoryState(
      page,
      health,
      'state-listings-grid-error',
      'marketflow-listings-grid-error-desktop-1440.png',
    );
    await control('tab-wholesale').click();
    await captureInventoryState(
      page,
      health,
      'state-wholesale-swipe-error',
      'marketflow-wholesale-swipe-error-desktop-1440.png',
    );
    await control('toggle-grid-view').click();
    await captureInventoryState(
      page,
      health,
      'state-wholesale-grid-error',
      'marketflow-wholesale-grid-error-desktop-1440.png',
    );
    await control('tab-capital').click();
    await captureInventoryState(
      page,
      health,
      'state-capital-grid-error',
      'marketflow-capital-grid-error-desktop-1440.png',
    );
    await control('toggle-swipe-view').click();
    await captureInventoryState(
      page,
      health,
      'state-capital-swipe-error',
      'marketflow-capital-swipe-error-desktop-1440.png',
    );

    marketflow.setLaneState('capital', 'empty');
    await control('button-retry-capital-swipe').click();
    await captureInventoryState(
      page,
      health,
      'state-capital-swipe-empty',
      'marketflow-capital-swipe-empty-desktop-1440.png',
    );
    await control('toggle-grid-view').click();
    await captureInventoryState(
      page,
      health,
      'state-capital-grid-empty',
      'marketflow-capital-grid-empty-desktop-1440.png',
    );
    await control('tab-wholesale').click();
    marketflow.setLaneState('wholesale', 'empty');
    await control('button-retry-wholesale-grid').click();
    await captureInventoryState(
      page,
      health,
      'state-wholesale-grid-empty',
      'marketflow-wholesale-grid-empty-desktop-1440.png',
    );
    await control('toggle-swipe-view').click();
    await captureInventoryState(
      page,
      health,
      'state-wholesale-swipe-empty',
      'marketflow-wholesale-swipe-empty-desktop-1440.png',
    );
    await control('tab-listings').click();
    marketflow.setLaneState('listings', 'empty');
    await control('button-retry-listings-grid').click();
    await captureInventoryState(
      page,
      health,
      'state-listings-grid-empty',
      'marketflow-listings-grid-empty-desktop-1440.png',
    );

    for (const lane of ['wholesale', 'capital', 'listings']) {
      marketflow.setLaneState(lane, 'data');
    }
    await page.reload({ waitUntil: 'load', timeout: 45_000 });
    await page.getByTestId('text-deals-title').waitFor({ state: 'visible', timeout: 10_000 });
    await control('tab-wholesale').click();
    await control('toggle-grid-view').click();
    await page.getByTestId('button-view-deal-501').waitFor({ state: 'visible' });
    assert(await page.getByTestId('quick-jv-501').count() === 1, 'Eligible operator lost the card JV action');
    await captureEvidenceScreenshot(
      page,
      health,
      'marketflow-wholesale-grid-data-desktop-1440.png',
    );

    const saveRequest = page.waitForRequest(
      (request) => request.url() === `${baseUrl}/api/supabase/saved-items`
        && request.method() === 'POST',
      { timeout: 10_000 },
    );
    await page.getByTestId('button-save-deal-501').click();
    await saveRequest;

    await control('toggle-swipe-view').click();
    await page.getByTestId('button-view-deal').waitFor({ state: 'visible' });
    await captureEvidenceScreenshot(
      page,
      health,
      'marketflow-wholesale-swipe-data-desktop-1440.png',
    );
    await control('tab-capital').click();
    await page.getByTestId('button-view-capital-swipe').waitFor({ state: 'visible' });
    await captureEvidenceScreenshot(
      page,
      health,
      'marketflow-capital-swipe-data-desktop-1440.png',
    );
    await control('toggle-grid-view').click();
    await page.getByTestId('button-view-project-601').waitFor({ state: 'visible' });
    await captureEvidenceScreenshot(
      page,
      health,
      'marketflow-capital-grid-data-desktop-1440.png',
    );
    await control('tab-listings').click();
    await page.getByTestId('button-view-listing-701').waitFor({ state: 'visible' });
    await captureEvidenceScreenshot(
      page,
      health,
      'marketflow-listings-grid-data-desktop-1440.png',
    );
    await page.getByTestId('button-view-listing-701').click();
    await page.waitForURL(/\/marketflow\/listings\/701$/);
    await page.getByText('701 Proof Place').waitFor({ state: 'visible', timeout: 10_000 });
    assert(
      await page.getByText('$825,000').count() >= 1,
      'Reviewed listing detail did not render the source inventory price',
    );

    await openPage(page, '/marketflow/deals');
    await control('tab-wholesale').click();
    await page.getByTestId('button-view-deal-501').click();
    await page.waitForURL(/\/marketflow\/deals\/501$/);
    await page.getByTestId('button-request-jv').waitFor({ state: 'visible', timeout: 10_000 });
    await captureEvidenceScreenshot(
      page,
      health,
      'marketflow-detail-jv-eligible-desktop-1440.png',
    );

    marketflow.setCanRequestJv(false);
    await page.reload({ waitUntil: 'load', timeout: 45_000 });
    await page.getByTestId('button-accept-terms').waitFor({ state: 'visible', timeout: 10_000 });
    assert(
      await page.getByTestId('button-request-jv').count() === 0,
      'Owner-safe detail DTO exposed the JV action when canRequestJv was false',
    );
    await captureEvidenceScreenshot(
      page,
      health,
      'marketflow-detail-jv-withheld-desktop-1440.png',
    );
  });

  await runInteraction(
    'MarketFlow approved operator mobile shell',
    { viewport: getViewport('mobile-390') },
    async (page, health) => {
      await installApprovedMarketflowStubs(page, { initialState: 'data' });
      await openPage(page, '/marketflow/deals');
      await page.getByTestId('button-sidebar-toggle').waitFor({ state: 'visible' });
      await page.getByTestId('button-view-deal-501').waitFor({ state: 'visible' });
      assert(await page.getByTestId('quick-jv-501').count() === 1, 'Mobile operator shell lost eligible JV action');
      await captureEvidenceScreenshot(
        page,
        health,
        'marketflow-approved-shell-mobile-390.png',
      );
    },
  );

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
} catch (error) {
  fatalFailure = {
    error: String(error),
    stack: error instanceof Error ? error.stack ?? null : null,
  };
  console.error('[rendered-qa] Fatal execution failure:', error);
} finally {
  await Promise.allSettled(
    [...launchedBrowsers].map((browser) => browser.close()),
  );
  await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
}

const testedSourceSha = process.env.RENDERED_QA_TESTED_SHA || 'local-uncommitted';
const prHeadSha = process.env.RENDERED_QA_PR_HEAD_SHA || null;
const prMergeSha = process.env.RENDERED_QA_PR_MERGE_SHA || null;
const invariantFailures = [];
if (process.env.GITHUB_ACTIONS === 'true') {
  if (!/^[0-9a-f]{40}$/.test(testedSourceSha)) {
    invariantFailures.push('CI rendered QA omitted an exact tested source SHA');
  }
  if (process.env.RENDERED_QA_GITHUB_EVENT === 'pull_request') {
    if (testedSourceSha !== prHeadSha) {
      invariantFailures.push('Pull-request rendered QA did not test the exact PR head');
    }
    if (prMergeSha && !/^[0-9a-f]{40}$/.test(prMergeSha)) {
      invariantFailures.push('Pull-request rendered QA recorded an invalid merge SHA');
    }
  }
}

if (releaseRoutes.length !== 18) {
  invariantFailures.push(
    `Rendered release route inventory contains ${releaseRoutes.length} routes; expected exactly 18`,
  );
}
if (fullPublicRoutes.length !== 46) {
  invariantFailures.push(
    `Rendered full public route inventory contains ${fullPublicRoutes.length} routes; expected exactly 46`,
  );
}
const requiredRouteCheckCount = publicRouteCoverage === 'full' ? 368 : 144;
if (!interactionsOnly && expectedRouteCheckCount !== requiredRouteCheckCount) {
  invariantFailures.push(
    `Rendered ${publicRouteCoverage} matrix produced ${expectedRouteCheckCount} checks; expected exactly ${requiredRouteCheckCount}`,
  );
}
if (interactionJourneyCount !== 17) {
  invariantFailures.push(
    `Rendered release suite produced ${interactionJourneyCount} interaction journeys; expected exactly 17`,
  );
}
const expectedScreenshotCount = screenshotDir
  ? expectedRouteCheckCount + 39
  : null;
if (
  screenshotDir
  && publicRouteCoverage === 'full'
  && expectedScreenshotCount !== 407
) {
  invariantFailures.push(
    `Rendered QA full coverage expected exactly 407 screenshots; computed ${expectedScreenshotCount}`,
  );
}
if (screenshotDir && screenshotCount !== expectedScreenshotCount) {
  invariantFailures.push(
    `Rendered QA wrote ${screenshotCount} screenshots; expected ${expectedScreenshotCount}`,
  );
}

const result = failures.length
  || interactionFailures.length
  || invariantFailures.length
  || fatalFailure
  ? 'failed'
  : 'passed';

if (screenshotDir) {
  await writeFile(
    path.join(screenshotDir, 'rendered-qa-manifest.json'),
    `${JSON.stringify({
      schemaVersion: 1,
      result,
      testedSourceSha,
      prHeadSha,
      prMergeSha,
      githubEvent: process.env.RENDERED_QA_GITHUB_EVENT || null,
      publicRouteCoverage,
      routeCheckCount: expectedRouteCheckCount,
      routeFailureCount: failures.length,
      routes,
      viewports: Object.fromEntries(viewports),
      colorSchemes,
      interactionJourneyCount,
      interactionFailureCount: interactionFailures.length,
      invariantFailureCount: invariantFailures.length,
      invariantFailures,
      fatalFailureCount: fatalFailure ? 1 : 0,
      fatalFailure,
      expectedScreenshotCount,
      screenshotCount,
      screenshotEvidenceEnabled: true,
    }, null, 2)}\n`,
    'utf8',
  );
}

if (result === 'failed') {
  console.error(JSON.stringify({
    result,
    routeFailures: failures,
    interactionFailures,
    invariantFailures,
    fatalFailure,
  }, null, 2));
  process.exit(1);
}

if (!interactionsOnly && publicRouteCoverage === 'full') {
  console.log('[a11y] PASS: 368 rendered route/viewport/theme checks');
} else if (!interactionsOnly) {
  console.log('[a11y] PASS: 144 rendered route/viewport/theme checks');
}
console.log('[interaction] PASS: 17 rendered launch journeys');
