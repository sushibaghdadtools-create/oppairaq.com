import { XrayGrid } from "./XrayGrid";
import { T } from "./T";

export interface XrayNote {
  k: string; // i18n key
  side: "start" | "end";
  top?: string | number;
  bottom?: string | number;
  ink?: boolean;
}

/**
 * The second, aligned layer an X-ray reveals: the grid, baselines and
 * construction notes for a section. Used by every section except the hero
 * (which also carries a wireframe of its own type).
 */
export function XrayLayer({ notes, hint }: { notes: XrayNote[]; hint: string }) {
  return (
    <div className="xray-layer">
      <div className="xray-rows" />
      <XrayGrid />
      {notes.map((n) => (
        <T
          key={n.k}
          as="div"
          k={n.k}
          className={n.ink ? "xray-note ink" : "xray-note"}
          style={{
            [n.side === "start" ? "insetInlineStart" : "insetInlineEnd"]: "calc(var(--margin) + 8px)",
            top: n.top,
            bottom: n.bottom,
          }}
        />
      ))}
      <T as="div" k={hint} className="xray-hint" />
    </div>
  );
}
