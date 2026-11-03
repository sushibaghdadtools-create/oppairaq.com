/**
 * Services section.
 *
 * Each `[data-service]` panel has:
 *  - a visual object (SVG, built here) that responds to cursor / touch position,
 *  - a reveal toggle (`.svc-toggle`) that opens `.svc-detail`,
 *
 * Animation only runs while the panel is on screen.
 */

import { clamp, lerp, prefersReducedMotion, loop } from "./motion";
import { t as tr, getLang } from "./i18n";

const NS = "http://www.w3.org/2000/svg";
type Visual = (mx: number, my: number, t: number) => void;

/** Fill a translated sentence such as "{a}% of your customers see you" with values. */
function fmt(key: string, vars: Record<string, string | number>) {
  return tr(key).replace(/\{(\w+)\}/g, (_, k) => String(vars[k]));
}

function mk<K extends keyof SVGElementTagNameMap>(tag: K, attrs: Record<string, string | number>, parent: SVGElement) {
  const n = document.createElementNS(NS, tag);
  for (const k in attrs) n.setAttribute(k, String(attrs[k]));
  parent.appendChild(n);
  return n;
}

function svgRoot(mount: HTMLElement): SVGSVGElement {
  const svg = document.createElementNS(NS, "svg");
  svg.setAttribute("viewBox", "0 0 320 320");
  svg.setAttribute("aria-hidden", "true");
  svg.setAttribute("focusable", "false");
  svg.setAttribute("class", "svc-svg");
  mount.appendChild(svg);
  return svg;
}

/** Marketing — a signal: 24 bars whose response follows the pointer. */
function signal(mount: HTMLElement): Visual {
  const svg = svgRoot(mount);
  mk("line", { x1: 16, y1: 160, x2: 304, y2: 160, stroke: "var(--hair)" }, svg);
  const bars: SVGRectElement[] = [];
  const n = 24;
  for (let i = 0; i < n; i++) {
    const x = 16 + i * 12;
    bars.push(mk("rect", { x, y: 158, width: 6, height: 4, fill: "var(--ink)" }, svg));
  }
  const marker = mk("circle", { cx: 16, cy: 160, r: 3, fill: "var(--red)" }, svg);
  const label = mk("text", { x: 16, y: 300, "font-size": 10, fill: "var(--ink)", opacity: 0.7 }, svg);
  const place = () => label.setAttribute("x", String(getLang() === "ar" ? 304 : 16));
  place();
  document.addEventListener("oppa:lang", place);
  return (mx, my, t) => {
    const cx = 16 + mx * 288;
    const spread = lerp(20, 90, my);
    const amp = lerp(30, 120, 1 - my);
    for (let i = 0; i < n; i++) {
      const x = 16 + i * 12 + 3;
      const d = Math.abs(x - cx);
      const g = Math.exp(-(d * d) / (2 * spread * spread));
      const ripple = Math.sin(t * 1.2 + i * 0.5) * 3;
      const h = 4 + g * amp + ripple;
      bars[i].setAttribute("height", String(h));
      bars[i].setAttribute("y", String(160 - h / 2));
      bars[i].setAttribute("fill", g > 0.9 ? "var(--red)" : "var(--ink)");
    }
    marker.setAttribute("cx", String(cx));
    label.textContent = fmt("viz.signal.read", { a: Math.round(lerp(12, 96, mx)), b: lerp(1.2, 4.8, 1 - my).toFixed(1) });
  };
}

/** Strategy — a route across a field of points that re-plans towards the pointer. */
function route(mount: HTMLElement): Visual {
  const svg = svgRoot(mount);
  const dots: SVGCircleElement[] = [];
  const cols = 8;
  const rows = 8;
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++)
      dots.push(mk("circle", { cx: 28 + c * 38, cy: 28 + r * 38, r: 1.5, fill: "var(--ink)", opacity: 0.5 }, svg));
  const path = mk("path", { d: "", fill: "none", stroke: "var(--ink)", "stroke-width": 1.25 }, svg);
  const start = mk("circle", { cx: 28, cy: 294, r: 4, fill: "var(--ink)" }, svg);
  const end = mk("circle", { cx: 294, cy: 28, r: 5, fill: "var(--red)" }, svg);
  const waypoint = mk("rect", { x: 0, y: 0, width: 10, height: 10, fill: "none", stroke: "var(--red)", "stroke-width": 1.25 }, svg);
  const label = mk("text", { x: 28, y: 318, "font-size": 10, fill: "var(--ink)", opacity: 0.7 }, svg);
  const place = () => label.setAttribute("x", String(getLang() === "ar" ? 294 : 28));
  place();
  document.addEventListener("oppa:lang", place);
  return (mx, my, t) => {
    // the waypoint sits on the nearest grid node to the pointer
    const c = clamp(Math.round((mx * 320 - 28) / 38), 0, cols - 1);
    const r = clamp(Math.round((my * 320 - 28) / 38), 0, rows - 1);
    const wx = 28 + c * 38;
    const wy = 28 + r * 38;
    waypoint.setAttribute("x", String(wx - 5));
    waypoint.setAttribute("y", String(wy - 5));
    // Manhattan route: start -> waypoint -> end, with a gentle breathing offset
    const b = Math.sin(t * 0.8) * 1.5;
    path.setAttribute("d", `M28 294 H${wx + b} V${wy} H294 V28`);
    dots.forEach((d, i) => {
      const dc = i % cols;
      const dr = Math.floor(i / cols);
      const dist = Math.hypot(dc - c, dr - r);
      d.setAttribute("opacity", String(clamp(0.85 - dist * 0.12, 0.2, 0.85)));
    });
    start.setAttribute("r", String(4 + Math.sin(t * 2) * 0.5));
    end.setAttribute("r", String(5));
    label.textContent = fmt("viz.route.read", { n: Math.abs(c - 0) + Math.abs(r - 7) + Math.abs(7 - c) + Math.abs(0 - r) });
  };
}

