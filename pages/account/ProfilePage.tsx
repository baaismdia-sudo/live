import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { AvatarUpload } from "../../components/ui/AvatarUpload";
import { RoleBadge, AccountStatusBadge } from "../../components/ui/Badge";
import { ButtonSpinner } from "../../components/ui/LoadingSpinner";
import { SuccessBanner } from "../../components/ui/ErrorState";
import { updateOwnProfile, uploadAvatar, deleteAvatar } from "../../services/supabase/profiles";

const LANGUAGES = ["English", "Malayalam", "Hindi", "Tamil"];
const DATE_FORMATS = ["DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD"];

export default function ProfilePage() {
  const { profile, user, refreshProfile } = useAuth();
  const [fullName, setFullName] = useState(profile?.full_name ?? "");
  const [displayName, setDisplayName] = useState((user?.user_metadata?.display_name as string) ?? "");
  const [phone, setPhone] = useState(profile?.phone ?? "");
  const [bio, setBio] = useState((user?.user_metadata?.bio as string) ?? "");
  const [website, setWebsite] = useState((user?.user_metadata?.website as string) ?? "");
  const [country, setCountry] = useState((user?.user_metadata?.country as string) ?? "");
  const [timezone, setTimezone] = useState((user?.user_metadata?.timezone as string) ?? "Asia/Kolkata");
  const [language, setLanguage] = useState((user?.user_metadata?.language as string) ?? "English");
  const [dateFormat, setDateFormat] = useState((user?.user_metadata?.date_format as string) ?? "DD/MM/YYYY");
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  if (!profile) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaved(false);
    try {
      await updateOwnProfile({ fullName, displayName, phone, bio, website, country, timezone, language, dateFormat });
      await refreshProfile();
      setSaved(true);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-8 p-6">
      <title>Profile · TournamentLive</title>
      <div>
        <h1 className="text-xl font-semibold text-[var(--color-text)]">Your profile</h1>
        <p className="text-sm text-[var(--color-text-muted)]">
          Manage how you appear across TournamentLive.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <RoleBadge role={profile.roles?.name ?? "viewer"} label={profile.roles?.label ?? "Viewer"} />
        <AccountStatusBadge status={profile.status as "active" | "suspended" | "pending"} />
        <span className="text-xs text-[var(--color-text-muted)]">
          Joined {new Date(profile.created_at).toLocaleDateString()}
        </span>
        {profile.last_login_at && (
          <span className="text-xs text-[var(--color-text-muted)]">
            Last login {new Date(profile.last_login_at).toLocaleString()}
          </span>
        )}
      </div>

      <AvatarUpload
        currentUrl={profile.avatar_url}
        fallbackInitial={profile.full_name.charAt(0).toUpperCase()}
        onUpload={async (file) => {
          await uploadAvatar(file);
          await refreshProfile();
        }}
        onDelete={
          profile.avatar_url
            ? async () => {
                await deleteAvatar(profile.avatar_url!);
                await refreshProfile();
              }
            : undefined
        }
      />

      {saved && <SuccessBanner message="Profile updated." />}

      <form onSubmit={handleSave} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Full name" value={fullName} onChange={setFullName} />
          <Field label="Display name" value={displayName} onChange={setDisplayName} />
        </div>
        <Field label="Email" value={profile.email} onChange={() => {}} disabled />
        <Field label="Phone" value={phone} onChange={setPhone} />
        <Field label="Website" value={website} onChange={setWebsite} placeholder="https://" />
        <div>
          <label className="mb-1.5 block text-sm font-medium">Bio</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3.5 py-2.5 text-sm outline-none focus:border-[var(--color-brand)] focus:ring-2 focus:ring-[var(--color-brand)]/20"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Country" value={country} onChange={setCountry} />
          <Field label="Timezone" value={timezone} onChange={setTimezone} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Select label="Language" value={language} onChange={setLanguage} options={LANGUAGES} />
          <Select label="Date format" value={dateFormat} onChange={setDateFormat} options={DATE_FORMATS} />
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="flex items-center gap-2 rounded-lg bg-[var(--color-brand)] px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-60"
        >
          {isSaving && <ButtonSpinner />}
          Save changes
        </button>
      </form>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  disabled,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium">{label}</label>
      <input
        value={value}
        disabled={disabled}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3.5 py-2.5 text-sm outline-none focus:border-[var(--color-brand)] focus:ring-2 focus:ring-[var(--color-brand)]/20 disabled:opacity-60"
      />
    </div>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3.5 py-2.5 text-sm outline-none focus:border-[var(--color-brand)]"
      >
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </div>
  );
}
