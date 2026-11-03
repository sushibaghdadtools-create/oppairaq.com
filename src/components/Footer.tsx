import Link from "next/link";
import { XrayGrid } from "./XrayGrid";
import { T } from "./T";
import { BookCall } from "./BookCall";
import { PHONE_DISPLAY, WHATSAPP_URL } from "@/content/site";

export function Footer() {
  return (
    <footer className="footer" id="contact" data-scroll data-xray-scope>
      <div className="wrap">
        <div className="grid">
          <div className="col wide-col">
            <T as="p" k="foot.kicker" className="kicker" />
            <T as="p" k="foot.title" className="h3" style={{ margin: "0 0 8px" }} />
            <a className="link" href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" dir="ltr">
              {PHONE_DISPLAY}
            </a>
            <a className="mute small" href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
              <T k="foot.wa" />
            </a>
            <BookCall />
            <T k="foot.tag" className="mute" />
          </div>
          <div className="col">
            <T k="foot.office" className="mute small" />
            <T k="foot.city" />
            <T k="foot.scope" className="mute" />
          </div>
        </div>
        <div className="footer-bottom">
          <span dir="ltr">© {new Date().getFullYear()} Oppa</span>
          <Link href="/contact" className="sr-only">
            Contact page
          </Link>
        </div>
      </div>
      <div className="xray-layer">
        <div className="xray-rows" />
        <XrayGrid />
        <T
          as="div"
          k="xray.footer.coords"
          className="xray-note"
          style={{ insetInlineStart: "calc(var(--margin) + 8px)", top: "50%" }}
        />
        <T as="div" k="xray.footer.rule" className="xray-note ink" style={{ insetInlineEnd: "calc(var(--margin) + 8px)", top: 24 }} />
        <T as="div" k="xray.hint.footer" className="xray-hint" />
      </div>
    </footer>
  );
}
