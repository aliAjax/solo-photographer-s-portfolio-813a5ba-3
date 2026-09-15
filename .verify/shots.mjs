import { chromium } from 'playwright';
const LIBS = '';
const b = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
// desktop lightbox
let p = await b.newPage({ viewport: { width: 1440, height: 1000 } });
await p.goto('http://127.0.0.1:5173/work', { waitUntil: 'networkidle' });
await p.getByRole('button', { name: '牧野', exact: true }).click();
await p.waitForFunction(() => document.querySelectorAll('.photo-button').length === 4);
await p.locator('.photo-button').first().click();
await p.locator('.lightbox[role=dialog]').waitFor();
await p.waitForTimeout(800);
await p.screenshot({ path: '/workspace/.verify/desktop-lightbox.png' });
// mobile work page (not lightbox) + mobile lightbox landscape photo
p.setViewportSize({ width: 390, height: 844 });
await p.keyboard.press('Escape');
await p.waitForTimeout(300);
await p.evaluate(async () => { for (let y=0;y<document.body.scrollHeight;y+=400){window.scrollTo(0,y);await new Promise(r=>setTimeout(r,80));} window.scrollTo(0,0); });
await p.waitForTimeout(500);
await p.screenshot({ path: '/workspace/.verify/mobile-work.png', fullPage: true });
await p.locator('.photo-button').nth(1).click();
await p.waitForTimeout(800);
await p.screenshot({ path: '/workspace/.verify/mobile-lightbox.png' });
await b.close();
console.log('shots done');