/** Training — rings: a learner climbs through concentric levels. */
function rings(mount: HTMLElement): Visual {
  const svg = svgRoot(mount);
  const ringEls: SVGCircleElement[] = [];
  const levels = 6;
  for (let i = 0; i < levels; i++)
    ringEls.push(mk("circle", { cx: 160, cy: 160, r: 24 + i * 22, fill: "none", stroke: "var(--hair)", "stroke-width": 1 }, svg));
  const arc = mk("circle", { cx: 160, cy: 160, r: 24, fill: "none", stroke: "var(--red)", "stroke-width": 2, pathLength: 1 }, svg);
  arc.style.strokeDasharray = "1";
  arc.setAttribute("transform", "rotate(-90 160 160)");
  const learner = mk("circle", { cx: 160, cy: 136, r: 4, fill: "var(--ink)" }, svg);
  const label = mk("text", { x: 160, y: 310, "text-anchor": "middle", "font-size": 10, fill: "var(--ink)", opacity: 0.7 }, svg);
  return (mx, my, t) => {
    // distance from centre decides the level; angle decides progress within it
    const dx = mx - 0.5;
    const dy = my - 0.5;
    const dist = clamp(Math.hypot(dx, dy) * 2, 0, 1);
    const level = clamp(Math.floor(dist * levels), 0, levels - 1);
    const within = clamp((Math.atan2(dy, dx) + Math.PI / 2 + Math.PI * 2) % (Math.PI * 2), 0, Math.PI * 2) / (Math.PI * 2);
    const r = 24 + level * 22;
    arc.setAttribute("r", String(r));
    arc.style.strokeDashoffset = String(1 - within);
    const ang = within * Math.PI * 2 - Math.PI / 2;
    learner.setAttribute("cx", String(160 + Math.cos(ang) * r));
    learner.setAttribute("cy", String(160 + Math.sin(ang) * r));
    ringEls.forEach((rg, i) => {
      rg.setAttribute("stroke", i === level ? "var(--ink)" : "var(--hair)");
      rg.setAttribute("r", String(24 + i * 22 + Math.sin(t + i) * 0.6));
    });
    label.textContent = fmt("viz.rings.read", { l: level + 1, m: levels, p: Math.round(within * 100) });
  };
}

const VISUALS: Record<string, (m: HTMLElement) => Visual> = { signal, route, rings };

export function initServices(root: ParentNode = document): () => void {
  const reduced = prefersReducedMotion();
  const panels = Array.from(root.querySelectorAll<HTMLElement>("[data-service]"));
  const cleanups: (() => void)[] = [];

  panels.forEach((panel) => {
    const mount = panel.querySelector<HTMLElement>(".svc-visual");
    const kind = panel.dataset.visual ?? "signal";
    const toggle = panel.querySelector<HTMLElement>(".svc-toggle");
    const detail = panel.querySelector<HTMLElement>(".svc-detail");

    let visual: Visual | null = null;
    if (mount && VISUALS[kind]) visual = VISUALS[kind](mount);

    // pointer / touch -> normalised position, smoothed
    let tx = 0.5;
    let ty = 0.5;
    let mx = 0.5;
    let my = 0.5;
    let t = 0;
    let visible = false;
    let stop: (() => void) | null = null;
    const run = () => {
      if (stop || !visual) return;
      stop = loop((dt) => {
        t += dt;
        mx = lerp(mx, tx, reduced ? 1 : 0.12);
        my = lerp(my, ty, reduced ? 1 : 0.12);
        visual!(mx, my, reduced ? 0 : t);
        if (!visible) {
          stop = null;
          return false;
        }
        return true;
      });
    };
    const onMove = (e: PointerEvent) => {
      const r = panel.getBoundingClientRect();
      tx = clamp((e.clientX - r.left) / r.width, 0, 1);
      ty = clamp((e.clientY - r.top) / r.height, 0, 1);
    };
    panel.addEventListener("pointermove", onMove);
    panel.addEventListener("pointerdown", onMove);
    const io = new IntersectionObserver(
      (ents) => {
        visible = ents.some((x) => x.isIntersecting);
        if (visible) run();
      },
      { threshold: 0.05 },
    );
    io.observe(panel);

    // reveal
    const setOpen = (open: boolean) => {
      panel.classList.toggle("is-open", open);
      toggle?.setAttribute("aria-expanded", String(open));
      if (detail) detail.toggleAttribute("inert", !open);
    };
    setOpen(false);
    const onToggle = () => setOpen(!panel.classList.contains("is-open"));
    toggle?.addEventListener("click", onToggle);

    cleanups.push(() => {
      stop?.();
      io.disconnect();
      panel.removeEventListener("pointermove", onMove);
      panel.removeEventListener("pointerdown", onMove);
      toggle?.removeEventListener("click", onToggle);
      mount?.querySelector("svg")?.remove();
    });
  });

  return () => cleanups.forEach((c) => c());
}
