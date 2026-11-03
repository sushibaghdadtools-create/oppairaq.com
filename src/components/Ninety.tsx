import { T, tAria } from "@/components/T";
import { XrayLayer } from "@/components/XrayLayer";

const PHASES: Array<[number, number]> = [
  [1, 20],
  [2, 40],
  [3, 20],
  [4, 10],
];

/** Why 90 days: the cycle every partnership runs in, as a timeline that fills on scroll. */
export function Ninety() {
  return (
    <section className="ninety wrap fold-in" id="why-90" data-scroll data-xray-scope aria-labelledby="n90-title">
      <T as="p" k="n90.kicker" className="kicker" />
      <T as="h2" k="n90.title" className="h2" id="n90-title" />
      <T as="p" k="n90.lede" className="lede mute" style={{ marginTop: 16 }} />
      <div className="n90-line" aria-hidden="true">
        <i />
        <b>90</b>
      </div>
      <ol className="n90-phases" {...tAria("n90.aria")}>
        {PHASES.map(([i, span]) => (
          <li key={i} className="n90-phase" style={{ ["--span" as string]: span } as React.CSSProperties}>
            <T k={`n90.p${i}.d`} className="n90-day mute" />
            <T as="p" k={`n90.p${i}.t`} className="h3 n90-t" />
            <T as="p" k={`n90.p${i}.b`} className="mute" />
          </li>
        ))}
      </ol>
      <T as="p" k="n90.cap" className="viz-cap" />
      <T as="p" k="n90.close" className="split-result" />
      <XrayLayer
        hint="xray.hint.n90"
        notes={[
          { k: "xray.n90.1", side: "start", top: "30%" },
          { k: "xray.n90.2", side: "end", top: "58%", ink: true },
        ]}
      />
    </section>
  );
}
