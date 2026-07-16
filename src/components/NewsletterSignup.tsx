"use client";
import { useState } from "react";
import { Icon } from "./Icon";
import { Btn } from "./Btn";
import { useHoneypot } from "./Honeypot";

/**
 * Dark newsletter sign-up band for the public site. Brand-agnostic: the app
 * supplies its own `blurb` (subscriber count etc.) and `successNote`; the
 * neutral `heading`, POST `endpoint`, and `source` tag have sensible defaults.
 */
export function NewsletterSignup({
  heading = "Stay in the loop",
  blurb,
  successNote = "You're subscribed!",
  endpoint = "/api/newsletter",
  source = "homepage",
}: {
  heading?: string;
  blurb: string;
  successNote?: string;
  endpoint?: string;
  source?: string;
}) {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hp = useHoneypot();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, source, company: hp.value() }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setDone(true);
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section
      style={{
        background: "var(--color-surface-dark)",
        color: "#fff",
      }}
    >
      <div
        className="wrap"
        style={{ padding: "72px 24px", textAlign: "center" }}
      >
        <Icon name="mail" size={34} color="var(--color-accent-teal-soft)" />
        <h2 style={{ color: "#fff", marginTop: 18 }}>{heading}</h2>
        <p
          style={{
            color: "var(--color-on-dark-soft)",
            fontSize: 17,
            marginTop: 12,
            maxWidth: 460,
            margin: "12px auto 0",
          }}
        >
          {blurb}
        </p>
        {done ? (
          <div
            style={{
              marginTop: 28,
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              color: "var(--color-accent-teal-soft)",
              fontSize: 16,
            }}
          >
            <Icon name="check" size={20} /> {successNote}
          </div>
        ) : (
          <form
            onSubmit={submit}
            style={{
              marginTop: 28,
              display: "flex",
              gap: 10,
              maxWidth: 460,
              margin: "28px auto 0",
            }}
          >
            {hp.field}
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
              placeholder="you@email.com"
              style={{
                flex: 1,
                height: 50,
                borderRadius: 8,
                border: "1px solid rgba(255,255,255,0.2)",
                background: "rgba(255,255,255,0.08)",
                color: "#fff",
                padding: "0 16px",
                fontSize: 15,
              }}
            />
            <Btn
              kind="primary"
              size="lg"
              type="submit"
              disabled={busy}
            >
              {busy ? "Subscribing…" : "Subscribe"}
            </Btn>
          </form>
        )}
        {error && (
          <p
            style={{
              color: "var(--color-error)",
              marginTop: 16,
              fontSize: 14,
            }}
          >
            {error}
          </p>
        )}
      </div>
    </section>
  );
}
