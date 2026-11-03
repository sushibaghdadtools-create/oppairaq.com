import type { Metadata } from "next";
import { ContactForm } from "@/components/ContactForm";
import { T, ar, en } from "@/components/T";

export const metadata: Metadata = {
  title: `${ar("nav.contact")} · ${en("nav.contact")}`,
  description: ar("contact.lede"),
};

export default function ContactPage() {
  return (
    <>
      <div className="wrap page-head">
        <T as="h1" k="contact.title" className="h2" />
        <T as="p" k="contact.lede" className="lede mute" />
      </div>
      <div className="wrap grid" style={{ rowGap: 40, paddingBottom: "clamp(48px, 8vw, 120px)" }}>
        <div style={{ gridColumn: "1 / -1" }} className="contact-form-col">
          <ContactForm />
        </div>
        <div style={{ gridColumn: "1 / -1" }} className="contact-side">
          <dl className="kv">
            <T as="dt" k="contact.phone" />
            <dd>
              <a className="link" href="https://wa.me/9647866500095" target="_blank" rel="noopener noreferrer" style={{ minHeight: 0 }} dir="ltr">
                0786 650 0095
              </a>
            </dd>
            <T as="dt" k="foot.office" />
            <T as="dd" k="foot.city" />
            <T as="dt" k="contact.hours" />
            <T as="dd" k="contact.hoursv" />
          </dl>
        </div>
      </div>
    </>
  );
}
