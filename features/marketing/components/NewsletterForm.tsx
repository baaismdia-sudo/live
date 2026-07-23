import { useState } from "react";
import { ButtonSpinner } from "../../../components/ui/LoadingSpinner";
import { supabase } from "../../../lib/supabaseClient";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setStatus("error");
      setErrorMessage("Enter a valid email address");
      return;
    }
    setStatus("loading");
    try {
      // Platform-level newsletter signups reuse contact_messages (tournament_id
      // null = platform inbox) rather than a bespoke table, since the shape
      // (name/email/subject/message) already fits and it's staff-readable
      // from the same admin surface as contact form submissions.
      const { error } = await supabase.from("contact_messages").insert({
        tournament_id: null,
        name: "Newsletter signup",
        email,
        subject: "newsletter_subscription",
        message: "Subscribed via landing page newsletter form",
      });
      if (error) throw error;
      setStatus("success");
      setEmail("");
    } catch {
      setStatus("error");
      setErrorMessage("Something went wrong. Please try again.");
    }
  };

  if (status === "success") {
    return <p className="text-sm font-medium text-[var(--color-success)]">You're subscribed! Check your inbox for a welcome note.</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-md gap-2">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        aria-label="Email address"
        className="flex-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3.5 py-2.5 text-sm outline-none focus:border-[var(--color-brand)] focus:ring-2 focus:ring-[var(--color-brand)]/20"
      />
      <button
        type="submit"
        disabled={status === "loading"}
        className="flex items-center gap-2 rounded-lg bg-[var(--color-brand)] px-5 py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60"
      >
        {status === "loading" && <ButtonSpinner />}
        Subscribe
      </button>
      {status === "error" && <p className="absolute mt-14 text-xs text-[var(--color-danger)]">{errorMessage}</p>}
    </form>
  );
}
