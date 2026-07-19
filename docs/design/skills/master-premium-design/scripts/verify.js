#!/usr/bin/env node
/* Retina capture harness: in-process static server (SPA fallback) + Playwright.
   Usage: node verify.js <build-dir> [route ...]
   Env: OUT (default /root/qa/shots-verify), PORT (default 8150).
   Captures per route: 1440@2x light, 1440@2x dark, 390@2x dark. */
const http = require('http'); const fs = require('fs'); const path = require('path');
const { chromium } = require('/root/node_modules/playwright-core');

const ROOT = process.argv[2];
const ROUTES = process.argv.length > 3 ? process.argv.slice(3) : ['/'];
if (!ROOT || !fs.existsSync(ROOT)) { console.error('usage: node verify.js <build-dir> [routes...]'); process.exit(2); }
const OUT = process.env.OUT || '/root/qa/shots-verify';
const PORT = Number(process.env.PORT || 8150);
const MIME = { '.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.avif':'image/avif','.woff2':'font/woff2','.woff':'font/woff','.json':'application/json','.ico':'image/x-icon','.xml':'application/xml','.txt':'text/plain','.webmanifest':'application/manifest+json','.mp4':'video/mp4' };

const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  let fp = path.join(ROOT, p);
  if (!fs.existsSync(fp) || fs.statSync(fp).isDirectory()) fp = path.join(ROOT, 'index.html');
  try { const d = fs.readFileSync(fp); res.writeHead(200, { 'Content-Type': MIME[path.extname(fp).toLowerCase()] || 'application/octet-stream' }); res.end(d); }
  catch (e) { res.writeHead(404); res.end('nf'); }
});

const slug = (r) => (r === '/' ? 'home' : r.replace(/^\//, '').replace(/[^a-z0-9-]+/gi, '_'));

async function shoot(browser, theme, viewport, route, tag) {
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: 2, colorScheme: theme === 'dark' ? 'dark' : 'light' });
  await ctx.addInitScript((t) => { try { localStorage.setItem('pegasus-ui-theme', t); } catch (e) {} }, theme);
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e).slice(0, 160)));
  await page.goto(`http://127.0.0.1:${PORT}${route}`, { waitUntil: 'load' });
  await page.waitForTimeout(900);
  try { await page.getByRole('button', { name: 'Accept' }).click({ timeout: 1500 }); } catch (e) {}
  await page.evaluate(async () => { const h = document.body.scrollHeight; for (let y = 0; y <= h; y += 640) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 70)); } window.scrollTo(0, 0); await new Promise(r => setTimeout(r, 450)); });
  const broken = await page.evaluate(() => Array.from(document.images).filter(i => i.complete && i.naturalWidth === 0).map(i => i.currentSrc || i.src).slice(0, 4));
  const file = `${OUT}/${tag}-${theme}-${slug(route)}.png`;
  await page.screenshot({ path: file, fullPage: true });
  await ctx.close();
  return { route, theme, tag, file: path.basename(file), broken, errors };
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  await new Promise((r) => server.listen(PORT, r));
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox', '--disable-dev-shm-usage'] });
  const results = [];
  for (const route of ROUTES) {
    results.push(await shoot(browser, 'light', { width: 1440, height: 940 }, route, 'd'));
    results.push(await shoot(browser, 'dark', { width: 1440, height: 940 }, route, 'd'));
    results.push(await shoot(browser, 'dark', { width: 390, height: 844 }, route, 'm'));
  }
  await browser.close(); server.close();
  let bad = 0;
  for (const r of results) {
    const flags = [r.broken.length ? `BROKEN:${JSON.stringify(r.broken)}` : '', r.errors.length ? `JS:${JSON.stringify([...new Set(r.errors)])}` : ''].filter(Boolean).join(' ');
    if (flags) bad++;
    console.log(`${r.file}  ${flags || 'ok'}`);
  }
  console.log(bad ? `ISSUES on ${bad} captures` : 'ALL CLEAN');
  process.exit(bad ? 1 : 0);
})().catch((e) => { console.error('FATAL', e); process.exit(1); });
