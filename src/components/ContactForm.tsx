"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { T } from "./T";
import { t } from "@/lib/interactions/i18n";

type State = "idle" | "sending" | "sent" | "error";

/**
 * Contact form. Posts to /api/contact if you add one; until then it falls
 * back to opening the visitor's mail client with the message pre-filled, so
 * the form is never a dead end.
 */
export function ContactForm() {
  const [state, setState] = useState<State>("idle");
  const reduced = useReducedMotion();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries()) as Record<string, string>;
    setState("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(String(res.status));
      setState("sent");
      form.reset();
    } catch {
      const subject = encodeURIComponent(`Oppa: ${data.company || data.name}`);
      const body = encodeURIComponent(`${data.message}\n\n${data.name}, ${data.company}\n${data.email}`);
      window.location.href = `mailto:hello@oppa.example?subject=${subject}&body=${body}`;
      setState("error");
    }
  }

  return (
    <form className="form" onSubmit={onSubmit} noValidate={false}>
      <div className="field">
        <T as="label" htmlFor="name" k="contact.name" />
        <input id="name" name="name" required autoComplete="name" />
      </div>
      <div className="field">
        <T as="label" htmlFor="company" k="contact.company" />
        <input id="company" name="company" required autoComplete="organization" />
      </div>
      <div className="field">
        <T as="label" htmlFor="email" k="contact.email" />
        <input id="email" name="email" type="email" required autoComplete="email" inputMode="email" />
      </div>
      <div className="field">
        <T as="label" htmlFor="message" k="contact.message" />
        <textarea id="message" name="message" required rows={5} />
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
        <button className="btn" type="submit" disabled={state === "sending"}>
          {state === "sending" ? <T k="contact.sending" /> : <T k="contact.send" />}
        </button>
        <AnimatePresence>
          {state === "sent" && (
            <motion.span
              role="status"
              initial={reduced ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              {t("contact.sent")}
            </motion.span>
          )}
          {state === "error" && (
            <motion.span role="status" className="mute" initial={reduced ? false : { opacity: 0 }} animate={{ opacity: 1 }}>
              {t("contact.error")}
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    </form>
  );
}
