/**
 * The three parts of the 90 days. All copy lives in i18n.json under the
 * `i18n` prefix (title, short, i1–i4, b1–b3, e1l/e1v … e4l/e4v).
 */
export interface Service {
  slug: string;
  i18n: "svc1" | "svc2" | "svc3";
  index: number;
  visual: "signal" | "route" | "rings";
  visualLabel: string;
}

export const SERVICES: Service[] = [
  { slug: "touchpoints", i18n: "svc1", index: 1, visual: "signal", visualLabel: "A signal that responds to where you point" },
  { slug: "growth-plan", i18n: "svc2", index: 2, visual: "route", visualLabel: "A route across a field of points that re-plans towards where you point" },
  { slug: "training", i18n: "svc3", index: 3, visual: "rings", visualLabel: "Concentric levels a learner climbs through as you point around the circle" },
];

export const getService = (slug: string) => SERVICES.find((s) => s.slug === slug);
