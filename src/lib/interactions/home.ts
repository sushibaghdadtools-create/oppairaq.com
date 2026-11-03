/**
 * Wires every homepage interaction to the DOM contract below. Used by the
 * Next.js <SiteInteractions /> client component and by the standalone
 * preview, so both run exactly the same code.
 *
 * DOM contract (selectors):
 *  #page                      page root
 *  .cursor                    custom cursor element (outside #page)
 *  .menu / .menu-btn / .menu-close
 *  [data-xray-scope] > .xray-layer
 *  #construction / .c-stage / .c-counter / .c-cta
 *  [data-service] ...         see services.ts
 *  [data-story] ...           see story.ts
 *  [data-wheel] ...           see wheel.ts
 *  [data-parallax]            see backdrop.ts
 */

import { initXray } from "./xray";
import { createConstruction, driveWithScroll, type Construction } from "./construction";
import { initServices } from "./services";
import { initStory } from "./story";
import { initI18n } from "./i18n";
import { initCursor } from "./cursor";
import { initLiquidMenu } from "./liquid-menu";
import { initParallax } from "./backdrop";
import { initImpactPath } from "./impact-path";
import { initWheel } from "./wheel";

export interface HomeOptions {
  /** Supply your own scroll driver (e.g. GSAP ScrollTrigger). Return a cleanup. */
  driveConstruction?: (section: HTMLElement, c: Construction) => () => void;
}

export function initHome(root: Document | HTMLElement = document, opts: HomeOptions = {}): () => void {
  const q = <T extends HTMLElement>(sel: string) => root.querySelector<T>(sel);
  const cleanups: (() => void)[] = [];

  // Language first, so every module reads text in the right language
  cleanups.push(initI18n(root));

  // Cursor (fine pointers only), liquid menu
  const cursor = q<HTMLElement>(".cursor");
  if (cursor) cleanups.push(initCursor(cursor));
  cleanups.push(initLiquidMenu(root).destroy);

  // Backdrop parallax (a few pixels, scroll-tied)
  cleanups.push(initParallax(root));

  // Hero motion: idea → execution → impact
  cleanups.push(initImpactPath(root));

  // X-ray
  cleanups.push(initXray(root).destroy);

  // Construction sequence
  const section = q<HTMLElement>("#construction");
  const stageMount = section?.querySelector<HTMLElement>(".c-stage");
  const cta = section?.querySelector<HTMLElement>(".c-cta");
  const counter = section?.querySelector<HTMLElement>(".c-counter") ?? undefined;
  if (section && stageMount && cta) {
    const c = createConstruction({ mount: stageMount, cta, counter });
    const drive = opts.driveConstruction ?? driveWithScroll;
    cleanups.push(drive(section, c));
    cleanups.push(c.destroy);
  }

  const page = q<HTMLElement>("#page") ?? (root as ParentNode);
  cleanups.push(initServices(page));
  cleanups.push(initStory(page));
  cleanups.push(initWheel(page));

  return () => cleanups.forEach((c) => c());
}
