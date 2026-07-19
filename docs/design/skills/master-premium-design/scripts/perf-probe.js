#!/usr/bin/env node
/* Perf probe on the production build: LCP + CLS via PerformanceObserver.
   Usage: node perf-probe.js <build-dir> [route]   Budgets: LCP<1500ms, CLS<0.05. */
const http = require('http'); const fs = require('fs'); const path = require('path');
const { chromium } = require('/root/node_modules/playwright-core');
const ROOT = process.argv[2]; const ROUTE = process.argv[3] || '/';
if (!ROOT) { console.error('usage: node perf-probe.js <build-dir> [route]'); process.exit(2); }
const PORT = Number(process.env.PORT || 8160);
const MIME = { '.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.avif':'image/avif','.woff2':'font/woff2' };
const server = http.createServer((req,res)=>{ let p=decodeURIComponent(req.url.split('?')[0]); let fp=path.join(ROOT,p);
  if(!fs.existsSync(fp)||fs.statSync(fp).isDirectory()) fp=path.join(ROOT,'index.html');
  try { const d=fs.readFileSync(fp); res.writeHead(200,{'Content-Type':MIME[path.extname(fp).toLowerCase()]||'application/octet-stream'}); res.end(d); } catch(e){ res.writeHead(404); res.end(); } });
(async()=>{
  await new Promise(r=>server.listen(PORT,r));
  const b = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium', args:['--no-sandbox','--disable-dev-shm-usage'] });
  const page = await (await b.newContext({ viewport:{width:1440,height:940} })).newPage();
  await page.addInitScript(() => {
    window.__perf = { lcp: 0, cls: 0 };
    new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__perf.lcp = e.startTime; })
      .observe({ type: 'largest-contentful-paint', buffered: true });
    new PerformanceObserver((l) => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__perf.cls += e.value; })
      .observe({ type: 'layout-shift', buffered: true });
  });
  await page.goto(`http://127.0.0.1:${PORT}${ROUTE}`, { waitUntil: 'load' });
  await page.waitForTimeout(2500);
  const { lcp, cls } = await page.evaluate(() => window.__perf);
  await b.close(); server.close();
  const lcpOk = lcp < 1500, clsOk = cls < 0.05;
  console.log(`route=${ROUTE} LCP=${Math.round(lcp)}ms (${lcpOk?'PASS':'FAIL <1500'})  CLS=${cls.toFixed(4)} (${clsOk?'PASS':'FAIL <0.05'})`);
  console.log('note: localhost numbers are best-case; treat as regression signal, not field data.');
  process.exit(lcpOk && clsOk ? 0 : 1);
})().catch(e=>{ console.error('FATAL', e); process.exit(1); });
