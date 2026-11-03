/**
 * Partner wheel: logos arranged on a circle that turns slowly on its own and
 * can be spun by hand like a wheel of fortune. Drag (finger or mouse) to turn
 * it, let go and it carries the speed you gave it and settles with friction. Each logo counter-rotates so it always
 * reads upright. Arrow keys nudge it; reduced motion stops the idle turn and
 * removes the inertia.
 */
import { clamp, loop, prefersReducedMotion } from "./motion";

export function initWheel(root: ParentNode = document): () => void {
  const wheel = root.querySelector<HTMLElement>("[data-wheel]");
  if (!wheel) return () => {};
  const ring = wheel.querySelector<HTMLElement>(".wheel-ring");
  const items = Array.from(wheel.querySelectorAll<HTMLElement>(".wheel-item"));
  const label = (wheel.closest("section") ?? wheel.parentElement ?? wheel).querySelector<HTMLElement>(".wheel-current");
  if (!ring || !items.length) return () => {};
  const reduced = prefersReducedMotion();
  const n = items.length;
  const step = 360 / n;

  let angle = 0; // degrees
  let vel = reduced ? 0 : 1.6; // deg/s idle drift
  const IDLE = 1.6;
  let dragging = false;
  let lastA = 0;
  let lastT = 0;
  let moved = false;
  let pointerId = -1;
  let stop: (() => void) | null = null;
  let lastIndex = -1;

  const centre = () => {
    const r = ring.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  };
  const pointerAngle = (x: number, y: number) => {
    const c = centre();
    return (Math.atan2(y - c.y, x - c.x) * 180) / Math.PI;
  };

  const render = () => {
    ring.style.transform = `rotate(${angle}deg)`;
    items.forEach((it, i) => {
      // place on the circle, then counter-rotate so the logo stays upright
      it.style.transform = `rotate(${i * step}deg) translateY(calc(var(--wheel-r) * -1)) rotate(${-(i * step) - angle}deg)`;
    });
    // optional: a .wheel-current label names the slot at the top, if the page has one
    if (label) {
      const idx = ((Math.round(-angle / step) % n) + n) % n;
      if (idx !== lastIndex) {
        lastIndex = idx;
        label.textContent = items[idx].dataset.name ?? "";
      }
    }
  };

  const run = () => {
    if (stop) return;
    stop = loop((dt) => {
      if (!dragging) {
        angle += vel * dt;
        if (Math.abs(vel) > IDLE + 0.01) {
          vel *= Math.pow(0.35, dt); // friction
          if (Math.abs(vel) < IDLE) vel = reduced ? 0 : Math.sign(vel || 1) * IDLE;
        }
      }
      render();
      // keep running while drifting; stop when fully at rest (reduced motion)
      if (!dragging && vel === 0) {
        stop = null;
        return false;
      }
      return true;
    });
  };

  const onDown = (e: PointerEvent) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    dragging = true;
    moved = false;
    pointerId = e.pointerId;
    lastA = pointerAngle(e.clientX, e.clientY);
    lastT = e.timeStamp;
    vel = 0;
    wheel.classList.add("is-dragging");
    try {
      wheel.setPointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
    run();
  };
  const onMove = (e: PointerEvent) => {
    if (!dragging || e.pointerId !== pointerId) return;
    const a = pointerAngle(e.clientX, e.clientY);
    let d = a - lastA;
    if (d > 180) d -= 360;
    if (d < -180) d += 360;
    const dt = Math.max(1, e.timeStamp - lastT) / 1000;
    if (Math.abs(d) > 0.5) moved = true;
    angle += d;
    vel = vel * 0.5 + (d / dt) * 0.5;
    lastA = a;
    lastT = e.timeStamp;
    render();
  };
  const onUp = (e: PointerEvent) => {
    if (!dragging || e.pointerId !== pointerId) return;
    dragging = false;
    pointerId = -1;
    wheel.classList.remove("is-dragging");
    vel = reduced ? 0 : clamp(vel, -720, 720);
    if (!moved) vel = reduced ? 0 : IDLE;
    run();
  };
  const onTouchMove = (e: TouchEvent) => {
    if (dragging) e.preventDefault();
  };
  const onKey = (e: KeyboardEvent) => {
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
      e.preventDefault();
      vel = 0;
      angle += e.key === "ArrowLeft" ? step : -step;
      render();
      if (!reduced) {
        vel = IDLE;
        run();
      }
    }
  };
  const onLang = () => {
    if (label && lastIndex >= 0) label.textContent = items[lastIndex].dataset.name ?? "";
  };

  wheel.addEventListener("pointerdown", onDown);
  wheel.addEventListener("pointermove", onMove);
  wheel.addEventListener("pointerup", onUp);
  wheel.addEventListener("pointercancel", onUp);
  wheel.addEventListener("touchmove", onTouchMove, { passive: false });
  wheel.addEventListener("keydown", onKey);
  document.addEventListener("oppa:lang", onLang);

  // only turn while on screen
  const io = new IntersectionObserver(
    (ents) => {
      const on = ents.some((x) => x.isIntersecting);
      if (on) {
        if (!reduced && vel === 0 && !dragging) vel = IDLE;
        run();
      } else if (!dragging) {
        stop?.();
        stop = null;
      }
    },
    { threshold: 0.05 },
  );
  io.observe(wheel);
  render();

  return () => {
    stop?.();
    io.disconnect();
    wheel.removeEventListener("pointerdown", onDown);
    wheel.removeEventListener("pointermove", onMove);
    wheel.removeEventListener("pointerup", onUp);
    wheel.removeEventListener("pointercancel", onUp);
    wheel.removeEventListener("touchmove", onTouchMove);
    wheel.removeEventListener("keydown", onKey);
    document.removeEventListener("oppa:lang", onLang);
  };
}
