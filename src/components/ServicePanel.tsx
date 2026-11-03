import type { Service } from "@/content/services";
import { T } from "./T";

/**
 * One editorial service panel. Large type, a custom visual object (drawn by
 * services.ts into .svc-visual) and a reveal toggle.
 * Interaction is attached by SiteInteractions via the data-service contract.
 */
export function ServicePanel({ service, style }: { service: Service; style?: React.CSSProperties }) {
  return (
    <article className="svc grid" data-service data-visual={service.visual} style={style}>
      <div className="svc-index">{service.index}</div>
      <T as="p" k={`${service.i18n}.kicker`} className="kicker svc-kicker" />
      <T as="h3" k={`${service.i18n}.title`} className="h3 svc-title" />
      <div className="svc-visual" aria-label={service.visualLabel} />
      <T as="p" k={`viz.${service.visual}.cap`} className="viz-cap" />
      <div className="svc-copy">
        <T as="p" k={`${service.i18n}.short`} className="mute" style={{ margin: 0 }} />
        <button className="svc-toggle" aria-expanded="false">
          <span className="plus" aria-hidden="true" />
          <T k="svc.toggle" />
        </button>
        <div className="svc-detail">
          <div>
            <ul>
              {[1, 2, 3, 4].map((i) => (
                <T as="li" key={i} k={`${service.i18n}.i${i}`} />
              ))}
            </ul>
          </div>
        </div>
      </div>
    </article>
  );
}
