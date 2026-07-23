import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { WizardStepper } from "../../features/organizer/components/WizardStepper";
import { TextField, TextAreaField, SelectField, CheckboxField } from "../../features/admin/components/FormField";
import { ButtonSpinner } from "../../components/ui/LoadingSpinner";
import { createTournament, checkSlugAvailable, checkSubdomainAvailable, type CreateTournamentPayload } from "../../services/supabase/tournaments";
import { supabase } from "../../lib/supabaseClient";
import { useEffect } from "react";

const STEPS = ["Basics", "Format", "Dates", "Location", "Branding", "Website", "Review"];

const FORMATS = [
  { value: "league", label: "League" },
  { value: "knockout", label: "Knockout" },
  { value: "round_robin", label: "Round Robin" },
  { value: "groups_knockout", label: "Group Stage + Knockout" },
  { value: "double_elimination", label: "Double Elimination" },
  { value: "custom", label: "Custom" },
];

function slugify(text: string) {
  return text.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export default function TournamentWizardPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sports, setSports] = useState<{ id: string; name: string }[]>([]);
  const [plans, setPlans] = useState<{ id: string; name: string; duration: string }[]>([]);

  const [form, setForm] = useState<CreateTournamentPayload>({
    name: "", slug: "", description: "", sport: "", season: "",
    logoUrl: "", bannerUrl: "",
    format: "knockout",
    registrationStart: "", registrationEnd: "", startsAt: "", endsAt: "", timezone: "Asia/Kolkata",
    country: "India", state: "", city: "", venue: "", googleMapsUrl: "",
    primaryColor: "#4F46E5", secondaryColor: "#7C3AED", fontHeading: "Manrope", fontBody: "Inter",
    isPublic: true, seoTitle: "", seoDescription: "", subdomain: "",
    rentalPlanId: "",
  });

  useEffect(() => {
    supabase.from("sports").select("id, name").eq("status", "active").order("sort_order").then(({ data }) => setSports(data ?? []));
    supabase.from("rental_plans").select("id, name, duration").eq("is_active", true).order("sort_order").then(({ data }) => setPlans(data ?? []));
  }, []);

  const update = <K extends keyof CreateTournamentPayload>(key: K, value: CreateTournamentPayload[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleNameChange = (name: string) => {
    update("name", name);
    if (!form.slug || form.slug === slugify(form.name)) {
      const slug = slugify(name);
      update("slug", slug);
      update("subdomain", slug);
    }
  };

  const next = async () => {
    setError(null);
    if (step === 1) {
      if (!form.name.trim() || !form.sport) {
        setError("Tournament name and sport are required.");
        return;
      }
      const slugOk = await checkSlugAvailable(form.slug);
      if (!slugOk) {
        setError("This slug is already taken — try a different name or edit the slug.");
        return;
      }
    }
    if (step === 6 && form.subdomain) {
      const subOk = await checkSubdomainAvailable(form.subdomain);
      if (!subOk) {
        setError("This subdomain is already taken.");
        return;
      }
    }
    setStep((s) => Math.min(STEPS.length, s + 1));
  };
  const back = () => setStep((s) => Math.max(1, s - 1));

  const handlePublish = async () => {
    setIsSaving(true);
    setError(null);
    try {
      const tournament = await createTournament(form);
      navigate(`/dashboard/tournaments/${tournament.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create tournament");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-8 p-6">
      <title>Create Tournament · TournamentLive</title>
      <div>
        <h1 className="font-heading text-xl font-bold text-[var(--color-heading)]">Create a tournament</h1>
        <p className="text-sm text-[var(--color-muted)]">Set everything up in a few steps — you can edit any of this later.</p>
      </div>

      <WizardStepper steps={STEPS} currentStep={step} />

      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-[var(--color-danger)] dark:bg-red-900/20">{error}</p>}

      <div className="rounded-card border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
        {step === 1 && (
          <div className="space-y-4">
            <TextField label="Tournament name" value={form.name} onChange={handleNameChange} />
            <TextField label="Slug" value={form.slug} onChange={(v) => update("slug", slugify(v))} />
            <SelectField label="Sport" value={form.sport} onChange={(v) => update("sport", v)} options={[{ value: "", label: "Select a sport" }, ...sports.map((s) => ({ value: s.name, label: s.name }))]} />
            <TextField label="Season (e.g. 2026)" value={form.season} onChange={(v) => update("season", v)} />
            <TextAreaField label="Description" value={form.description} onChange={(v) => update("description", v)} />
            <div className="grid grid-cols-2 gap-3">
              <TextField label="Logo URL" value={form.logoUrl} onChange={(v) => update("logoUrl", v)} />
              <TextField label="Banner URL" value={form.bannerUrl} onChange={(v) => update("bannerUrl", v)} />
            </div>
            <p className="text-xs text-[var(--color-muted)]">Upload fields connect to Supabase Storage the same way your profile avatar does — paste a URL for now, or use the Media Library once uploaded.</p>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <p className="text-sm text-[var(--color-muted)]">Choose how teams progress through the tournament.</p>
            <div className="grid grid-cols-2 gap-3">
              {FORMATS.map((f) => (
                <button
                  key={f.value}
                  onClick={() => update("format", f.value as CreateTournamentPayload["format"])}
                  className={`rounded-lg border p-4 text-left text-sm font-medium transition ${
                    form.format === f.value ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5 text-[var(--color-primary)]" : "border-[var(--color-border)] text-[var(--color-text)]"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <TextField label="Registration start" type="date" value={form.registrationStart} onChange={(v) => update("registrationStart", v)} />
              <TextField label="Registration end" type="date" value={form.registrationEnd} onChange={(v) => update("registrationEnd", v)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <TextField label="Tournament start" type="date" value={form.startsAt} onChange={(v) => update("startsAt", v)} />
              <TextField label="Tournament end" type="date" value={form.endsAt} onChange={(v) => update("endsAt", v)} />
            </div>
            <TextField label="Timezone" value={form.timezone} onChange={(v) => update("timezone", v)} />
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <TextField label="Country" value={form.country} onChange={(v) => update("country", v)} />
              <TextField label="State" value={form.state} onChange={(v) => update("state", v)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <TextField label="City" value={form.city} onChange={(v) => update("city", v)} />
              <TextField label="Venue" value={form.venue} onChange={(v) => update("venue", v)} />
            </div>
            <TextField label="Google Maps link" value={form.googleMapsUrl} onChange={(v) => update("googleMapsUrl", v)} />
          </div>
        )}

        {step === 5 && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[var(--color-text)]">Primary color</label>
                <input type="color" value={form.primaryColor} onChange={(e) => update("primaryColor", e.target.value)} className="h-10 w-full rounded-lg border border-[var(--color-border)]" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[var(--color-text)]">Secondary color</label>
                <input type="color" value={form.secondaryColor} onChange={(e) => update("secondaryColor", e.target.value)} className="h-10 w-full rounded-lg border border-[var(--color-border)]" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <TextField label="Heading font" value={form.fontHeading} onChange={(v) => update("fontHeading", v)} />
              <TextField label="Body font" value={form.fontBody} onChange={(v) => update("fontBody", v)} />
            </div>
            <div
              className="rounded-lg border border-[var(--color-border)] p-5 text-center"
              style={{ background: `linear-gradient(135deg, ${form.primaryColor}22, ${form.secondaryColor}22)` }}
            >
              <p style={{ fontFamily: form.fontHeading, color: form.primaryColor }} className="text-lg font-semibold">
                {form.name || "Your Tournament Name"}
              </p>
              <p style={{ fontFamily: form.fontBody }} className="text-xs text-[var(--color-muted)]">Live preview of your theme</p>
            </div>
          </div>
        )}

        {step === 6 && (
          <div className="space-y-4">
            <CheckboxField label="Enable public website" checked={form.isPublic} onChange={(v) => update("isPublic", v)} />
            <TextField label="SEO title" value={form.seoTitle} onChange={(v) => update("seoTitle", v)} />
            <TextAreaField label="SEO description" value={form.seoDescription} onChange={(v) => update("seoDescription", v)} />
            <TextField label="Subdomain" value={form.subdomain} onChange={(v) => update("subdomain", slugify(v))} />
            <p className="text-xs text-[var(--color-muted)]">
              Your site will be live at <strong>{form.subdomain || "your-slug"}.tournamentlive.app</strong>. Custom
              domains can be connected after publishing from Custom Domain in the sidebar.
            </p>
            <SelectField
              label="Rental plan"
              value={form.rentalPlanId}
              onChange={(v) => update("rentalPlanId", v)}
              options={[{ value: "", label: "Select a plan" }, ...plans.map((p) => ({ value: p.id, label: `${p.name} (${p.duration.replace("_", " ")})` }))]}
            />
          </div>
        )}

        {step === 7 && (
          <div className="space-y-3 text-sm">
            <ReviewRow label="Name" value={form.name} />
            <ReviewRow label="Sport" value={form.sport} />
            <ReviewRow label="Format" value={FORMATS.find((f) => f.value === form.format)?.label ?? ""} />
            <ReviewRow label="Dates" value={`${form.startsAt || "—"} → ${form.endsAt || "—"}`} />
            <ReviewRow label="Location" value={[form.venue, form.city, form.state, form.country].filter(Boolean).join(", ")} />
            <ReviewRow label="Public website" value={form.isPublic ? "Yes" : "No"} />
            <ReviewRow label="Subdomain" value={form.subdomain ? `${form.subdomain}.tournamentlive.app` : "—"} />
            <p className="pt-2 text-xs text-[var(--color-muted)]">
              Your tournament is created as a draft. Publish it from My Tournaments once you've added teams and fixtures.
            </p>
          </div>
        )}
      </div>

      <div className="flex justify-between">
        <button onClick={back} disabled={step === 1} className="rounded-lg border border-[var(--color-border)] px-4 py-2.5 text-sm font-medium disabled:opacity-40">
          Back
        </button>
        {step < STEPS.length ? (
          <button onClick={next} className="rounded-lg bg-[var(--color-primary)] px-5 py-2.5 text-sm font-medium text-white hover:bg-[var(--color-primary-hover)]">
            Continue
          </button>
        ) : (
          <button
            onClick={handlePublish}
            disabled={isSaving}
            className="flex items-center gap-2 rounded-lg bg-[var(--color-primary)] px-5 py-2.5 text-sm font-medium text-white hover:bg-[var(--color-primary-hover)] disabled:opacity-60"
          >
            {isSaving && <ButtonSpinner />}
            Create tournament
          </button>
        )}
      </div>
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b border-[var(--color-border)] py-2">
      <span className="text-[var(--color-muted)]">{label}</span>
      <span className="font-medium text-[var(--color-heading)]">{value || "—"}</span>
    </div>
  );
}
