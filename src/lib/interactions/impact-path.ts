/**
 * Hero motion: the red circle travels the curved path from idea to execution
 * to impact and grows on the way. It loops on its own; a finger or cursor over
 * the strip scrubs it directly. Honours prefers-reduced-motion (rests at "impact").
 */
import { clamp, prefersReducedMotion } from "./motion";

const TRAVEL = 4200; // ms from idea to impact
const HOLD = 1400; // ms resting at impact before the next journey
const R0 = 6;
const R1 = 22;

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export function initImpactPath(root: ParentNode = document): () => void {
  const el = root.querySelector<HTMLElement>("[data-impact-path]");
  if (!el) return () => {};
  const track = el.querySelector<SVGPathElement>(".ip-track");
  const done = el.querySelector<SVGPathElement>(".ip-done");
  const dot = el.querySelector<SVGCircleElement>(".ip-dot");
  const labels = Array.from(el.querySelectorAll<HTMLElement>(".ip-labels span"));
  if (!track || !done || !dot) return () => {};
  const len = track.getTotalLength();

  const render = (t: number) => {
    const p = track.getPointAtLength(len * t);
    dot.setAttribute("cx", p.x.toFixed(2));
    dot.setAttribute("cy", p.y.toFixed(2));
    dot.setAttribute("r", (R0 + (R1 - R0) * t).toFixed(2));
    done.style.strokeDashoffset = String(1 - t);
    const on = t < 0.34 ? 0 : t < 0.7 ? 1 : 2;
    labels.forEach((l, i) => l.classList.toggle("is-on", i === on));
  };

  if (prefersReducedMotion()) {
    render(1);
    return () => {};
  }

  let raf = 0;
  let start = performance.now();
  let scrub: number | null = null;
  let visible = true;
  const tick = (now: number) => {
    raf = 0;
    if (scrub === null) {
      const cycle = (now - start) % (TRAVEL + HOLD);
      render(cycle < TRAVEL ? easeInOut(cycle / TRAVEL) : 1);
    }
    if (visible) raf = requestAnimationFrame(tick);
  };
  const io = new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    if (visible && !raf) raf = requestAnimationFrame(tick);
  });
  io.observe(el);

  const rtl = () => getComputedStyle(el).direction === "rtl";
  const onMove = (e: PointerEvent) => {
    const r = el.getBoundingClientRect();
    let x = clamp((e.clientX - r.left) / r.width, 0, 1);
    if (rtl()) x = 1 - x;
    scrub = x;
    render(x);
  };
  const onLeave = () => {
    if (scrub === null) return;
    // resume the loop from where the finger left it
    start = performance.now() - TRAVEL * scrub;
    scrub = null;
  };
  el.addEventListener("pointermove", onMove);
  el.addEventListener("pointerdown", onMove);
  el.addEventListener("pointerleave", onLeave);
  el.addEventListener("pointerup", onLeave);
  el.addEventListener("pointercancel", onLeave);
  raf = requestAnimationFrame(tick);
  return () => {
    io.disconnect();
    cancelAnimationFrame(raf);
    el.removeEventListener("pointermove", onMove);
    el.removeEventListener("pointerdown", onMove);
    el.removeEventListener("pointerleave", onLeave);
    el.removeEventListener("pointerup", onLeave);
    el.removeEventListener("pointercancel", onLeave);
  };
}
