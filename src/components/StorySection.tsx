import { MOMENTS } from "@/content/story";
import { T, tAria } from "./T";
import { XrayLayer } from "./XrayLayer";
import { BookCall } from "./BookCall";

/**
 * The customer story in 15 moments. Selecting a moment is handled by
 * src/lib/interactions/story.ts via the data-story contract; the answers
 * travel as data attributes so the content stays here.
 */
export function StorySection() {
  return (
    <section className="story wrap" id="story" data-scroll data-story data-xray-scope aria-labelledby="story-title">
      <div className="backdrop" aria-hidden="true">
        <svg className="arcs" viewBox="0 0 1440 900" preserveAspectRatio="xMaxYMax slice" data-parallax="0.03">
          <circle pathLength={1} cx="1380" cy="860" r="560" />
          <circle className="soft" pathLength={1} cx="1380" cy="860" r="430" />
          <path className="soft" pathLength={1} d="M-200 120 Q 500 40 1100 260" />
        </svg>
        <i className="blob" data-parallax="0.04" aria-hidden="true" />
      </div>
      <T as="p" k="story.kicker" className="kicker" />
      <h2 className="h2" id="story-title">
        <T k="story.title1" />
        <br />
        <T k="story.title2" />
      </h2>
      <T as="p" k="story.lede" className="lede mute" style={{ marginTop: 16 }} />
      <ul className="story-strip" {...tAria("story.aria")}>
        {MOMENTS.map((m) => (
          <li key={m.n}>
            <button
              className={m.key ? "story-step key" : "story-step"}
              aria-pressed="false"
              data-n={m.n}
              data-tk={`m${m.n}`}
            >
              <span className="n">{String(m.n).padStart(2, "0")}</span>
              <T k={`m${m.n}.t`} />
            </button>
          </li>
        ))}
      </ul>
      <div className="story-detail" aria-live="polite">
        <p className="h3 story-title" style={{ gridColumn: "1 / -1" }} />
        {[1, 2, 3].map((i) => (
          <div className="q" key={i}>
            <T as="b" k={`story.q${i}`} />
            <span className="a mute" />
          </div>
        ))}
      </div>
      <div className="section-cta">
        <BookCall ghost />
      </div>
      <XrayLayer
        hint="xray.hint.story"
        notes={[
          { k: "xray.story.1", side: "start", top: "30%" },
          { k: "xray.story.2", side: "end", top: "55%" },
          { k: "xray.story.3", side: "start", bottom: 120, ink: true },
        ]}
      />
    </section>
  );
}
