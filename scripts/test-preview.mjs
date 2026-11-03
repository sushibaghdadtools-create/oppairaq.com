import { chromium, devices } from "/opt/node22/lib/node_modules/playwright/index.mjs";
const url = "file:///home/claude/oppa-site/preview/out/index.html";
const results = []; const errs = [];
const ok = (name, pass, detail = "") => results.push({ name, pass: !!pass, detail });

async function ctxFor(b, opts) {
  const ctx = await b.newContext(opts); await ctx.route("https://wa.me/**", (r) => r.fulfill({ status: 200, contentType: "text/html", body: "<title>wa</title>" })); const page = await ctx.newPage();
  page.on("pageerror", (e) => errs.push(e.message));
  page.on("console", (m) => m.type() === "error" && !/fonts\.g/.test(m.text()) && errs.push("console: " + m.text()));
  await page.route("**/fonts.googleapis.com/**", (r) => r.fulfill({ status: 200, contentType: "text/css", body: "" }));
  await page.goto(url); await page.waitForTimeout(300);
  return { ctx, page };
}
const scrollToSel = (page, sel) => page.evaluate((s) => { const el = document.querySelector(s); const r = el.getBoundingClientRect(); scrollBy({ top: r.top + Math.min(r.height, innerHeight) / 2 - innerHeight / 2, behavior: "instant" }); }, sel);

const b = await chromium.launch();

