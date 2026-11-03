/**
 * "From a Line to an Experience" — an eight-stage construction sequence.
 *
 * One SVG composition is transformed continuously by setProgress(p), p ∈ [0,1].
 * Stage k occupies p ∈ [k/8, (k+1)/8]. Any scroll driver can call setProgress:
 * the default driver below reads the scroll position of a tall section whose
 * inner stage is `position: sticky`; the Next.js app uses GSAP ScrollTrigger.
 *
 * Stages
 *  0  a single construction line draws itself
 *  1  lines multiply into a 12-column grid
 *  2  the grid becomes a layout (outlined regions)
 *  3  typography enters and aligns to the grid
 *  4  the accent colour is introduced
 *  5  code-like geometry draws itself
 *  6  components assemble into an interface
 *  7  the interface collapses into one functional CTA button
 */

import { clamp, lerp, stageProgress, easeOutCubic, easeInOutCubic, prefersReducedMotion } from "./motion";
import { t, getLang } from "./i18n";

const NS = "http://www.w3.org/2000/svg";
const W = 360;
const H = 240;
const M = 24; // margin
const COLS = 12;
const COLW = (W - 2 * M) / COLS; // 26
const ROWH = 24;

const el = <K extends keyof SVGElementTagNameMap>(
  tag: K,
  attrs: Record<string, string | number>,
  parent: SVGElement,
): SVGElementTagNameMap[K] => {
  const n = document.createElementNS(NS, tag);
  for (const k in attrs) n.setAttribute(k, String(attrs[k]));
  parent.appendChild(n);
  return n;
};

export interface Construction {
  setProgress: (p: number) => void;
  getStage: () => number; // 1..8
  destroy: () => void;
}

export interface ConstructionOptions {
  /** Element that receives the SVG. */
  mount: HTMLElement;
  /** The real CTA link that becomes active at stage 8. */
  cta: HTMLElement;
  /** Receives "001".."008". */
  counter?: HTMLElement;
  headline?: [string, string];
  ctaLabel?: string;
}

