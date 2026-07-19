const http = require('http'); const fs = require('fs'); const path = require('path');
const { chromium } = require('/root/node_modules/playwright-core');
const ROOT = process.argv[2];
if (!ROOT) { console.error('usage: node axe-sweep.js <build-dir> [routes...]'); process.exit(2); }
const AXE = fs.readFileSync('/root/pegasus-site/node_modules/axe-core/axe.min.js', 'utf8');
const MIME = { '.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.webp':'image/webp','.woff2':'font/woff2','.woff':'font/woff' };
const server = http.createServer((req,res)=>{ let p=decodeURIComponent(req.url.split('?')[0]); let f=path.join(ROOT,p);
  if(!fs.existsSync(f)||fs.statSync(f).isDirectory()){ if(!path.basename(p).includes('.')) f=path.join(ROOT,'index.html'); }
  fs.readFile(f,(e,d)=>{ if(e){res.writeHead(404);res.end();return;} res.writeHead(200,{'Content-Type':MIME[path.extname(f)]||'application/octet-stream'}); res.end(d); });});
const ROUTES = process.argv.length > 3 ? process.argv.slice(3)
  : ['/','/how-we-operate','/property-owners','/deal-partners','/our-work','/about','/marketflow','/bring-an-opportunity','/strategy-lab','/work-with-apollo','/capital','/contact'];
(async()=>{
  await new Promise(r=>server.listen(8110,r));
  const b = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium', args:['--no-sandbox','--disable-dev-shm-usage'] });
  const p = await (await b.newContext({ viewport:{width:1440,height:900} })).newPage();
  const all = {};
  for (const route of ROUTES) {
    await p.goto('http://localhost:8110'+route, { waitUntil:'networkidle', timeout:45000 });
    await p.waitForTimeout(700);
    await p.addScriptTag({ content: AXE });
    const res = await p.evaluate(async () => {
      const r = await axe.run(document, { runOnly: { type:'tag', values:['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa'] } });
      return r.violations.map(v => ({ id:v.id, impact:v.impact, count:v.nodes.length, sample:(v.nodes[0]||{}).target?.join(' ')?.slice(0,90), help:v.help.slice(0,80) }));
    });
    if (res.length) all[route] = res;
    console.log(route, res.length ? JSON.stringify(res) : 'CLEAN');
  }
  await b.close(); server.close();
  fs.writeFileSync('/root/axe-report.json', JSON.stringify(all, null, 1));
  const n = Object.keys(all).length;
  console.log(n ? `VIOLATIONS on ${n} routes (see /root/axe-report.json)` : 'ALL ROUTES CLEAN');
  process.exit(n ? 1 : 0);
})().catch(e=>{console.error('ERR',e.message);process.exit(1);});