// ============ MOBILE ============
{
  const { ctx, page } = await ctxFor(b, { ...devices["iPhone 13"] });
  const cdp = await ctx.newCDPSession(page);
  const touch = async (type, pts) => cdp.send("Input.dispatchTouchEvent", { type, touchPoints: pts });

  ok("mobile: no horizontal overflow", (await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)) === 0);
  ok("mobile: opens in Arabic RTL", (await page.evaluate(() => document.documentElement.lang + "/" + document.documentElement.dir)) === "ar/rtl");

  // X-ray in all five scopes
  for (const sel of [".hero", "#services", "#construction .c-sticky", "#story", "#contact"]) {
    await scrollToSel(page, sel); await page.waitForTimeout(200);
    await touch("touchStart", [{ x: 200, y: 400 }]); await page.waitForTimeout(600);
    const open = await page.evaluate((s) => document.querySelector(s + " .xray-layer")?.classList.contains("is-open"), sel);
    await touch("touchMove", [{ x: 160, y: 430 }]); await page.waitForTimeout(150);
    const followed = await page.evaluate((s) => parseFloat(getComputedStyle(document.querySelector(s + " .xray-layer")).getPropertyValue("--xr-x")) < 190, sel);
    await touch("touchEnd", []); await page.waitForTimeout(500);
    const closed = await page.evaluate(() => !document.body.classList.contains("is-xray"));
    ok(`mobile: X-ray ${sel} opens, follows, closes`, open && followed && closed, `${open}/${followed}/${closed}`);
  }
  // a quick tap on a link must still navigate (no accidental x-ray)
  await page.evaluate(() => scrollTo(0, 0));
  const [wa1] = await Promise.all([ctx.waitForEvent("page", { timeout: 3000 }).catch(() => null), page.locator("#page .hero .book").first().tap()]); await page.waitForTimeout(400);
  ok("mobile: quick tap on Book a call opens WhatsApp", !!wa1 && wa1.url().startsWith("https://wa.me/9647866500095")); if (wa1) await wa1.close();
  await page.evaluate(() => { location.hash = ""; scrollTo(0, 0); });

  // language toggle
  await page.locator("#page .lang-toggle").tap({ force: true }); await page.waitForTimeout(900);
  const en = await page.evaluate(() => ({ lang: document.documentElement.lang, dir: document.documentElement.dir, h1: document.querySelector("#page h1").textContent.trim(), saved: localStorage.getItem("oppa.lang") }));
  ok("mobile: language switch to English + persisted", en.lang === "en" && en.dir === "ltr" && en.h1.startsWith("Not just") && en.saved === "en", JSON.stringify(en));
  await page.reload(); await page.waitForTimeout(300);
  ok("mobile: English remembered after reload", (await page.evaluate(() => document.documentElement.lang)) === "en");
  await page.locator("#page .lang-toggle").tap({ force: true }); await page.waitForTimeout(900);
  ok("mobile: back to Arabic", (await page.evaluate(() => document.documentElement.lang)) === "ar");

  // liquid menu: drag open, link closes, tap toggles, drag up closes
  const btn = await page.locator("#page .menu-btn").boundingBox();
  const bx = btn.x + btn.width / 2, by = btn.y + btn.height / 2;
  await touch("touchStart", [{ x: bx, y: by }]);
  for (let i = 1; i <= 12; i++) { await touch("touchMove", [{ x: bx - i * 10, y: by + i * 24 }]); await page.waitForTimeout(20); }
  const midClip = await page.evaluate(() => document.getElementById("menu").style.clipPath);
  await touch("touchEnd", []); await page.waitForTimeout(1200);
  const opened = await page.evaluate(() => document.getElementById("menu").classList.contains("is-open") && document.getElementById("menu").getAttribute("aria-hidden") === "false");
  ok("mobile: menu drags open with a liquid edge", opened && /C/.test(midClip), midClip.slice(0, 60));
  const [wa2] = await Promise.all([ctx.waitForEvent("page", { timeout: 3000 }).catch(() => null), page.locator("#menu .book").tap()]); await page.waitForTimeout(1200);
  ok("mobile: menu Book a call closes menu and opens WhatsApp", (await page.evaluate(() => !document.getElementById("menu").classList.contains("is-open"))) && !!wa2 && wa2.url().startsWith("https://wa.me/9647866500095")); if (wa2) await wa2.close();
  await page.evaluate(() => { location.hash = ""; scrollTo(0, 0); });
  await page.locator("#page .menu-btn").tap({ force: true }); await page.waitForTimeout(1200);
  ok("mobile: menu tap opens", await page.evaluate(() => document.getElementById("menu").classList.contains("is-open")));
  const H = await page.evaluate(() => innerHeight);
  await touch("touchStart", [{ x: 200, y: H * 0.7 }]);
  for (let i = 1; i <= 12; i++) { await touch("touchMove", [{ x: 200, y: H * 0.7 - i * 40 }]); await page.waitForTimeout(20); }
  await touch("touchEnd", []); await page.waitForTimeout(1200);
  ok("mobile: drag up closes menu, scroll restored", await page.evaluate(() => !document.getElementById("menu").classList.contains("is-open") && document.body.style.overflow === "" && document.getElementById("menu").hasAttribute("inert")));

  // services: visual objects render and react; toggles open
  await scrollToSel(page, "#page .svc"); await page.waitForTimeout(400);
  const bars = await page.evaluate(() => document.querySelectorAll("#page .svc:nth-of-type(1) .svc-visual rect").length);
  ok("mobile: service 1 signal object drawn", bars >= 24, String(bars));
  await touch("touchStart", [{ x: 60, y: 500 }]); await page.waitForTimeout(400); await touch("touchEnd", []);
  for (let i = 1; i <= 3; i++) {
    const t = page.locator("#page .svc-toggle").nth(i - 1); await t.scrollIntoViewIfNeeded(); await t.tap(); await page.waitForTimeout(600);
    const o = await page.evaluate((n) => { const p = document.querySelectorAll("#page .svc")[n - 1]; return p.classList.contains("is-open") && p.querySelector(".svc-toggle").getAttribute("aria-expanded") === "true" && !p.querySelector(".svc-detail").hasAttribute("inert"); }, i);
    ok(`mobile: service ${i} reveal opens`, o);
  }
  ok("mobile: three different visuals", (await page.evaluate(() => new Set([...document.querySelectorAll("#page [data-service]")].map((p) => p.dataset.visual)).size)) === 3);

  // construction: 8 stages, reversible, cta live only at end
  const top = await page.evaluate(() => document.getElementById("construction").offsetTop);
  const h = await page.evaluate(() => document.getElementById("construction").offsetHeight - innerHeight);
  const seen = [];
  for (const f of [0, 0.14, 0.27, 0.4, 0.52, 0.65, 0.78, 0.9, 1]) { await page.evaluate((y) => scrollTo(0, y), top + h * f); await page.waitForTimeout(120); seen.push(await page.locator("#page .c-counter").textContent()); }
  ok("mobile: construction counts 001 to 008", new Set(seen).size === 8 && seen[0] === "001" && seen.at(-1) === "008", seen.join(","));
  const liveEnd = await page.evaluate(() => { const c = document.querySelector(".c-cta"); return c.classList.contains("is-live") && !c.hasAttribute("inert") && getComputedStyle(c).pointerEvents === "auto"; });
  await page.evaluate((y) => scrollTo(0, y), top + h * 0.3); await page.waitForTimeout(150);
  const reversed = await page.evaluate(() => !document.querySelector(".c-cta").classList.contains("is-live") && document.querySelector("#page .c-counter").textContent === "003");
  ok("mobile: CTA live at stage 8 only, sequence reverses", liveEnd && reversed);
  await page.evaluate((y) => scrollTo(0, y), top + h); await page.waitForTimeout(200);
  const [wa3] = await Promise.all([ctx.waitForEvent("page", { timeout: 3000 }).catch(() => null), page.locator("#page .c-cta").tap()]); await page.waitForTimeout(300);
  ok("mobile: built CTA opens WhatsApp", !!wa3 && wa3.url().startsWith("https://wa.me/9647866500095")); if (wa3) await wa3.close();
  await page.evaluate(() => { location.hash = ""; });

  // story strip
  await scrollToSel(page, "#story"); await page.waitForTimeout(200);
  const initial = await page.locator("#page .story-title").textContent();
  await page.locator("#page .story-step").nth(6).tap(); await page.waitForTimeout(150);
  const after = await page.evaluate(() => ({ t: document.querySelector("#page .story-title").textContent, a: [...document.querySelectorAll("#page .story-detail .a")].map((x) => x.textContent.length), pressed: [...document.querySelectorAll("#page .story-step")].filter((s) => s.getAttribute("aria-pressed") === "true").length }));
  ok("mobile: story opens on moment 12, tapping 7 updates all three answers", initial.startsWith("12.") && after.t.startsWith("7.") && after.a.every((n) => n > 10) && after.pressed === 1, JSON.stringify(after));

  // parallax + discs present, reduced motion honoured elsewhere
  ok("mobile: backdrop parallax applied", await page.evaluate(() => [...document.querySelectorAll("[data-parallax]")].some((e) => e.style.getPropertyValue("--py") !== "")));
  ok("mobile: all eight Book a call CTAs present", (await page.evaluate(() => document.querySelectorAll("a.book").length)) === 8);
  ok("mobile: no custom cursor on touch", await page.evaluate(() => document.querySelector(".cursor").hidden && !document.documentElement.classList.contains("has-cursor")));
  await page.evaluate(() => scrollTo(0, 0)); await page.waitForTimeout(200);
  ok("mobile: touch targets ≥44px", (await page.evaluate(() => [...document.querySelectorAll("#page button, #page a.book, .menu-btn, .lang-toggle")].filter((e) => { const r = e.getBoundingClientRect(); return r.width > 0 && (r.height < 44 || r.width < 44); }).length)) === 0);
  await ctx.close();
}

