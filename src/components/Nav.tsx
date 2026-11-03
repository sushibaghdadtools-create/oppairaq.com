import Link from "next/link";
import Image from "next/image";
import { T, tAria } from "@/components/T";
import { BookCall } from "@/components/BookCall";
import { PORTAL_URL, WHATSAPP_URL } from "@/content/site";

const LINKS = [
  { href: "/services", k: "nav.services" },
  { href: "/#story", k: "nav.story" },
  { href: "/#partners", k: "nav.partners" },
  { href: PORTAL_URL, k: "nav.portal", external: true },
  { href: WHATSAPP_URL, k: "nav.contact", external: true },
];

/**
 * Header and the liquid menu sheet. Behaviour (drag-to-open, the liquid edge,
 * the nav highlight, language switch) is attached by
 * SiteInteractions through src/lib/interactions; this component is markup only.
 */
export function Nav() {
  return (
    <>
      <header className="nav">
        <div className="wrap bar">
          <Link className="brand" href="/" aria-label="Oppa أوبا">
            <span className="mark" aria-hidden="true">
              <svg viewBox="0 0 100 100" aria-hidden="true">
                <circle cx="50" cy="50" r="41.7" fill="none" stroke="var(--red)" strokeWidth="16.6" />
                <circle cx="50" cy="50" r="16.7" fill="var(--red)" />
              </svg>
            </span>
            <Image src="/oppa-wordmark.png" alt="Oppa أوبا" width={1517} height={651} priority />
          </Link>
          <nav className="nav-links" aria-label="Primary">
            {LINKS.map((l) =>
              l.external ? (
                <a key={l.href} href={l.href} target={l.href === PORTAL_URL ? undefined : "_blank"} rel="noopener noreferrer">
                  <T k={l.k} />
                </a>
              ) : (
                <Link key={l.href} href={l.href}>
                  <T k={l.k} />
                </Link>
              ),
            )}
          </nav>
          <div className="nav-meta">
            <BookCall />
            <T as="button" k="lang.switch" className="lang-toggle" data-lang-toggle {...tAria("lang.aria")} />
            <button className="menu-btn" aria-expanded="false" aria-controls="menu" {...tAria("nav.menu")}>
              <span className="dots" aria-hidden="true">
                <i />
                <i />
                <i />
              </span>
            </button>
          </div>
        </div>
      </header>

      <div className="menu no-clone" id="menu" role="dialog" aria-modal="true" aria-hidden="true" inert tabIndex={-1}>
        <button className="menu-close">
          <T k="nav.close" />
        </button>
        <nav className="menu-links" aria-label="Menu">
          {[{ href: "/", k: "nav.home" }, ...LINKS, { href: "/#construction", k: "nav.how" }].map((l) =>
            "external" in l && l.external ? (
              <a key={l.href} href={l.href} target={l.href === PORTAL_URL ? undefined : "_blank"} rel="noopener noreferrer">
                <T k={l.k} />
              </a>
            ) : (
              <Link key={l.href} href={l.href}>
                <T k={l.k} />
              </Link>
            ),
          )}
        </nav>
        <BookCall />
        <p className="menu-hint" aria-hidden="true">
          <span className="pull" />
        </p>
      </div>
    </>
  );
}
