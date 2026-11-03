/**
 * The customer story strip: 15 moments, one selected at a time. Selecting a
 * moment fills the detail panel with its three answers, looked up from the
 * bilingual dictionary by the button's data-tk key (m1 … m15).
 */
import { t } from "./i18n";

export function initStory(root: ParentNode = document): () => void {
  const section = root.querySelector<HTMLElement>("[data-story]");
  if (!section) return () => {};
  const steps = Array.from(section.querySelectorAll<HTMLButtonElement>(".story-step"));
  const detail = section.querySelector<HTMLElement>(".story-detail");
  const title = section.querySelector<HTMLElement>(".story-title");
  const answers = Array.from(section.querySelectorAll<HTMLElement>(".story-detail .a"));

  let current: HTMLButtonElement | null = null;
  const select = (btn: HTMLButtonElement) => {
    current = btn;
    steps.forEach((b) => b.setAttribute("aria-pressed", String(b === btn)));
    const k = btn.dataset.tk ?? "";
    if (title) title.textContent = `${btn.dataset.n}. ${t(`${k}.t`)}`;
    answers.forEach((a, i) => (a.textContent = t(`${k}.a${i + 1}`)));
    detail?.classList.add("is-set");
  };
  const onLang = () => current && select(current);
  document.addEventListener("oppa:lang", onLang);
  const handlers = steps.map((b) => {
    const h = () => select(b);
    b.addEventListener("click", h);
    return () => b.removeEventListener("click", h);
  });
  // keyboard: arrows move between moments
  const onKey = (e: KeyboardEvent) => {
    const i = steps.indexOf(document.activeElement as HTMLButtonElement);
    if (i < 0) return;
    const next = e.key === "ArrowRight" ? i + 1 : e.key === "ArrowLeft" ? i - 1 : -1;
    if (next >= 0 && next < steps.length) {
      e.preventDefault();
      steps[next].focus();
      select(steps[next]);
    }
  };
  section.addEventListener("keydown", onKey);
  const initial = steps.find((b) => b.classList.contains("key")) ?? steps[0];
  if (initial) select(initial);
  return () => {
    handlers.forEach((h) => h());
    section.removeEventListener("keydown", onKey);
    document.removeEventListener("oppa:lang", onLang);
  };
}
