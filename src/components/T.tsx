import { createElement, type JSX } from "react";
import dict from "@/content/i18n.json";

type Entry = { ar: string; en: string };
const DICT = dict as Record<string, Entry>;

/** Arabic default text for a key (server-side; the client swaps languages in place). */
export const ar = (k: string): string => DICT[k]?.ar ?? k;
export const en = (k: string): string => DICT[k]?.en ?? k;

type Props<E extends keyof JSX.IntrinsicElements> = {
  k: string;
  as?: E;
} & Omit<JSX.IntrinsicElements[E], "children">;

/**
 * Renders one translatable text node: the Arabic default on the server, with
 * `data-t` so src/lib/interactions/i18n.ts can swap it when the visitor
 * switches language. Default element is <span>.
 */
export function T<E extends keyof JSX.IntrinsicElements = "span">({ k, as, ...rest }: Props<E>) {
  return createElement(as ?? "span", { ...rest, "data-t": k }, ar(k));
}

/** aria-label / title pairs that follow the language. */
export const tAria = (k: string) => ({ "data-t-aria": k, "aria-label": ar(k) });
export const tTitle = (k: string) => ({ "data-t-title": k, title: ar(k) });