export function createConstruction(o: ConstructionOptions): Construction {
  const reduced = prefersReducedMotion();
  const svg = document.createElementNS(NS, "svg");
  svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
  svg.setAttribute("class", "c-svg");
  svg.setAttribute("aria-hidden", "true");
  svg.setAttribute("focusable", "false");
  o.mount.appendChild(svg);

  const ink = "var(--ink)";
  const red = "var(--red)";
  const hair = "var(--hair)";

  // 0 — the single line (also row 4 of the grid)
  const line0 = el("line", { x1: M, y1: 120, x2: W - M, y2: 120, stroke: ink, "stroke-width": 1, pathLength: 1 }, svg);
  line0.style.strokeDasharray = "1";

  // 1 — grid
  const gGrid = el("g", { stroke: hair, "stroke-width": 1 }, svg);
  const gridLines: SVGLineElement[] = [];
  for (let k = 0; k <= COLS; k++) {
    const x = M + k * COLW;
    gridLines.push(el("line", { x1: x, y1: M, x2: x, y2: H - M }, gGrid));
  }
  for (let k = 0; k <= 8; k++) {
    const y = M + k * ROWH;
    if (y === 120) continue; // that one already exists
    gridLines.push(el("line", { x1: M, y1: y, x2: W - M, y2: y }, gGrid));
  }

  // 2 — layout regions
  const gLayout = el("g", { fill: "none", stroke: ink, "stroke-width": 1 }, svg);
  const regions = [
    [M, M, W - 2 * M, ROWH], // header
    [M, 72, COLW * 8, 96], // hero
    [M + COLW * 9, 72, COLW * 3, 96], // aside
    [M, 192, COLW * 4, ROWH], // footer col 1
    [M + COLW * 4, 192, COLW * 4, ROWH], // footer col 2
    [M + COLW * 8, 192, COLW * 4, ROWH], // footer col 3
  ].map(([x, y, w, h]) => {
    const r = el("rect", { x, y, width: w, height: h, pathLength: 1 }, gLayout);
    r.style.strokeDasharray = "1";
    return r;
  });

  // 3 — typography
  const gType = el("g", { fill: ink }, svg);
  const wordmark = el("text", { x: M + 4, y: M + 16, "font-size": 10, "font-weight": 700, "letter-spacing": -0.3 }, gType);
  wordmark.textContent = "Oppa";
  const headA = el("text", { x: M + 4, y: 104, "font-size": 21, "font-weight": 700, "data-t": "con.h1a" }, gType);
  const headB = el("text", { x: M + 4, y: 128, "font-size": 21, "font-weight": 700, "data-t": "con.h1b" }, gType);
  headA.textContent = o.headline?.[0] ?? t("con.h1a");
  headB.textContent = o.headline?.[1] ?? t("con.h1b");
  const bodyLines = [0, 1, 2, 3].map((i) =>
    el("rect", { x: M + 4, y: 144 + i * 6, width: i === 3 ? 90 : 150 - i * 12, height: 1.5, fill: ink, opacity: 0.55 }, gType),
  );
  const typeEls = [wordmark, headA, headB, ...bodyLines];

  // 4 — accent
  const accentBlock = el("rect", { x: M + COLW * 9, y: 72, width: COLW * 3, height: 96, fill: red }, svg);
  const accentRule = el("line", { x1: M, y1: 48, x2: M + COLW * 4, y2: 48, stroke: red, "stroke-width": 2 }, svg);
  const accentDot = el("circle", { cx: M + COLW * 9 + 12, cy: 84, r: 4, fill: "var(--paper)" }, svg);

  // 5 — code-like geometry
  const gCode = el("g", { fill: "none", stroke: ink, "stroke-width": 1 }, svg);
  const growth = el(
    "path",
    {
      d: `M${M + 4} 166 L${M + 40} 162 L${M + 72} 164 L${M + 104} 156 L${M + 136} 158 L${M + 168} 146 L${M + 200} 140`,
      pathLength: 1,
    },
    gCode,
  );
  const bracketL = el("path", { d: `M${M + COLW * 9 + 14} 108 l-6 8 6 8`, pathLength: 1, stroke: "var(--paper)" }, gCode);
  const bracketR = el("path", { d: `M${M + COLW * 9 + 48} 108 l6 8 -6 8`, pathLength: 1, stroke: "var(--paper)" }, gCode);
  const slash = el("path", { d: `M${M + COLW * 9 + 36} 106 l-10 20`, pathLength: 1, stroke: "var(--paper)" }, gCode);
  const codeEls = [growth, bracketL, bracketR, slash];
  codeEls.forEach((c) => (c.style.strokeDasharray = "1"));

  // 6 — components
  const gComp = el("g", {}, svg);
  const pills = [0, 1, 2].map((i) =>
    el("rect", { x: W - M - 4 - (3 - i) * 40 + 8, y: M + 7, width: 30, height: 10, fill: "none", stroke: ink, "stroke-width": 1 }, gComp),
  );
  const field = el("rect", { x: M, y: 192, width: COLW * 7, height: ROWH, fill: "var(--paper)", stroke: ink, "stroke-width": 1 }, gComp);
  const fieldText = el("rect", { x: M + 8, y: 203, width: 70, height: 1.5, fill: ink, opacity: 0.4 }, gComp);
  const button = el("rect", { x: M + COLW * 8, y: 192, width: COLW * 4, height: ROWH, fill: ink }, svg);
  const buttonLabel = el("text", { x: M + COLW * 10, y: 207, "text-anchor": "middle", "font-size": 8, "font-weight": 600, fill: "var(--paper)", "data-t": "con.cta" }, svg);
  buttonLabel.textContent = o.ctaLabel ?? t("con.cta");

  // Headline alignment follows the writing direction; the rest of the drawing is geometry.
  const applyDir = () => {
    const rtl = getLang() === "ar";
    [headA, headB].forEach((tx) => {
      // in SVG, text-anchor is relative to the inline direction: "start" is the right edge in RTL
      tx.setAttribute("text-anchor", "start");
      tx.setAttribute("x", String(rtl ? M + COLW * 8 - 4 : M + 4));
      tx.setAttribute("letter-spacing", rtl ? "0" : "-0.8");
      tx.setAttribute("direction", rtl ? "rtl" : "ltr");
    });
    wordmark.setAttribute("text-anchor", "start");
    wordmark.setAttribute("direction", rtl ? "rtl" : "ltr");
    wordmark.setAttribute("x", String(rtl ? W - M - 4 : M + 4));
    // the accent rule sits under the headline's starting edge
    accentRule.setAttribute("x1", String(rtl ? W - M : M));
    accentRule.setAttribute("x2", String(rtl ? W - M - COLW * 4 : M + COLW * 4));
    bodyLines.forEach((r, i) => r.setAttribute("x", String(rtl ? M + COLW * 8 - 4 - (i === 3 ? 90 : 150 - i * 12) : M + 4)));
    buttonLabel.setAttribute("direction", rtl ? "rtl" : "ltr");
  };
  applyDir();
  document.addEventListener("oppa:lang", applyDir);

  const everythingButButton: (SVGElement | SVGElement[])[] = [
    line0,
    gGrid,
    gLayout,
    gType,
    accentBlock,
    accentRule,
    accentDot,
    gCode,
    gComp,
  ];

  const setDash = (n: SVGElement, t: number) => n.style.setProperty("stroke-dashoffset", String(1 - t));
  const setOp = (n: SVGElement, v: number) => n.setAttribute("opacity", String(clamp(v, 0, 1)));

  let stage = 1;
  let lastStage = 0;

  const setProgress = (raw: number) => {
    let p = clamp(raw, 0, 1);
    if (reduced) p = Math.min(1, Math.ceil(p * 8) / 8); // snap to finished stages
    const s = [0, 1, 2, 3, 4, 5, 6, 7].map((i) => stageProgress(p, i, 8));

    // 0 line
    setDash(line0, easeOutCubic(s[0]));

    // 1 grid: staggered fade-in; later dims to a hairline
    gridLines.forEach((g, i) => {
      const t = clamp(s[1] * 1.6 - (i / gridLines.length) * 0.6, 0, 1);
      setOp(g, t);
    });
    setOp(gGrid, lerp(1, 0.5, s[2]));

    // 2 layout regions draw themselves
    regions.forEach((r, i) => setDash(r, easeOutCubic(clamp(s[2] * 1.5 - i * 0.1, 0, 1))));
    // the original line yields to the layout
    setOp(line0, 1 - s[2] * 0.7);

    // 3 typography enters and aligns
    typeEls.forEach((t, i) => {
      const k = easeOutCubic(clamp(s[3] * 1.4 - i * 0.07, 0, 1));
      setOp(t, k);
      t.setAttribute("transform", `translate(0 ${lerp(10, 0, k)})`);
    });

    // 4 accent introduced
    const a = easeInOutCubic(s[4]);
    accentBlock.setAttribute("transform", `translate(0 ${lerp(16, 0, a)})`);
    setOp(accentBlock, a);
    setDash(accentRule, a);
    accentRule.style.strokeDasharray = "1";
    accentRule.setAttribute("pathLength", "1");
    setOp(accentDot, clamp(a * 2 - 1, 0, 1));

    // 5 code geometry draws
    codeEls.forEach((c, i) => setDash(c, easeInOutCubic(clamp(s[5] * 1.3 - i * 0.1, 0, 1))));

    // 6 components assemble
    pills.forEach((pl, i) => {
      const k = easeOutCubic(clamp(s[6] * 1.5 - i * 0.12, 0, 1));
      pl.setAttribute("transform", `translate(${lerp(40, 0, k)} ${lerp(-14, 0, k)})`);
      setOp(pl, k);
    });
    const kf = easeOutCubic(clamp(s[6] * 1.5 - 0.2, 0, 1));
    field.setAttribute("transform", `translate(${lerp(-30, 0, kf)} ${lerp(16, 0, kf)})`);
    setOp(field, kf);
    fieldText.setAttribute("transform", field.getAttribute("transform") ?? "");
    setOp(fieldText, kf * 0.4);
    const kb = easeOutCubic(clamp(s[6] * 1.5 - 0.35, 0, 1));
    // button: assemble (stage 6) then morph into the CTA (stage 7)
    const m = easeInOutCubic(s[7]);
    const bx = lerp(M + COLW * 8, M, m);
    const by = lerp(192 + lerp(40, 0, kb), 100, m);
    const bw = lerp(COLW * 4, W - 2 * M, m);
    const bh = lerp(ROWH, 44, m);
    button.setAttribute("x", String(bx));
    button.setAttribute("y", String(by));
    button.setAttribute("width", String(bw));
    button.setAttribute("height", String(bh));
    button.setAttribute("fill", m > 0.5 ? red : ink);
    setOp(button, kb);
    buttonLabel.setAttribute("x", String(bx + bw / 2));
    buttonLabel.setAttribute("y", String(by + bh / 2 + 3));
    buttonLabel.setAttribute("font-size", String(lerp(8, 12, m)));
    setOp(buttonLabel, kb * (1 - m));

    // 7 everything else recedes, the real CTA fades in on top
    const recede = 1 - m;
    everythingButButton.forEach((n) => {
      if (Array.isArray(n)) n.forEach((x) => setOp(x, recede));
      else setOp(n, n === gGrid ? recede * lerp(1, 0.5, s[2]) : recede);
    });
    const live = m > 0.85;
    o.cta.style.opacity = String(clamp((m - 0.6) / 0.4, 0, 1));
    o.cta.style.pointerEvents = live ? "auto" : "none";
    if (live) o.cta.removeAttribute("inert");
    else o.cta.setAttribute("inert", "");
    o.cta.setAttribute("aria-hidden", live ? "false" : "true");
    o.cta.classList.toggle("is-live", live);

    // counter
    stage = clamp(Math.floor(p * 8) + 1, 1, 8);
    if (p >= 1) stage = 8;
    if (stage !== lastStage) {
      lastStage = stage;
      if (o.counter) o.counter.textContent = String(stage).padStart(3, "0");
    }
  };

  setProgress(0);

  return {
    setProgress,
    getStage: () => stage,
    destroy() {
      document.removeEventListener("oppa:lang", applyDir);
      svg.remove();
    },
  };
}

/**
 * Default scroll driver: `section` is tall (e.g. 500vh), its first child is
 * `position: sticky`. Progress = how far the section has scrolled through.
 * Fully reversible, no scroll hijacking, touch-friendly.
 */
export function driveWithScroll(section: HTMLElement, c: Construction): () => void {
  let raf = 0;
  const update = () => {
    raf = 0;
    const r = section.getBoundingClientRect();
    const travel = r.height - window.innerHeight;
    const p = travel <= 0 ? 1 : clamp(-r.top / travel, 0, 1);
    c.setProgress(p);
  };
  const onScroll = () => {
    if (!raf) raf = requestAnimationFrame(update);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  update();
  return () => {
    cancelAnimationFrame(raf);
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("resize", onScroll);
  };
}
