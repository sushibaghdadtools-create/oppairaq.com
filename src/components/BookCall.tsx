import { T, tAria } from "./T";
import { WHATSAPP_URL } from "@/content/site";

/** The "Book a call" pill: opens a WhatsApp chat with Oppa. `ghost` is the outlined variant used mid-page. */
export function BookCall({ ghost, sub }: { ghost?: boolean; sub?: boolean }) {
  return (
    <>
      <a className={ghost ? "book ghost" : "book"} href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" {...tAria("cta.book.aria")}>
        <T k="cta.book" />
      </a>
      {sub && <T k="cta.book.sub" className="book-sub mute small" />}
    </>
  );
}
