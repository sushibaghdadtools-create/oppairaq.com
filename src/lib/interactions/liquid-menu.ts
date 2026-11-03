/**
 * Liquid menu.
 *
 * The menu is a sheet clipped by a path whose bottom edge is a curve. While
 * you drag (finger or mouse) the curve bulges toward the pointer, and when
 * you let go it springs back and settles like a surface. Opening is a pull:
 * press the Menu button and drag down (or just tap it); closing is a drag up
 * from anywhere on the sheet (or tap Close / Escape). The links shift a few
 * pixels toward the pointer so the whole sheet feels like one body.

 */
import { clamp, lerp, loop, springStep, prefersReducedMotion, type SpringState } from "./motion";

export interface LiquidMenuController {
  open: () => void;
  close: () => void;
  toggle: () => void;
  isOpen: () => boolean;
  destroy: () => void;
}

const SHEET = 0.88; // how much of the viewport the open sheet covers

export function initLiquidMenu(root: ParentNode = document): LiquidMenuController {
  const menu = root.querySelector<HTMLElement>(".menu");
  const btn = root.querySelector<HTMLElement>(".menu-btn");
  if (!menu || !btn) return { open() {}, close() {}, toggle() {}, isOpen: () => false, destroy() {} };
  const closeBtn = menu.querySelector<HTMLElement>(".menu-close");
  if (!menu.hasAttribute("tabindex")) menu.setAttribute("tabindex", "-1");
  const links = Array.from(menu.querySelectorAll<HTMLElement>("a"));
  const reduced = prefersReducedMotion();

  let p: SpringState = { x: 0, v: 0 }; // openness 0..1
  let k: SpringState = { x: 0, v: 0 }; // bulge in px
  let fx = 0.5; // pointer x, 0..1
  let targetOpen = false;
  let dragging = false;
  let dragFrom: "button" | "sheet" | null = null;
  let sx = 0;
  let sy = 0;
  let lastY = 0;
  let lastT = 0;
  let vy = 0;
  let moved = false;
  let pointerId = -1;
  let swallow = false;
  let stop: (() => void) | null = null;

  const W = () => window.innerWidth;
  const H = () => window.innerHeight;

  const render = () => {
    const w = W();
    const h = H();
    const ey = p.x * h * SHEET;
    const cx = fx * w;
    const cy = ey + k.x;
    const spread = w * 0.32;
    menu.style.clipPath = `path("M0,0 H${w} V${ey} C${cx + spread},${cy} ${cx - spread},${cy} 0,${ey} Z")`;
    menu.style.setProperty("--p", p.x.toFixed(4));
    const vis = p.x > 0.002;
    menu.style.visibility = vis ? "visible" : "hidden";
    // links drift toward the pointer, deeper rows more
    links.forEach((a, i) => {
      const depth = (i + 1) / links.length;
      const dx = (fx - 0.5) * -22 * depth;
      const dy = (1 - p.x) * 40 * depth;
      a.style.transform = `translate(${dx}px, ${dy}px)`;
      a.style.opacity = String(clamp((p.x - 0.25 - i * 0.08) / 0.4, 0, 1));
    });
  };

  const settle = () => {
    const openNow = p.x > 0.98 && targetOpen;
    const closedNow = p.x < 0.02 && !targetOpen;
    menu.classList.toggle("is-open", targetOpen);
    menu.setAttribute("aria-hidden", String(!openNow && !dragging));
    btn.setAttribute("aria-expanded", String(targetOpen));
    if (openNow || dragging) menu.removeAttribute("inert");
    else if (closedNow) menu.setAttribute("inert", "");
    document.body.style.overflow = targetOpen || dragging ? "hidden" : "";
  };

  const run = () => {
    if (stop) return;
    stop = loop((dt) => {
      let busy = false;
      if (!dragging) {
        const tp = targetOpen ? 1 : 0;
        p = reduced ? { x: tp, v: 0 } : springStep(p, tp, dt, 120, 16);
        k = reduced ? { x: 0, v: 0 } : springStep(k, 0, dt, 90, 9); // underdamped: it wobbles, then settles
        if (Math.abs(p.x - tp) > 0.001 || Math.abs(p.v) > 0.01 || Math.abs(k.x) > 0.3 || Math.abs(k.v) > 1) busy = true;
        else {
          p = { x: tp, v: 0 };
          k = { x: 0, v: 0 };
        }
      } else busy = true;
      render();
      settle();
      if (!busy) {
        stop = null;
        return false;
      }
      return true;
    });
  };

  const setOpen = (o: boolean) => {
    targetOpen = o;
    if (!reduced && !o) k = { x: k.x, v: k.v - 600 }; // a little kick on release
    run();
    if (o) setTimeout(() => menu.focus({ preventScroll: true }), reduced ? 0 : 350);
    else btn.focus({ preventScroll: true });
  };

  // ---- drag
  const begin = (e: PointerEvent, from: "button" | "sheet") => {
    dragging = true;
    dragFrom = from;
    pointerId = e.pointerId;
    sx = e.clientX;
    sy = e.clientY;
    lastY = sy;
    lastT = e.timeStamp;
    vy = 0;
    moved = false;
    fx = clamp(e.clientX / W(), 0, 1);
    menu.classList.add("is-dragging");
    run();
  };
  const onBtnDown = (e: PointerEvent) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    begin(e, "button");
  };
  const onSheetDown = (e: PointerEvent) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    if ((e.target as HTMLElement).closest(".menu-close")) return;
    begin(e, "sheet");
  };
  const onMove = (e: PointerEvent) => {
    if (dragging && e.pointerId === pointerId) {
      const dy = e.clientY - sy;
      if (!moved && Math.hypot(e.clientX - sx, dy) > 8) moved = true;
      const dt = Math.max(1, e.timeStamp - lastT) / 1000;
      vy = vy * 0.5 + ((e.clientY - lastY) / dt) * 0.5;
      lastY = e.clientY;
      lastT = e.timeStamp;
      fx = clamp(e.clientX / W(), 0, 1);
      const travel = H() * SHEET; // the edge follows the finger one-to-one
      if (dragFrom === "button") p = { x: clamp(dy / travel, 0, 1), v: 0 };
      else p = { x: clamp(1 + dy / travel, 0, 1), v: 0 };
      // the edge is pulled toward the finger, with resistance
      const edge = p.x * H() * SHEET;
      k = { x: clamp((e.clientY - edge) * 0.55, -70, 180), v: 0 };
      render();
      return;
    }
    // idle hover over the open sheet: the surface leans toward the cursor
    if (!dragging && targetOpen && e.pointerType === "mouse" && menu.contains(e.target as Node)) {
      fx = clamp(e.clientX / W(), 0, 1);
      const edge = H() * SHEET;
      k = { x: clamp((e.clientY - edge) * 0.12, -40, 40), v: k.v };
      run();
    }
  };
  const onUp = (e: PointerEvent) => {
    if (!dragging || e.pointerId !== pointerId) return;
    dragging = false;
    pointerId = -1;
    menu.classList.remove("is-dragging");
    k = { x: k.x, v: vy * 0.6 }; // carry the finger's speed into the wobble
    if (!moved) {
      // a tap: toggle from the button; on the sheet, let the link's click through
      if (dragFrom === "button") setOpen(!targetOpen);
      else run();
    } else {
      swallow = true; // a drag never counts as a click on a link
      const flung = Math.abs(vy) > 500;
      const wantOpen = flung ? vy > 0 : p.x > 0.4;
      setOpen(wantOpen);
      setTimeout(() => (swallow = false), 0);
    }
    dragFrom = null;
  };
  const onClick = (e: MouseEvent) => {
    if (swallow) {
      e.preventDefault();
      e.stopPropagation();
      swallow = false;
    }
  };
  const onKey = (e: KeyboardEvent) => {
    if (e.key === "Escape" && targetOpen) setOpen(false);
  };
  const onResize = () => render();
  const onLinkClick = () => setOpen(false);

  btn.addEventListener("pointerdown", onBtnDown);
  menu.addEventListener("pointerdown", onSheetDown);
  document.addEventListener("pointermove", onMove);
  document.addEventListener("pointerup", onUp);
  document.addEventListener("pointercancel", onUp);
  document.addEventListener("click", onClick, true);
  document.addEventListener("keydown", onKey);
  window.addEventListener("resize", onResize);
  closeBtn?.addEventListener("click", () => setOpen(false));
  links.forEach((a) => a.addEventListener("click", onLinkClick));
  // the button's own click is handled by pointerup (tap) — stop the synthetic click re-toggling
  btn.addEventListener("click", (e) => e.preventDefault());

  render();
  settle();

  return {
    open: () => setOpen(true),
    close: () => setOpen(false),
    toggle: () => setOpen(!targetOpen),
    isOpen: () => targetOpen,
    destroy() {
      stop?.();
      btn.removeEventListener("pointerdown", onBtnDown);
      menu.removeEventListener("pointerdown", onSheetDown);
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerup", onUp);
      document.removeEventListener("pointercancel", onUp);
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
      links.forEach((a) => a.removeEventListener("click", onLinkClick));
      document.body.style.overflow = "";
      menu.style.clipPath = "";
    },
  };
}
