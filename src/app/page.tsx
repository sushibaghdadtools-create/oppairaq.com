import Link from "next/link";
import { SERVICES } from "@/content/services";
import { ServicePanel } from "@/components/ServicePanel";
import { Construction } from "@/components/Construction";
import { XrayGrid } from "@/components/XrayGrid";
import { StorySection } from "@/components/StorySection";
import { Partnership } from "@/components/Partnership";
import { Ninety } from "@/components/Ninety";
import { XrayLayer } from "@/components/XrayLayer";
import { BookCall } from "@/components/BookCall";
import { Partners } from "@/components/Partners";
import { ImpactPath } from "@/components/ImpactPath";
import { T, tAria } from "@/components/T";

export default function HomePage() {
  return (
    <>
      {/* HERO: an X-ray scope: the second layer is the construction drawing of the first */}
      <section className="hero" data-scroll data-fold data-xray-scope aria-labelledby="hero-title">
        <div className="wrap">
          <T as="p" k="hero.eyebrow" className="eyebrow" />
          <h1 className="display" id="hero-title">
            <T k="hero.l1" className="line" />
            <span className="line">
              <T k="hero.l2a" /> <T k="hero.l2hl" className="hl" />
            </span>
          </h1>
          <T as="p" k="hero.lede" className="lede hero-lede" />
          <div className="hero-cta">
            <BookCall />
            <Link className="book ghost" href="/#services" {...tAria("cta.work.aria")}>
              <T k="cta.work" />
            </Link>
          </div>
          <ImpactPath />
        </div>
        <Partners />
        <div className="xray-layer">
          <div className="xray-rows" />
          <XrayGrid />
          <div className="xray-wire wrap">
            <T as="p" k="hero.eyebrow" className="eyebrow" />
            <p className="display">
              <T k="hero.l1" className="line" />
              <span className="line">
                <T k="hero.l2a" /> <T k="hero.l2hl" />
              </span>
            </p>
            <p className="lede hero-lede">
              <T k="hero.lede" /> <T k="hero.fine" className="xray-reveal" />
            </p>
          </div>
          <div className="xray-dim" style={{ insetInline: "var(--margin)", top: 28 }}>
            <T k="xray.dim" />
          </div>
          <T as="div" k="xray.h1" className="xray-note" style={{ insetInlineStart: "calc(var(--margin) + 8px)", top: 60 }} />
          <T as="div" k="xray.lines" className="xray-note ink" style={{ insetInlineStart: "calc(var(--margin) + 8px)", top: 84 }} />
          <T
            as="div"
            k="xray.note"
            className="xray-note keep"
            style={{ insetInlineEnd: "calc(var(--margin) + 8px)", top: "50%" }}
          />
          <T as="div" k="xray.lede" className="xray-note ink" style={{ insetInlineStart: "calc(var(--margin) + 8px)", bottom: 64 }} />
          <T as="div" k="xray.hint.hero" className="xray-hint" />
        </div>
      </section>

      {/* WHAT THE 90 DAYS INCLUDE */}
      <section className="services wrap fold-in" id="services" data-scroll data-fold data-xray-scope aria-labelledby="services-title">
        <div className="backdrop" aria-hidden="true">
          <svg className="arcs" viewBox="0 0 1440 1600" preserveAspectRatio="xMidYMin slice" data-parallax="0.03">
            <path pathLength={1} d="M-240 140 C 320 -40 980 -40 1680 170" />
            <path className="soft" pathLength={1} d="M-120 980 Q 720 640 1560 1040" />
          </svg>
        </div>
        <T as="p" k="svc.kicker" className="kicker" />
        <T as="h2" k="svc.title" className="h2" id="services-title" />
        <T as="p" k="svc.lede" className="lede mute" style={{ marginTop: 16 }} />
        {SERVICES.map((s, i) => (
          <ServicePanel key={s.slug} service={s} style={i === 0 ? { marginTop: 40 } : undefined} />
        ))}
        <div className="section-cta">
          <BookCall ghost sub />
        </div>
        <XrayLayer
          hint="xray.hint.svc"
          notes={[
            { k: "xray.svc.4", side: "start", top: "5%", ink: true },
            { k: "xray.svc.1", side: "end", top: "22%" },
            { k: "xray.svc.2", side: "start", top: "52%" },
            { k: "xray.svc.3", side: "end", top: "82%" },
          ]}
        />
      </section>

      <Ninety />
      <Construction />

      <StorySection />
      <Partnership />
    </>
  );
}