// ============ DESKTOP ============
{
  const { ctx, page } = await ctxFor(b, { viewport: { width: 1280, height: 800 } });
  ok("desktop: no horizontal overflow", (await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)) === 0);
  // custom cursor
  const link = await page.locator("#page .nav-links a").nth(1).boundingBox();
  await page.mouse.move(link.x + 8, link.y + 8, { steps: 8 }); await page.waitForTimeout(500);
  const cur = await page.evaluate(() => { const c = document.querySelector(".cursor"); return { vis: c.classList.contains("is-visible"), over: c.classList.contains("is-over"), native: getComputedStyle(document.body).cursor, tf: c.style.transform }; });
  ok("desktop: circle cursor follows and grows over links, native hidden", cur.vis && cur.over && cur.native === "none" && /translate3d/.test(cur.tf), JSON.stringify(cur));
  ok("desktop: no underline on nav hover", (await page.evaluate(() => { const a = document.querySelector("#page .nav-links a"); const cs = getComputedStyle(a); return cs.borderBottomWidth === "0px" && cs.textDecorationLine === "none" && !document.querySelector(".nav-blob"); })));
  // X-ray mouse hold + keyboard X
  await page.mouse.move(640, 300); await page.mouse.down(); await page.waitForTimeout(400);
  const mx = await page.evaluate(() => document.querySelector(".hero .xray-layer").classList.contains("is-open"));
  await page.mouse.move(700, 340, { steps: 6 }); await page.waitForTimeout(120);
  await page.mouse.up(); await page.waitForTimeout(400);
  ok("desktop: X-ray on mouse hold, released", mx && (await page.evaluate(() => !document.body.classList.contains("is-xray"))));
  await page.keyboard.down("x"); await page.waitForTimeout(150);
  const kx = await page.evaluate(() => document.body.classList.contains("is-xray"));
  await page.keyboard.up("x"); await page.waitForTimeout(100);
  ok("desktop: X-ray via keyboard X", kx && (await page.evaluate(() => !document.body.classList.contains("is-xray"))));
  // language circle transition exists (View Transitions) and toggles
  await page.locator("#page .lang-toggle").click(); await page.waitForTimeout(1000);
  ok("desktop: language toggle", (await page.evaluate(() => document.documentElement.lang)) === "en");
  // nav book a call visible on desktop
  ok("desktop: Book a call in the nav bar", await page.locator("#page .nav .book").isVisible());
  // services hover reacts
  await scrollToSel(page, "#page .svc"); await page.waitForTimeout(300);
  const before = await page.evaluate(() => document.querySelector("#page .svc-visual text").textContent);
  const vis = await page.locator("#page .svc-visual").first().boundingBox();
  await page.mouse.move(vis.x + vis.width * 0.9, vis.y + vis.height * 0.2, { steps: 10 }); await page.waitForTimeout(600);
  const afterTxt = await page.evaluate(() => document.querySelector("#page .svc-visual text").textContent);
  ok("desktop: service visual reacts to cursor", before !== afterTxt, `${before} → ${afterTxt}`);
  // keyboard: tab reaches toggles and story steps; arrows move story
  await scrollToSel(page, "#story"); await page.locator("#page .story-step").nth(2).focus(); await page.keyboard.press("ArrowRight"); await page.waitForTimeout(100);
  ok("desktop: arrow keys move through moments", (await page.locator("#page .story-title").textContent()).startsWith("4."));
  // construction at desktop with GSAP-less driver
  const top = await page.evaluate(() => document.getElementById("construction").offsetTop);
  const h = await page.evaluate(() => document.getElementById("construction").offsetHeight - innerHeight);
  await page.evaluate((y) => scrollTo(0, y), top + h); await page.waitForTimeout(200);
  ok("desktop: construction reaches 008 with live CTA", (await page.locator("#page .c-counter").textContent()) === "008" && (await page.evaluate(() => document.querySelector(".c-cta").classList.contains("is-live"))));
  // menu on desktop: button hidden, Escape closes if opened programmatically not needed
  ok("desktop: menu button hidden at ≥720px", !(await page.locator("#page .menu-btn").isVisible()));
  await ctx.close();
}

