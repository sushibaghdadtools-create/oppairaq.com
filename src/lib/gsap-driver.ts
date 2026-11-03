import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { Construction } from "@/lib/interactions/construction";

gsap.registerPlugin(ScrollTrigger);

/**
 * GSAP ScrollTrigger driver for the construction sequence. The section is
 * tall and its stage is `position: sticky` (CSS), so there is no pinning and
 * no scroll hijacking: ScrollTrigger only reports progress, scrubbed with a
 * short lag so touch scrolling feels weighted. Fully reversible.
 */
export function driveWithScrollTrigger(section: HTMLElement, c: Construction): () => void {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const proxy = { p: 0 };
  const tween = gsap.to(proxy, {
    p: 1,
    ease: "none",
    onUpdate: () => c.setProgress(proxy.p),
    scrollTrigger: {
      trigger: section,
      start: "top top",
      end: "bottom bottom",
      scrub: reduced ? true : 0.35,
      invalidateOnRefresh: true,
    },
  });
  c.setProgress(0);
  return () => {
    tween.scrollTrigger?.kill();
    tween.kill();
  };
}
