import { WHATSAPP_URL } from "@/content/site";
import { T } from "./T";
import { XrayLayer } from "./XrayLayer";

/**
 * "From a Line to an Experience". The SVG composition is built and driven by
 * src/lib/interactions/construction.ts (GSAP ScrollTrigger in the app). The
 * section is tall; the stage is sticky, so scrolling is never hijacked.
 */
export function Construction() {
  return (
    <section className="construction fold-in" id="construction" aria-labelledby="construction-title">
      <div className="c-sticky wrap" data-xray-scope>
        <div className="c-head">
          <div>
            <T as="p" k="con.kicker" className="kicker" />
            <T as="h2" k="con.title" className="h3" id="construction-title" />
          </div>
          <span className="c-counter" aria-live="polite" aria-label="Stage">
            001
          </span>
        </div>
        <div className="c-stage">
          <a className="c-cta" href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" inert aria-hidden="true">
            <T k="con.cta" />
          </a>
        </div>
        <T as="p" k="con.cap" className="viz-cap c-cap" />
        <div className="c-foot">
          <T k="con.foot" />
          <span className="c-stages" aria-hidden="true">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <T key={i} k={`con.s${i}`} />
            ))}
          </span>
        </div>
        <XrayLayer
          hint="xray.hint.con"
          notes={[
            { k: "xray.con.1", side: "start", top: 72 },
            { k: "xray.con.2", side: "end", top: "50%", ink: true },
            { k: "xray.con.3", side: "start", bottom: 72 },
          ]}
        />
      </div>
    </section>
  );
}
