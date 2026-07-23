import { useState } from "react";
import { Mail, Phone } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import { useSiteContext } from "../../features/publicSite/hooks/useSiteContext";
import { SectionHeading } from "../../features/publicSite/components/FadeInSection";
import { ButtonSpinner } from "../../components/ui/LoadingSpinner";
import { SuccessBanner } from "../../components/ui/ErrorState";

export default function ContactPage() {
  const { tournament } = useSiteContext();
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      setError("Name, email, and message are required.");
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      const { error: insertError } = await supabase.from("contact_messages").insert({
        tournament_id: tournament.id, name: form.name, email: form.email, phone: form.phone || null, message: form.message,
      });
      if (insertError) throw insertError;
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send message");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <SectionHeading title="Contact" subtitle={`Get in touch about ${tournament.name}`} />
      {submitted ? (
        <SuccessBanner message="Message sent — the organizer will get back to you soon." />
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 rounded-card border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-[var(--color-danger)] dark:bg-red-900/20">{error}</p>}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--color-text)]">Name</label>
            <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3.5 py-2.5 text-sm outline-none focus:border-[var(--color-primary)]" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--color-text)]">Email</label>
            <input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3.5 py-2.5 text-sm outline-none focus:border-[var(--color-primary)]" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--color-text)]">Phone (optional)</label>
            <input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3.5 py-2.5 text-sm outline-none focus:border-[var(--color-primary)]" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--color-text)]">Message</label>
            <textarea value={form.message} onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))} rows={4} className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3.5 py-2.5 text-sm outline-none focus:border-[var(--color-primary)]" />
          </div>
          <button type="submit" disabled={isSubmitting} className="flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--color-primary)] px-4 py-2.5 text-sm font-medium text-white hover:bg-[var(--color-primary-hover)] disabled:opacity-60">
            {isSubmitting && <ButtonSpinner />}
            Send message
          </button>
        </form>
      )}
    </div>
  );
}
