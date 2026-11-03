/**
 * X-ray mode.
 *
 * Each `[data-xray-scope]` element contains a `.xray-layer` child: a second,
 * aligned layer with genuinely different content (grid, annotations, wireframe).
 * The layer is clipped with `clip-path: circle(var(--xr-r) at var(--xr-x) var(--xr-y))`.
 *
 * Pointer-down and hold (mouse: 180ms, touch: 350ms, no drift) opens the circle
 * under the pointer; it follows movement across scopes; release closes it.
 * While active we stop scrolling and text selection.
 */

import { clamp, lerp, isCoarsePointer, prefersReducedMotion } from "./motion";

interface LayerState {
  scope: HTMLElement;
  layer: HTMLElement;
  r: number;
  target: number;
}

export interface XrayController {
  destroy: () => void;
  /** Programmatic open at viewport coordinates (used for keyboard access). */
  openAt: (clientX: number, clientY: number) => void;
  close: () => void;
  isActive: () => boolean;
}

export function initXray(root: ParentNode = document): XrayController {
  const scopes = Array.from(root.querySelectorAll<HTMLElement>("[data-xray-scope]"));
  const states = new Map<HTMLElement, LayerState>();
  for (const scope of scopes) {
    const layer = scope.querySelector<HTMLElement>(".xray-layer");
    if (!layer) continue;
    layer.setAttribute("aria-hidden", "true");
    states.set(scope, { scope, layer, r: 0, target: 0 });
  }

  let active = false;
  let armed = false; // pointer down, waiting for the hold to complete
  let timer = 0;
  let pointerId = -1;
  let px = 0;
  let py = 0;
  let sx = 0;
  let sy = 0;
  let current: LayerState | null = null;
  let raf = 0;
  let swallowClick = false;
  const reduced = prefersReducedMotion();

  const radiusFor = () => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    return isCoarsePointer() ? clamp(Math.min(vw, vh) * 0.36, 110, 170) : clamp(Math.min(vw, vh) * 0.3, 160, 260);
  };

  const scopeAt = (x: number, y: number): LayerState | null => {
    const el = document.elementFromPoint(x, y) as HTMLElement | null;
    const scope = el?.closest<HTMLElement>("[data-xray-scope]") ?? null;
    return scope ? (states.get(scope) ?? null) : null;
  };

  const setVars = (s: LayerState) => {
    const rect = s.scope.getBoundingClientRect();
    s.layer.style.setProperty("--xr-x", `${px - rect.left}px`);
    s.layer.style.setProperty("--xr-y", `${py - rect.top}px`);
    s.layer.style.setProperty("--xr-r", `${s.r}px`);
  };

  const tick = () => {
    let busy = false;
    states.forEach((s) => {
      const tgt = s === current && active ? s.target : 0;
      const next = reduced ? tgt : lerp(s.r, tgt, 0.22);
      if (Math.abs(next - tgt) < 0.5) s.r = tgt;
      else {
        s.r = next;
        busy = true;
      }
      if (s.r > 0 || tgt > 0) {
        setVars(s);
        s.layer.classList.toggle("is-open", s.r > 0);
      }
    });
    if (busy || active) raf = requestAnimationFrame(tick);
    else raf = 0;
  };
  const ensureLoop = () => {
    if (!raf) raf = requestAnimationFrame(tick);
  };

  const activate = () => {
    armed = false;
    active = true;
    swallowClick = true;
    document.body.classList.add("is-xray");
    const s = scopeAt(px, py);
    current = s;
    if (s) s.target = radiusFor();
    ensureLoop();
  };

  const deactivate = () => {
    clearTimeout(timer);
    armed = false;
    if (!active) return;
    active = false;
    document.body.classList.remove("is-xray");
    current = null;
    ensureLoop();
    // let the click that follows a hold through only if it wasn't an x-ray
    setTimeout(() => (swallowClick = false), 0);
  };

  const onDown = (e: PointerEvent) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    const target = e.target as HTMLElement;
    if (target.closest("input, textarea, select, [data-no-xray]")) return;
    const s = scopeAt(e.clientX, e.clientY);
    if (!s) return;
    pointerId = e.pointerId;
    px = sx = e.clientX;
    py = sy = e.clientY;
    armed = true;
    clearTimeout(timer);
    timer = window.setTimeout(activate, e.pointerType === "touch" ? 350 : 180);
  };

  const onMove = (e: PointerEvent) => {
    if (e.pointerId !== pointerId) return;
    px = e.clientX;
    py = e.clientY;
    if (armed && Math.hypot(px - sx, py - sy) > 8) {
      // the user is scrolling or dragging, not holding
      clearTimeout(timer);
      armed = false;
      return;
    }
    if (!active) return;
    const s = scopeAt(px, py);
    if (s !== current) {
      current = s;
      if (s) s.target = radiusFor();
    }
    ensureLoop();
  };

  const onUp = (e: PointerEvent) => {
    if (e.pointerId !== pointerId) return;
    pointerId = -1;
    deactivate();
  };

  const onTouchMove = (e: TouchEvent) => {
    if (active) e.preventDefault(); // no scrolling while x-raying
  };
  const onClick = (e: MouseEvent) => {
    if (swallowClick) {
      e.preventDefault();
      e.stopPropagation();
      swallowClick = false;
    }
  };
  const onContext = (e: Event) => {
    if (active || armed) e.preventDefault();
  };
  const onSelect = (e: Event) => {
    if (active || armed) e.preventDefault();
  };

  // Keyboard: hold "x" to open at the centre of the scope nearest the viewport centre.
  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key.toLowerCase() !== "x" || e.repeat || active) return;
    const t = e.target as HTMLElement;
    if (t.closest("input, textarea, [contenteditable]")) return;
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    let best: LayerState | null = null;
    let bestD = Infinity;
    states.forEach((s) => {
      const r = s.scope.getBoundingClientRect();
      const d = Math.abs(r.top + r.height / 2 - cy);
      if (d < bestD && r.bottom > 0 && r.top < window.innerHeight) {
        bestD = d;
        best = s;
      }
    });
    if (!best) return;
    const b = best as LayerState;
    const r = b.scope.getBoundingClientRect();
    px = clamp(cx, r.left, r.right);
    py = clamp(cy, r.top, r.bottom);
    pointerId = -2;
    activate();
  };
  const onKeyUp = (e: KeyboardEvent) => {
    if (e.key.toLowerCase() === "x" && pointerId === -2) {
      pointerId = -1;
      deactivate();
    }
  };

  document.addEventListener("pointerdown", onDown);
  document.addEventListener("pointermove", onMove);
  document.addEventListener("pointerup", onUp);
  document.addEventListener("pointercancel", onUp);
  document.addEventListener("touchmove", onTouchMove, { passive: false });
  document.addEventListener("click", onClick, true);
  document.addEventListener("contextmenu", onContext);
  document.addEventListener("selectstart", onSelect);
  document.addEventListener("keydown", onKeyDown);
  document.addEventListener("keyup", onKeyUp);
  window.addEventListener("blur", deactivate);

  return {
    destroy() {
      deactivate();
      cancelAnimationFrame(raf);
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerup", onUp);
      document.removeEventListener("pointercancel", onUp);
      document.removeEventListener("touchmove", onTouchMove);
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("contextmenu", onContext);
      document.removeEventListener("selectstart", onSelect);
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", deactivate);
    },
    openAt(x, y) {
      px = x;
      py = y;
      pointerId = -3;
      activate();
    },
    close: deactivate,
    isActive: () => active,
  };
}
