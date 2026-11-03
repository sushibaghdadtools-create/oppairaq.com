/**
 * The customer story in 15 moments. Titles and the three answers per moment
 * live in i18n.json under m1 … m15 (keys .t, .a1, .a2, .a3) so they follow
 * the visitor's language; this file only holds the sequence.
 */
export interface Moment {
  n: number;
  /** The defining moment is marked in the strip. */
  key?: boolean;
}

export const MOMENTS: Moment[] = Array.from({ length: 15 }, (_, i) => ({ n: i + 1, key: i + 1 === 12 }));
