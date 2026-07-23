import { useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import { useAuth } from "../../contexts/AuthContext";
import { TextField, TextAreaField, SelectField } from "../../features/admin/components/FormField";
import { ButtonSpinner } from "../../components/ui/LoadingSpinner";
import { submitRentalEnquiry } from "../../services/supabase/rentalEnquiries";

interface Plan { id: string; name: string; duration: string; price_cents: number; currency: string }
interface TournamentOption { id: string; name: string }

export default function RentalEnquiryPage() {
  const { profile } = useAuth();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [tournaments, setTournaments] = useState<TournamentOption[]>([]);
  const [form, setForm] = useState({ rentalPlanId: "", tournamentId: "", organizationName: "", contactName: "", contactPhone: "", contactEmail: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    supabase.from("rental_plans").select("id, name, duration, price_cents, currency").eq("is_active", true).order("sort_order").then(({ data }) => setPlans(data ?? []));
    supabase.from("tournaments").select("id, name").is("deleted_at", null).then(({ data }) => setTournaments(data ?? []));
  }, []);

  useEffect(() => {
    if (profile) {
      setForm((f) => ({ ...f, organizationName: profile.full_name, contactName: profile.full_name, contactEmail: profile.email, contactPhone: profile.phone ?? "" }));
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.rentalPlanId || !form.organizationName || !form.contactPhone) {
      setError("Plan, organization name, and phone are required.");
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      const { whatsappUrl } = await submitRentalEnquiry({
        rentalPlanId: form.rentalPlanId,
        tournamentId: form.tournamentId || undefined,
        organizationName: form.organizationName,
        contactName: form.contactName,
        contactPhone: form.contactPhone,
        contactEmail: form.contactEmail,
        message: form.message,
      });
      setSubmitted(true);
      window.open(whatsappUrl, "_blank");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not submit enquiry");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl space-y-6 p-6">
      <title>Rental Enquiry · TournamentLive</title>
      <div>
        <h1 className="font-heading text-xl font-bold text-[var(--color-heading)]">Activate or renew a rental</h1>
        <p className="text-sm text-[var(--color-muted)]">Fill this in, then continue on WhatsApp — our team activates it manually and confirms by email.</p>
      </div>

      {submitted ? (
        <div className="rounded-card border border-[var(--color-success)]/30 bg-[var(--color-success)]/5 p-6 text-center">
          <MessageCircle size={28} className="mx-auto mb-3 text-[var(--color-success)]" />
          <p className="font-medium text-[var(--color-heading)]">Enquiry sent</p>
          <p className="mt-1 text-sm text-[var(--color-muted)]">
            We opened WhatsApp with your details pre-filled. Once our team activates your plan, you'll get an
            email and an in-app notification.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 rounded-card border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-[var(--color-danger)] dark:bg-red-900/20">{error}</p>}
          <SelectField label="Rental plan" value={form.rentalPlanId} onChange={(v) => setForm((f) => ({ ...f, rentalPlanId: v }))} options={[{ value: "", label: "Select a plan" }, ...plans.map((p) => ({ value: p.id, label: `${p.name} — ${new Intl.NumberFormat("en-IN", { style: "currency", currency: p.currency, maximumFractionDigits: 0 }).format(p.price_cents / 100)}` }))]} />
          <SelectField label="Tournament (optional)" value={form.tournamentId} onChange={(v) => setForm((f) => ({ ...f, tournamentId: v }))} options={[{ value: "", label: "Not tied to a specific tournament" }, ...tournaments.map((t) => ({ value: t.id, label: t.name }))]} />
          <TextField label="Organization name" value={form.organizationName} onChange={(v) => setForm((f) => ({ ...f, organizationName: v }))} />
          <TextField label="Contact name" value={form.contactName} onChange={(v) => setForm((f) => ({ ...f, contactName: v }))} />
          <TextField label="Contact phone" value={form.contactPhone} onChange={(v) => setForm((f) => ({ ...f, contactPhone: v }))} />
          <TextField label="Contact email" value={form.contactEmail} onChange={(v) => setForm((f) => ({ ...f, contactEmail: v }))} />
          <TextAreaField label="Message (optional)" value={form.message} onChange={(v) => setForm((f) => ({ ...f, message: v }))} />
          <button type="submit" disabled={isSubmitting} className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#25D366] px-4 py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60">
            {isSubmitting && <ButtonSpinner />}
            <MessageCircle size={16} /> Continue on WhatsApp
          </button>
        </form>
      )}
    </div>
  );
}
