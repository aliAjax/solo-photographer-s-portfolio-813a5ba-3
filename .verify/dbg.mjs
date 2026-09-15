import { chromium } from 'playwright';
const b = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
const p = await b.newPage();
await p.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle' });
await p.locator('.series-card').first().scrollIntoViewIfNeeded();
const box = await p.locator('.series-card').first().boundingBox();
const cx = box.x + box.width/2, cy = box.y + box.height/2;
const el = await p.evaluate(([x,y]) => {
  const e = document.elementFromPoint(x,y);
  return { tag: e.tagName, cls: e.className, parent: e.parentElement?.className };
}, [cx, cy]);
console.log(JSON.stringify(el), 'box:', JSON.stringify(box));
await p.locator('.series-card').first().click();
console.log('dialog count:', await p.locator('.lightbox[role=dialog]').count());
await b.close();
