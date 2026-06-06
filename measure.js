const { chromium } = require('playwright-core');
const EXEC = '/nix/store/zi4f80l169xlmivz8vja8wlphq74qqk0-chromium-125.0.6422.141/bin/chromium';
(async () => {
  const b = await chromium.launch({ executablePath: EXEC, args:['--no-sandbox','--disable-dev-shm-usage'] });
  for (const w of [1024, 1280, 390]) {
    const ctx = await b.newContext({ viewport:{width:w,height:900} });
    const page = await ctx.newPage();
    await page.goto('http://localhost:5000/', { waitUntil:'domcontentloaded', timeout:30000 });
    await page.waitForTimeout(2000);
    const data = await page.evaluate(() => {
      const out = [];
      document.querySelectorAll('.section-numeral').forEach(el => {
        if (!/FIRM|PROOF|START|LAB|SAVED/.test(el.textContent||'')) return;
        const sec = el.closest('section');
        const er = el.getBoundingClientRect();
        const sr = sec ? sec.getBoundingClientRect() : null;
        const cs = getComputedStyle(el);
        out.push({ word: el.textContent.trim(), elTop: Math.round(er.top), secTop: sr?Math.round(sr.top):null,
          aboveSection: sr?Math.round(sr.top - er.top):null, fontSize: cs.fontSize, lineHeight: cs.lineHeight,
          secOverflow: sec?getComputedStyle(sec).overflow:null });
      });
      return out;
    });
    console.log('VIEWPORT', w, JSON.stringify(data));
    await ctx.close();
  }
  await b.close();
})().catch(e=>{console.error('ERR',e.message);process.exit(1)});
