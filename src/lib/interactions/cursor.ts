/**
 * Custom cursor for fine pointers: a small circle outline that trails the
 * mouse by a few frames, grows over interactive elements and tightens while
 * pressing. Coarse-pointer devices never see it, and the native cursor is
 * hidden only where the custom one is shown.
 */
import { lerp, loop, prefersReducedMotion } from "./motion";

const INTERACTIVE = "a, button, [role='button'], input, textarea, select, summary, label, .story-step";

export function initCursor(el: HTMLElement): () => void {
  const fine = window.matchMedia("(pointer: fine) and (hover: hover)");
  if (!fine.matches) {
    el.hidden = true;
    return () => {};
  }
  const reduced = prefersReducedMotion();
  document.documentElement.classList.add("has-cursor");
  el.hidden = false;

  let tx = -100;
  let ty = -100;
  let x = tx;
  let y = ty;
  let scale = 1;
  let tscale = 1;
  let visible = false;
  let stop: (() => void) | null = null;

  const run = () => {
    if (stop) return;
    stop = loop(() => {
      x = reduced ? tx : lerp(x, tx, 0.35);
      y = reduced ? ty : lerp(y, ty, 0.35);
      scale = reduced ? tscale : lerp(scale, tscale, 0.25);
      el.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%) scale(${scale})`;
      const settled = Math.abs(x - tx) < 0.2 && Math.abs(y - ty) < 0.2 && Math.abs(scale - tscale) < 0.005;
      if (settled) {
        stop = null;
        return false;
      }
      return true;
    });
  };

  const onMove = (e: PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    tx = e.clientX;
    ty = e.clientY;
    if (!visible) {
      visible = true;
      x = tx;
      y = ty;
      el.classList.add("is-visible");
    }
    const t = e.target as HTMLElement | null;
    const over = !!t?.closest(INTERACTIVE);
    el.classList.toggle("is-over", over);
    tscale = over ? 1.8 : 1;
    run();
  };
  const onDown = () => {
    el.classList.add("is-down");
    tscale = 0.7;
    run();
  };
  const onUp = (e: PointerEvent) => {
    el.classList.remove("is-down");
    const t = e.target as HTMLElement | null;
    tscale = t?.closest(INTERACTIVE) ? 1.8 : 1;
    run();
  };
  const onLeave = () => {
    visible = false;
    el.classList.remove("is-visible");
  };

  document.addEventListener("pointermove", onMove, { passive: true });
  document.addEventListener("pointerdown", onDown, { passive: true });
  document.addEventListener("pointerup", onUp, { passive: true });
  document.documentElement.addEventListener("mouseleave", onLeave);

  return () => {
    stop?.();
    document.documentElement.classList.remove("has-cursor");
    document.removeEventListener("pointermove", onMove);
    document.removeEventListener("pointerdown", onDown);
    document.removeEventListener("pointerup", onUp);
    document.documentElement.removeEventListener("mouseleave", onLeave);
  };
}
