import { PARTNERS } from "@/content/partners";
import { T, tAria } from "./T";

const initials = (n: string) =>
  n
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

/**
 * Growth partnerships, past and present: a half-visible wheel of partner
 * logos at the foot of the hero, turning slowly and spinnable by hand
 * (src/lib/interactions/wheel.ts).
 */
export function Partners() {
  return (
    <div className="wheel-half" id="partners" aria-labelledby="partners-title">
      <p className="wheel-caption">
        <T k="partners.title" id="partners-title" /> <T k="partners.sub" className="mute" />
      </p>
      <T as="p" k="partners.cap" className="viz-cap wheel-cap" />
      <div className="wheel" data-wheel tabIndex={0} role="list" {...tAria("partners.aria")}>
        <div className="wheel-ring">
          {PARTNERS.map((p) => (
            <div key={p.name} className={`wheel-item ${p.status}${p.square ? " square" : ""}`} data-name={p.name} role="listitem">
              {p.logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.logo} alt={p.name} loading="lazy" />
              ) : (
                <>
                  <span className="initials" aria-hidden="true">
                    {initials(p.name)}
                  </span>
                  <span className="sr-only">{p.name}</span>
                </>
              )}
            </div>
          ))}
        </div>
        <div className="wheel-hub" aria-hidden="true">
          <svg viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="41.7" fill="none" stroke="var(--red)" strokeWidth="16.6" />
            <circle cx="50" cy="50" r="16.7" fill="var(--red)" />
          </svg>
        </div>
      </div>
    </div>
  );
}
