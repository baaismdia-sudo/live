import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useAuth } from "../../contexts/AuthContext";
import { TextField, SelectField } from "../../features/admin/components/FormField";
import { PageLoader, ButtonSpinner } from "../../components/ui/LoadingSpinner";
import { SuccessBanner } from "../../components/ui/ErrorState";

export default function OrganizerSettingsPage() {
  const { profile } = useAuth();
  const [orgName, setOrgName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [address, setAddress] = useState("");
  const [language, setLanguage] = useState("English");
  const [timezone, setTimezone] = useState("Asia/Kolkata");
  const [currency, setCurrency] = useState("INR");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!profile) return;
    setOrgName(profile.full_name);
    setContactEmail(profile.email);
    setContactPhone(profile.phone ?? "");
    setIsLoading(false);
  }, [profile]);

  const save = async () => {
    if (!profile) return;
    setIsSaving(true);
    setSaved(false);
    await supabase.from("profiles").update({ full_name: orgName, phone: contactPhone }).eq("id", profile.id);
    await supabase.auth.updateUser({ data: { address, language, timezone, currency } });
    setIsSaving(false);
    setSaved(true);
  };

  if (isLoading) return <PageLoader label="Loading settings..." />;

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <title>Settings · TournamentLive</title>
      <div>
        <h1 className="font-heading text-xl font-bold text-[var(--color-heading)]">Organization Settings</h1>
        <p className="text-sm text-[var(--color-muted)]">General information about your organization.</p>
      </div>

      {saved && <SuccessBanner message="Settings saved." />}

      <div className="space-y-4 rounded-card border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
        <TextField label="Organization name" value={orgName} onChange={setOrgName} />
        <TextField label="Contact email" value={contactEmail} onChange={setContactEmail} />
        <TextField label="Contact phone" value={contactPhone} onChange={setContactPhone} />
        <TextField label="Address" value={address} onChange={setAddress} />
        <div className="grid grid-cols-3 gap-3">
          <SelectField label="Language" value={language} onChange={setLanguage} options={[{ value: "English", label: "English" }, { value: "Malayalam", label: "Malayalam" }, { value: "Hindi", label: "Hindi" }]} />
          <TextField label="Timezone" value={timezone} onChange={setTimezone} />
          <SelectField label="Currency" value={currency} onChange={setCurrency} options={[{ value: "INR", label: "INR" }, { value: "USD", label: "USD" }]} />
        </div>
        <button onClick={save} disabled={isSaving} className="flex items-center gap-2 rounded-lg bg-[var(--color-primary)] px-4 py-2.5 text-sm font-medium text-white hover:bg-[var(--color-primary-hover)] disabled:opacity-60">
          {isSaving && <ButtonSpinner />}
          Save
        </button>
      </div>

      <p className="text-sm text-[var(--color-muted)]">
        Password, notification preferences, and privacy settings live under{" "}
        <a href="/account/settings" className="text-[var(--color-primary)] hover:underline">Account Settings</a> — shared across every role rather than duplicated here.
      </p>
    </div>
  );
}
