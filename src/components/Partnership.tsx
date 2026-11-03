import { T } from "@/components/T";
import { BookCall } from "@/components/BookCall";
import { XrayLayer } from "@/components/XrayLayer";

/** How we work with our partners: the client's team and Oppa, side by side. */
export function Partnership() {
  return (
    <section className="pship wrap" id="partnership" data-scroll data-xray-scope aria-labelledby="pship-title">
      <T as="p" k="pship.kicker" className="kicker" />
      <T as="h2" k="pship.title" className="h2" id="pship-title" />
      <T as="p" k="pship.lede" className="lede mute" style={{ marginTop: 16 }} />
      <div className="split">
        <div className="split-card">
          <T k="split.who1" className="who" />
          <T as="p" k="split.t1" className="h3" style={{ margin: 0 }} />
          <T as="p" k="split.d1" className="mute" style={{ margin: 0 }} />
        </div>
        <div className="split-plus" aria-hidden="true">
          <i />
          <T k="pship.plus" />
        </div>
        <div className="split-card oppa">
          <T k="split.who2" className="who" />
          <T as="p" k="split.t2" className="h3" style={{ margin: 0 }} />
          <T as="p" k="split.d2" className="mute" style={{ margin: 0 }} />
        </div>
      </div>
      <T as="p" k="pship.result" className="split-result" />
      <div className="section-cta">
        <BookCall />
      </div>
      <XrayLayer
        hint="xray.hint.pship"
        notes={[
          { k: "xray.pship.1", side: "start", top: "30%" },
          { k: "xray.pship.2", side: "end", top: "55%", ink: true },
        ]}
      />
    </section>
  );
}
