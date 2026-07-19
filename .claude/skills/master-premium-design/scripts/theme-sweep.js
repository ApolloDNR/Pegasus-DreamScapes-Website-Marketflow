/* Dark-mode + multi-width visual regression sweep (Blueprint v5.1 §32.9/§32.16 QA).
   Self-contained: in-process static server for client/dist-hero + Playwright. */
const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('/root/node_modules/playwright-core');

const ROOT = '/root/pegasus-site/client/dist-hero';
const PORT = 8112;
const OUT = '/root/qa/shots-theme';
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.woff2': 'font/woff2', '.woff': 'font/woff', '.json': 'application/json', '.ico': 'image/x-icon', '.txt': 'text/plain', '.xml': 'application/xml', '.webmanifest': 'application/manifest+json', '.mp4': 'video/mp4' };

const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  let fp = path.join(ROOT, p);
  if (!fs.existsSync(fp) || fs.statSync(fp).isDirectory()) fp = path.join(ROOT, 'index.html'); // SPA fallback
  const ext = path.extname(fp).toLowerCase();
  try {
    const data = fs.readFileSync(fp);
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    res.end(data);
  } catch (e) { res.writeHead(404); res.end('nf'); }
});

const ROUTES = [
  ['home', '/'],
  ['how-we-operate', '/how-we-operate'],
  ['property-owners', '/property-owners'],
  ['deal-partners', '/deal-partners'],
  ['our-work', '/our-work'],
  ['about', '/about'],
  ['bring', '/bring-an-opportunity'],
];
const MOBILE_ROUTES = [['home', '/'], ['our-work', '/our-work'], ['about', '/about'], ['bring', '/bring-an-opportunity']];

async function scrollThrough(page) {
  // Trigger IntersectionObserver reveals + lazy images, then return to top.
  await page.evaluate(async () => {
    const h = document.body.scrollHeight;
    const step = Math.max(400, Math.floor(window.innerHeight * 0.75));
    for (let y = 0; y <= h; y += step) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 90)); }
    window.scrollTo(0, document.body.scrollHeight);
    await new Promise(r => setTimeout(r, 350));
    window.scrollTo(0, 0);
    await new Promise(r => setTimeout(r, 450));
  });
}

async function capture(browser, theme, viewport, routes, tag) {
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: 1, colorScheme: theme === 'dark' ? 'dark' : 'light' });
  await ctx.addInitScript(t => { try { localStorage.setItem('pegasus-ui-theme', t); } catch (e) {} }, theme);
  const page = await ctx.newPage();
  const consoleErrors = [];
  page.on('console', m => { if (m.type() === 'error') consoleErrors.push(m.text().slice(0, 200)); });
  page.on('pageerror', e => consoleErrors.push('PAGEERROR ' + String(e).slice(0, 200)));
  const report = [];
  for (const [slug, route] of routes) {
    await page.goto(`http://127.0.0.1:${PORT}${route}`, { waitUntil: 'load' });
    await page.waitForTimeout(700);
    await scrollThrough(page);
    // Image sanity: everything decoded?
    const imgs = await page.evaluate(() => {
      const list = Array.from(document.images);
      return { total: list.length, broken: list.filter(i => i.complete && i.naturalWidth === 0).map(i => i.currentSrc || i.src).slice(0, 5) };
    });
    // Dark-token probe on first accent-ink surface present
    const probe = await page.evaluate(() => {
      const el = document.querySelector('.hv-eyebrow-copper, .hwo-rail-num, .hv-step-num, .pg-label');
      if (!el) return null;
      const cs = getComputedStyle(el);
      return { cls: el.className.toString().slice(0, 60), color: cs.color };
    });
    const html = await page.evaluate(() => document.documentElement.className);
    const file = `${OUT}/${tag}-${theme}-${slug}.png`;
    await page.screenshot({ path: file, fullPage: true });
    report.push({ slug, route, htmlClass: html, imgs, probe, file: path.basename(file) });
  }
  await ctx.close();
  return { report, consoleErrors };
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  await new Promise(r => server.listen(PORT, r));
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox', '--disable-dev-shm-usage'] });

  const results = {};
  results.desktopLight = await capture(browser, 'light', { width: 1440, height: 900 }, ROUTES, 'd');
  results.desktopDark = await capture(browser, 'dark', { width: 1440, height: 900 }, ROUTES, 'd');
  results.mobileDark = await capture(browser, 'dark', { width: 390, height: 844 }, MOBILE_ROUTES, 'm');
  results.midLight = await capture(browser, 'light', { width: 1024, height: 800 }, [['home', '/'], ['our-work', '/our-work']], 'mid');

  await browser.close();
  server.close();

  for (const [k, v] of Object.entries(results)) {
    console.log(`== ${k} ==`);
    for (const r of v.report) {
      const broken = r.imgs.broken.length ? ` BROKEN:${JSON.stringify(r.imgs.broken)}` : '';
      console.log(`  ${r.slug.padEnd(16)} htmlClass="${r.htmlClass}" imgs=${r.imgs.total}${broken} probe=${r.probe ? r.probe.color + ' <' + r.probe.cls + '>' : 'n/a'}`);
    }
    if (v.consoleErrors.length) console.log('  CONSOLE ERRORS:', JSON.stringify([...new Set(v.consoleErrors)]));
  }
  console.log('DONE');
})().catch(e => { console.error('FATAL', e); process.exit(1); });
