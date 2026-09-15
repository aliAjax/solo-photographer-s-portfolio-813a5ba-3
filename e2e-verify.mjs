#!/usr/bin/env node
/**
 * 真实验证脚本（task.md「验证要求」）：
 *   1) 五条路由均可渲染且控制台无 error
 *   2) /work 四个筛选项；筛选 → 进入系列 → 返回，筛选保持
 *   3) 灯箱在首页 / 作品集 / 系列页复用；筛选子集内循环（4 张回到首张）
 *   4) 图片加载前 .ratio-box 已按真实 width/height 撑开（CLS）
 *   5) 窄屏（390px）：作品集单列、灯箱说明置底、汉堡菜单可见
 *   6) 无 fonts.googleapis.com / fonts.gstatic.com 请求，字体来自本地 woff2
 *   7) 联系表单：初始禁用、行内校验、合法后可提交、成功态
 *
 * 用法：node e2e-verify.mjs   （需先 npm run dev，脚本会复用 5173；也可自动拉起）
 */
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE = process.env.BASE_URL || "http://127.0.0.1:5173";
const data = JSON.parse(fs.readFileSync(path.join(__dirname, "src/data/photos.json"), "utf8"));

async function run() {
  const browser = await chromium.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-dev-shm-usage"],
  });

  let passed = 0;
  const tests = [];

  const test = (name, fn) => tests.push({ name, fn });
  const assert = (cond, msg) => {
    if (!cond) throw new Error(msg);
  };

  // ---------- 1. 五条路由 ----------
  test("五条路由渲染 main，控制台无 error", async () => {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    const errors = [];
    page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
    page.on("pageerror", (e) => errors.push(String(e)));
    for (const route of ["/", "/work", "/work/gaze", "/work/wilderness", "/work/highland-pastoral", "/about", "/contact"]) {
      await page.goto(BASE + route, { waitUntil: "networkidle" });
      assert(await page.locator("main").isVisible(), `${route} 未渲染 main`);
    }
    assert(errors.length === 0, `控制台错误：${errors.join(" | ")}`);
    await page.close();
  });

  // ---------- 2. 筛选 UI + 筛选状态保持 ----------
  test("筛选项为 全部/肖像/风光/牧野，筛选后跨导航保持", async () => {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    await page.goto(`${BASE}/work`, { waitUntil: "networkidle" });
    const labels = await page.locator(".filters button").allTextContents();
    assert(JSON.stringify(labels) === JSON.stringify(["全部", "肖像", "风光", "牧野"]), `筛选项异常：${labels}`);

    await page.getByRole("button", { name: "牧野", exact: true }).click();
    await page.waitForFunction(() => document.querySelectorAll(".photo-button").length === 4);
    await page.getByRole("link", { name: /高原牧歌/ }).first().click();
    await page.waitForURL(/highland-pastoral/);
    await page.goBack();
    await page.waitForURL(/\/work$/);
    assert((await page.getByRole("button", { name: "牧野", exact: true }).getAttribute("aria-pressed")) === "true", "返回后筛选未保持");
    assert((await page.locator(".photo-button").count()) === 4, "返回后照片数不是 4");
    await page.close();
  });

  // ---------- 3a. 灯箱：三入口同一组件 ----------
  test("灯箱在 /work、系列页、首页三处复用", async () => {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    await page.goto(`${BASE}/work`, { waitUntil: "networkidle" });
    await page.locator(".photo-button").first().click();
    assert(await page.locator('.lightbox[role="dialog"]').isVisible(), "/work 灯箱未打开");
    await page.getByRole("button", { name: "关闭" }).click();
    assert((await page.locator('.lightbox[role="dialog"]').count()) === 0, "灯箱未关闭");

    await page.goto(`${BASE}/work/highland-pastoral`, { waitUntil: "networkidle" });
    await page.locator(".story .photo-button").first().click();
    assert(await page.locator('.lightbox[role="dialog"]').isVisible(), "系列页灯箱未打开");
    await page.keyboard.press("Escape");

    await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
    await page.locator(".series-card").first().click();
    assert(await page.locator('.lightbox[role="dialog"]').isVisible(), "首页灯箱未打开");
    // 说明（caption）与位置（分类 · n/total）
    const eyebrow = (await page.locator(".lightbox-info .eyebrow").textContent()) || "";
    const caption = await page.locator(".lightbox-info p").textContent();
    assert(/\d+\s*\/\s*\d+/.test(eyebrow), `灯箱缺少位置计数：${eyebrow}`);
    assert(caption && caption.trim().length > 0, "灯箱缺少说明文字");
    await page.close();
  });

  // ---------- 3b. 灯箱在筛选子集内循环 ----------
  test("牧野筛选下灯箱只在 4 张内循环并回到首张", async () => {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    await page.goto(`${BASE}/work`, { waitUntil: "networkidle" });
    await page.getByRole("button", { name: "牧野", exact: true }).click();
    await page.waitForFunction(() => document.querySelectorAll(".photo-button").length === 4);
    await page.locator(".photo-button").first().click();
    const counter = async () => {
      const t = (await page.locator(".lightbox-info .eyebrow").textContent()) || "";
      const m = t.match(/(\d+)\s*\/\s*(\d+)/);
      return { i: Number(m[1]), n: Number(m[2]) };
    };
    let c = await counter();
    assert(c.i === 1 && c.n === 4, `初始计数异常：${c.i}/${c.n}`);
    const titles = [(await page.locator(".lightbox-info h2").textContent()).trim()];
    const pastoralTitles = new Set(data.photos.filter((p) => p.category === "pastoral").map((p) => p.title));
    for (let k = 0; k < 4; k++) {
      await page.getByRole("button", { name: "下一张" }).click();
      titles.push((await page.locator(".lightbox-info h2").textContent()).trim());
    }
    assert(titles[4] === titles[0], "4 次下一张后未回到首张");
    assert(new Set(titles.slice(0, 4)).size === 4, "前 4 张未覆盖 4 个不同照片");
    assert(titles.slice(0, 4).every((t) => pastoralTitles.has(t)), `循环越出牧野集合：${titles}`);
    c = await counter();
    assert(c.n === 4, `计数总数应为 4，实为 ${c.n}`);
    // 首张再按「上一张」应跳到最后一张（循环）
    await page.getByRole("button", { name: "上一张" }).click();
    const jumped = (await page.locator(".lightbox-info h2").textContent()).trim();
    assert(jumped === titles[3], "上一张循环错误");
    await page.close();
  });

  // ---------- 4. CLS：加载前比例占位 ----------
  test("图片延迟 900ms 时 .ratio-box 已是真实宽高比，加载后不位移", async () => {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    await page.route("**/*.jpg", async (route) => {
      await new Promise((r) => setTimeout(r, 900));
      await route.continue();
    });
    await page.goto(`${BASE}/work`, { waitUntil: "domcontentloaded" });
    await page.waitForSelector(".photo-button .ratio-box");
    const first = data.photos[0];
    const box = await page.locator(".photo-button .ratio-box").first().boundingBox();
    const ratio = box.width / box.height;
    const expected = first.width / first.height;
    assert(Math.abs(ratio - expected) < 0.01, `占位比例 ${ratio} ≠ 真实 ${expected}`);
    const before = await page.locator(".photo-button").nth(1).boundingBox();
    await page.waitForLoadState("networkidle");
    const after = await page.locator(".photo-button").nth(1).boundingBox();
    assert(Math.abs(before.y - after.y) < 1, `加载后位移 ${after.y - before.y}px`);
    await page.close();
  });

  // ---------- 5. 移动端 ----------
  test("390px 窄屏：作品集单列 + 汉堡菜单 + 灯箱说明置底", async () => {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await page.goto(`${BASE}/work`, { waitUntil: "networkidle" });
    assert(await page.locator(".menu").isVisible(), "汉堡菜单不可见");
    const a = await page.locator(".photo-button").first().boundingBox();
    const b = await page.locator(".photo-button").nth(1).boundingBox();
    assert(b.y >= a.y + a.height - 2, "窄屏下不是单列布局");
    await page.locator(".photo-button").first().click();
    await page.locator('.lightbox[role="dialog"]').waitFor();
    const img = await page.locator(".lightbox-image").boundingBox();
    const info = await page.locator(".lightbox-info").boundingBox();
    assert(info.y >= img.y + img.height - 2, `灯箱说明未置底：img 底 ${img.y + img.height}，info 顶 ${info.y}`);
    await page.screenshot({ path: path.join(__dirname, ".verify/lightbox-mobile.png") });
    await page.close();
  });

  // ---------- 6. 字体 ----------
  test("无字体 CDN 请求，本地 woff2 被加载", async () => {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    const urls = [];
    page.on("request", (r) => urls.push(r.url()));
    for (const route of ["/", "/work", "/about", "/contact", "/work/gaze"]) {
      await page.goto(BASE + route, { waitUntil: "networkidle" });
    }
    const cdn = urls.filter((u) => /fonts\.googleapis\.com|fonts\.gstatic\.com/.test(u));
    assert(cdn.length === 0, `发现外部字体请求：${cdn.join(", ")}`);
    const local = new Set(urls.filter((u) => u.includes("/fonts/") && u.endsWith(".woff2")));
    assert(local.size >= 2, `本地 woff2 请求不足：${[...local].join(", ")}`);
    const ref = urls.filter((u) => /reference_/.test(u));
    assert(ref.length === 0, `页面请求了参考图：${ref.join(", ")}`);
    await page.close();
  });

  // ---------- 7. 联系表单 ----------
  test("联系表单：禁用态/行内错误/成功态", async () => {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    await page.goto(`${BASE}/contact`, { waitUntil: "networkidle" });
    const submit = page.getByRole("button", { name: "发送消息" });
    assert(await submit.isDisabled(), "空表单提交按钮应为禁用");
    await page.getByLabel("邮箱").fill("bad");
    await page.getByLabel("邮箱").blur();
    assert(await page.getByText("请输入有效的邮箱地址").isVisible(), "邮箱行内错误未显示");
    assert(await submit.isDisabled(), "非法邮箱时按钮应禁用");
    await page.getByLabel("姓名").fill("访客");
    await page.getByLabel("邮箱").fill("hello@example.com");
    await page.getByLabel("留言").fill("想了解一项完整的摄影合作计划，谢谢。");
    assert(await submit.isEnabled(), "合法输入后按钮应可点击");
    await submit.click();
    await page.getByText("谢谢你的来信").waitFor({ timeout: 5000 });
    assert(await page.getByText("谢谢你的来信").isVisible(), "成功态未出现");
    await page.screenshot({ path: path.join(__dirname, ".verify/contact-success.png") });
    await page.close();
  });

  // ---------- 8. 系列页共享数据模型 ----------
  test("系列详情标题顺序 = photos.json 按 order 派生", async () => {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    await page.goto(`${BASE}/work/highland-pastoral`, { waitUntil: "networkidle" });
    const expected = data.photos
      .filter((p) => p.seriesId === "highland-pastoral")
      .sort((a, b) => a.order - b.order)
      .map((p) => p.title);
    const actual = await page.locator(".story article h2").allTextContents();
    assert(JSON.stringify(actual) === JSON.stringify(expected), `系列顺序不一致：${actual} vs ${expected}`);
    await page.close();
  });

  // ---------- 9. 桌面截图 ----------
  test("桌面端五条路由截图", async () => {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    for (const [name, route] of [["home", "/"], ["work", "/work"], ["series", "/work/wilderness"], ["about", "/about"], ["contact", "/contact"]]) {
      await page.goto(BASE + route, { waitUntil: "networkidle" });
      // 逐段滚动以触发懒加载图片
      await page.evaluate(async () => {
        const step = window.innerHeight * 0.8;
        for (let y = 0; y <= document.body.scrollHeight; y += step) {
          window.scrollTo(0, y);
          await new Promise((r) => setTimeout(r, 120));
        }
        window.scrollTo(0, 0);
        await new Promise((r) => setTimeout(r, 400));
      });
      await page.screenshot({ path: path.join(__dirname, `.verify/desktop-${name}.png`), fullPage: true });
    }
    await page.close();
  });

  for (const t of tests) {
    try {
      await t.fn();
      passed++;
      console.log(`  ✓ ${t.name}`);
    } catch (e) {
      console.log(`  ✗ ${t.name}\n      ${e.message}`);
    }
  }

  await browser.close();
  console.log(`\n${passed}/${tests.length} 通过`);
  if (passed !== tests.length) process.exit(1);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
