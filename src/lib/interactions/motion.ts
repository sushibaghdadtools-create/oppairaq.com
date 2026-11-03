/**
 * Small numeric helpers shared by the interaction modules.
 * No DOM, no framework — safe to unit test and to bundle anywhere.
 */

export const clamp = (v: number, min: number, max: number): number =>
  v < min ? min : v > max ? max : v;

export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;

/** Maps p (0..1 over the whole sequence) to the local 0..1 of stage i out of n. */
export const stageProgress = (p: number, i: number, n: number): number =>
  clamp(p * n - i, 0, 1);

export const easeOutCubic = (t: number): number => 1 - Math.pow(1 - t, 3);
export const easeInOutCubic = (t: number): number =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

export interface SpringState {
  x: number;
  v: number;
}

/**
 * One integration step of a damped spring towards `target`.
 * stiffness/damping are tuned for 60fps; dt is in seconds.
 */
export function springStep(
  s: SpringState,
  target: number,
  dt: number,
  stiffness = 170,
  damping = 22,
): SpringState {
  const a = -stiffness * (s.x - target) - damping * s.v;
  const v = s.v + a * dt;
  const x = s.x + v * dt;
  return { x, v };
}

export const prefersReducedMotion = (): boolean =>
  typeof window !== "undefined" &&
  typeof window.matchMedia === "function" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export const isCoarsePointer = (): boolean =>
  typeof window !== "undefined" &&
  typeof window.matchMedia === "function" &&
  window.matchMedia("(pointer: coarse)").matches;

/** rAF loop that stops itself when `tick` returns false. */
export function loop(tick: (dt: number) => boolean): () => void {
  let last = performance.now();
  let id = 0;
  let alive = true;
  const frame = (now: number) => {
    if (!alive) return;
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    if (tick(dt)) id = requestAnimationFrame(frame);
  };
  id = requestAnimationFrame(frame);
  return () => {
    alive = false;
    cancelAnimationFrame(id);
  };
}