// ============ REDUCED MOTION ============
{
  const { ctx, page } = await ctxFor(b, { ...devices["iPhone 13"], reducedMotion: "reduce" });
  ok("reduced: blob animation off", (await page.evaluate(() => getComputedStyle(document.querySelector(".blob")).animationName)) === "none");
  ok("reduced: parallax off", await page.evaluate(() => [...document.querySelectorAll("[data-parallax]")].every((e) => e.style.getPropertyValue("--py") === "")));
  ok("reduced: menu bob off", (await page.evaluate(() => getComputedStyle(document.querySelector(".menu-btn")).animationName)) === "none");
  const top = await page.evaluate(() => document.getElementById("construction").offsetTop);
  const h = await page.evaluate(() => document.getElementById("construction").offsetHeight - innerHeight);
  await page.evaluate((y) => scrollTo(0, y), top + h * 0.55); await page.waitForTimeout(150);
  ok("reduced: construction snaps to whole stages", (await page.locator("#page .c-counter").textContent()) === "006");
  await ctx.close();
}
await b.close();

const failed = results.filter((r) => !r.pass);
for (const r of results) console.log((r.pass ? "PASS " : "FAIL ") + r.name + (r.pass ? "" : "   ← " + r.detail));
console.log(`\n${results.length - failed.length}/${results.length} passed. Page errors: ${errs.length ? errs.join(" | ") : "none"}`);
process.exit(failed.length || errs.length ? 1 : 0);
