import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SERVICES, getService } from "@/content/services";
import { T, ar, en } from "@/components/T";
import { BookCall } from "@/components/BookCall";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return SERVICES.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const s = getService((await params).slug);
  return s ? { title: `${ar(`${s.i18n}.title`)} · ${en(`${s.i18n}.title`)}`, description: ar(`${s.i18n}.short`) } : {};
}

export default async function ServicePage({ params }: Params) {
  const { slug } = await params;
  const s = getService(slug);
  if (!s) notFound();
  const k = s.i18n;

  return (
    <>
      <div className="wrap page-head">
        <p className="mute small">
          <Link href="/services" className="link" style={{ minHeight: 0 }}>
            <T k="nav.services" />
          </Link>{" "}
          / {s.index} <T k="svcpage.of" /> {SERVICES.length}
        </p>
        <T as="h1" k={`${k}.title`} className="display" style={{ fontSize: "clamp(2.5rem, 9vw, 6.5rem)" }} />
        <T as="p" k={`${k}.short`} className="lede" />
      </div>

      <div className="wrap grid" style={{ rowGap: 40, paddingBottom: "clamp(48px, 8vw, 120px)" }}>
        <div className="prose" style={{ gridColumn: "1 / -1" }}>
          {[1, 2, 3].map((i) => (
            <T as="p" key={i} k={`${k}.b${i}`} />
          ))}
        </div>
        <div style={{ gridColumn: "1 / -1" }}>
          <T as="h2" k="svcpage.includes" className="h3" style={{ marginBottom: 20 }} />
          <ul className="svc-detail-list">
            {[1, 2, 3, 4].map((i) => (
              <T as="li" key={i} k={`${k}.i${i}`} />
            ))}
          </ul>
        </div>
        <div style={{ gridColumn: "1 / -1" }}>
          <T as="h2" k="svcpage.how" className="h3" style={{ marginBottom: 20 }} />
          <dl className="kv">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} style={{ display: "contents" }}>
                <T as="dt" k={`${k}.e${i}l`} />
                <T as="dd" k={`${k}.e${i}v`} />
              </div>
            ))}
          </dl>
        </div>
        <div className="section-cta" style={{ gridColumn: "1 / -1", marginTop: 0 }}>
          <BookCall sub />
        </div>
      </div>
    </>
  );
}
