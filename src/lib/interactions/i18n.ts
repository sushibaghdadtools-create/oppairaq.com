/**
 * Arabic-first bilingual text. The page is authored once with `data-t="key"`
 * on every translatable element (and `data-t-aria` for aria-labels); this
 * module swaps text in place and flips `lang` / `dir` on the root element.
 *
 * The switch animates as a circle growing from the toggle, using the View
 * Transitions API where it exists; elsewhere it is instant.
 */
import dict from "../../content/i18n.json";

export type Lang = "ar" | "en";
type Entry = { ar: string; en: string };
const DICT = dict as Record<string, Entry>;
const KEY = "oppa.lang";
export const DEFAULT_LANG: Lang = "ar";

export function t(key: string, lang: Lang = getLang()): string {
  const e = DICT[key];
  if (!e) return key;
  return e[lang] ?? e.ar;
}

export function getLang(): Lang {
  if (typeof document === "undefined") return DEFAULT_LANG;
  return document.documentElement.lang === "en" ? "en" : "ar";
}

export function savedLang(): Lang {
  try {
    const v = localStorage.getItem(KEY);
    if (v === "en" || v === "ar") return v;
  } catch {
    /* no storage */
  }
  return DEFAULT_LANG;
}

/** Applies a language to the document: root attributes + every data-t node. */
export function applyLang(lang: Lang, root: ParentNode = document): void {
  const html = document.documentElement;
  html.lang = lang;
  html.dir = lang === "ar" ? "rtl" : "ltr";
  root.querySelectorAll<HTMLElement | SVGElement>("[data-t]").forEach((el) => {
    const k = el.getAttribute("data-t");
    if (k) el.textContent = t(k, lang);
  });
  root.querySelectorAll<HTMLElement>("[data-t-aria]").forEach((el) => {
    const k = el.getAttribute("data-t-aria");
    if (k) el.setAttribute("aria-label", t(k, lang));
  });
  root.querySelectorAll<HTMLElement>("[data-t-title]").forEach((el) => {
    const k = el.getAttribute("data-t-title");
    if (k) el.setAttribute("title", t(k, lang));
  });
  try {
    localStorage.setItem(KEY, lang);
  } catch {
    /* ignore */
  }
  document.dispatchEvent(new CustomEvent("oppa:lang", { detail: lang }));
}

/** Wires a toggle button. The switch grows as a circle from the button. */
export function bindLangToggle(btn: HTMLElement, root: ParentNode = document): () => void {
  const onClick = () => {
    const next: Lang = getLang() === "ar" ? "en" : "ar";
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const doc = document as Document & { startViewTransition?: (cb: () => void) => { ready: Promise<void> } };
    if (!doc.startViewTransition || reduced) {
      applyLang(next, root);
      return;
    }
    const r = btn.getBoundingClientRect();
    const x = r.left + r.width / 2;
    const y = r.top + r.height / 2;
    const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    const vt = doc.startViewTransition(() => applyLang(next, root));
    vt.ready.then(() => {
      document.documentElement.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
        { duration: 650, easing: "cubic-bezier(0.22, 1, 0.36, 1)", pseudoElement: "::view-transition-new(root)" },
      );
    });
  };
  btn.addEventListener("click", onClick);
  return () => btn.removeEventListener("click", onClick);
}

/** Restores the saved language on load and wires every [data-lang-toggle]. */
export function initI18n(root: ParentNode = document): () => void {
  // Always apply on load: a host page may supply <html> without lang/dir, and
  // the direction must be set for Arabic to lay out right-to-left.
  applyLang(savedLang(), root);
  const cleanups = Array.from(root.querySelectorAll<HTMLElement>("[data-lang-toggle]")).map((b) => bindLangToggle(b, root));
  return () => cleanups.forEach((c) => c());
}
