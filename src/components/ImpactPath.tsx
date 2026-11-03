import { tAria } from "@/components/T";
import { T } from "@/components/T";

const D = "M24 136 C 150 136, 220 36, 300 86 S 460 150, 576 44";

/**
 * The hero's motion: Oppa's red circle travels a curved path from idea to
 * execution to impact, growing as it goes. Driven by src/lib/interactions/impact-path.ts.
 */
export function ImpactPath() {
  return (
    <div className="impact-path" data-impact-path role="img" {...tAria("path.aria")}>
      <svg viewBox="0 0 600 170" aria-hidden="true" focusable="false">
        <path className="ip-track" d={D} pathLength={1} />
        <path className="ip-done" d={D} pathLength={1} />
        <circle className="ip-dot" cx="24" cy="136" r="7" />
      </svg>
      <div className="ip-labels" aria-hidden="true">
        <T k="path.idea" className="is-on" />
        <T k="path.exec" />
        <T k="path.impact" />
      </div>
    </div>
  );
}
