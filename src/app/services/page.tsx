import type { Metadata } from "next";
import { SERVICES } from "@/content/services";
import { ServicePanel } from "@/components/ServicePanel";
import { T, ar, en } from "@/components/T";

export const metadata: Metadata = {
  title: `${ar("svc.title")} · ${en("svc.title")}`,
  description: `${ar("svc.lede")} ${en("svc.lede")}`,
};

export default function ServicesPage() {
  return (
    <>
      <div className="wrap page-head">
        <T as="h1" k="svc.title" className="h2" />
        <T as="p" k="svc.lede" className="lede mute" />
      </div>
      <section className="services wrap" style={{ paddingTop: 0 }} aria-label="Services">
        {SERVICES.map((s) => (
          <ServicePanel key={s.slug} service={s} />
        ))}
      </section>
    </>
  );
}
