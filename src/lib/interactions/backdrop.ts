/**
 * Backdrop motion.
 *
 * Scroll-tied (never time-tied, so it stops when you stop):
 *  - `[data-parallax="0.05"]` moves by (distance from viewport centre) × factor,
 *    clamped to a few pixels, as `--py`.
 *  - `[data-scroll]` sections expose `--sp` (0 as the section enters the
 *    viewport, 1 as it leaves). CSS turns that into a slow rotation of the
 *    rings and the drawing-on of the arcs.
 *  - `[data-fold]` sections expose `--fold` (0 → 1 as the NEXT section slides
 *    up over them). CSS folds the section away underneath: a small scale-down,
 *    a lift and a fade, while the incoming section arrives on a circular edge.
 *
 * Repeating motion (the breathing rings, the liquid blob) is pure CSS and
 * lives in site.css. Everything here is off under prefers-reduced-motion
 * and only runs for elements on screen.
 */
import { clamp, prefersReducedMotion } from "./motion";

export function initParallax(root: ParentNode = document): () => void {
  if (prefersReducedMotion()) return () => {};
  const pEls = Array.from(root.querySelectorAll<HTMLElement>("[data-parallax]"));
  const sEls = Array.from(root.querySelectorAll<HTMLElement>("[data-scroll]"));
  const fEls = Array.from(root.querySelectorAll<HTMLElement>("[data-fold]"));
  if (!pEls.length && !sEls.length && !fEls.length) return () => {};
  const visible = new Set<HTMLElement>();
  const io = new IntersectionObserver(
    (ents) => {
      ents.forEach((e) => (e.isIntersecting ? visible.add(e.target as HTMLElement) : visible.delete(e.target as HTMLElement)));
      onScroll();
    },
    { rootMargin: "25% 0px" },
  );
  [...pEls, ...sEls, ...fEls].forEach((el) => io.observe(el));

  // The pinned hero is one screen tall by design, but on a short viewport its content
  // (and the partner half-wheel at its foot) can be taller than the screen. Pin it by its
  // bottom edge in that case, so the foot is always reached before the next section folds over.
  const hero = root.querySelector<HTMLElement>(".hero[data-fold]");
  const fitHero = () => {
    if (!hero) return;
    const over = Math.max(0, hero.offsetHeight - (window.innerHeight - 56));
    hero.style.setProperty("--hero-over", `${Math.round(over)}px`);
  };

  let raf = 0;
  const update = () => {
    raf = 0;
    fitHero();
    const vh = window.innerHeight;
    const mid = vh / 2;
    visible.forEach((el) => {
      const r = el.getBoundingClientRect();
      if (el.hasAttribute("data-parallax")) {
        const f = parseFloat(el.dataset.parallax ?? "0.05");
        const d = r.top + r.height / 2 - mid;
        el.style.setProperty("--py", `${clamp(-d * f, -28, 28).toFixed(2)}px`);
      }
      if (el.hasAttribute("data-scroll")) {
        const p = clamp((vh - r.top) / (vh + r.height), 0, 1);
        el.style.setProperty("--sp", p.toFixed(4));
      }
      if (el.hasAttribute("data-fold")) {
        const next = el.nextElementSibling as HTMLElement | null;
        if (next) {
          const nr = next.getBoundingClientRect();
          // 0 while the next section is below the fold line, 1 once it has climbed to the top
          const f = clamp((vh - nr.top) / (vh * 0.9), 0, 1);
          el.style.setProperty("--fold", f.toFixed(4));
        }
      }
    });
  };
  const onScroll = () => {
    if (!raf) raf = requestAnimationFrame(update);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  update();
  return () => {
    io.disconnect();
    cancelAnimationFrame(raf);
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("resize", onScroll);
  };
}
