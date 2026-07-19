const http = require('http'); const fs = require('fs'); const path = require('path');
const { chromium } = require('/root/node_modules/playwright-core');
const ROOT = '/root/pegasus-site/client/dist-hero';
const AXE = fs.readFileSync('/root/pegasus-site/node_modules/axe-core/axe.min.js', 'utf8');
const MIME = { '.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.webp':'image/webp','.woff2':'font/woff2' };
const server = http.createServer((req,res)=>{ let p=decodeURIComponent(req.url.split('?')[0]); let f=path.join(ROOT,p);
  if(!fs.existsSync(f)||fs.statSync(f).isDirectory()){ if(!path.basename(p).includes('.')) f=path.join(ROOT,'index.html'); }
  fs.readFile(f,(e,d)=>{ if(e){res.writeHead(404);res.end();return;} res.writeHead(200,{'Content-Type':MIME[path.extname(f)]||'application/octet-stream'}); res.end(d); });});
(async()=>{
  await new Promise(r=>server.listen(8111,r));
  const b = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium', args:['--no-sandbox','--disable-dev-shm-usage'] });
  const p = await (await b.newContext({ viewport:{width:1440,height:900} })).newPage();
  await p.goto('http://localhost:8111/', { waitUntil:'networkidle', timeout:45000 });
  await p.waitForTimeout(600);
  await p.addScriptTag({ content: AXE });
  const res = await p.evaluate(async () => {
    const r = await axe.run(document, { runOnly: { type:'tag', values:['wcag2aa'] } });
    const v = r.violations.find(x => x.id === 'color-contrast');
    return v ? v.nodes.map(n => ({ t: n.target.join(' '), d: (n.any[0]||{}).data })) : [];
  });
  for (const n of res) console.log(JSON.stringify(n));
  await b.close(); server.close();
})().catch(e=>{console.error('ERR',e.message);process.exit(1);});
