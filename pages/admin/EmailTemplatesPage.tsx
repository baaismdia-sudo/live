import { useEffect, useState } from "react";
import { Mail } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import { PageLoader } from "../../components/ui/LoadingSpinner";
import { Drawer } from "../../features/admin/components/Drawer";
import { TextField, TextAreaField } from "../../features/admin/components/FormField";
import { ButtonSpinner } from "../../components/ui/LoadingSpinner";
import { SuccessBanner } from "../../components/ui/ErrorState";

interface EmailTemplate {
  id: string;
  key: string;
  subject: string;
  html_body: string;
  variables: string[];
}

export default function EmailTemplatesPage() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editing, setEditing] = useState<EmailTemplate | null>(null);
  const [subject, setSubject] = useState("");
  const [htmlBody, setHtmlBody] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    supabase
      .from("email_templates")
      .select("*")
      .order("key")
      .then(({ data }) => {
        setTemplates((data ?? []) as EmailTemplate[]);
        setIsLoading(false);
      });
  }, []);

  const openEdit = (t: EmailTemplate) => {
    setEditing(t);
    setSubject(t.subject);
    setHtmlBody(t.html_body);
    setSaved(false);
  };

  const save = async () => {
    if (!editing) return;
    setIsSaving(true);
    await supabase.from("email_templates").update({ subject, html_body: htmlBody }).eq("id", editing.id);
    setTemplates((prev) => prev.map((t) => (t.id === editing.id ? { ...t, subject, html_body: htmlBody } : t)));
    setIsSaving(false);
    setSaved(true);
  };

  if (isLoading) return <PageLoader label="Loading templates..." />;

  return (
    <div className="space-y-5 p-6">
      <title>Email Templates · TournamentLive Admin</title>
      <div>
        <h1 className="font-heading text-xl font-bold text-[var(--color-heading)]">Email Templates</h1>
        <p className="text-sm text-[var(--color-muted)]">Transactional emails sent to users and organizers.</p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {templates.map((t) => (
          <button
            key={t.id}
            onClick={() => openEdit(t)}
            className="rounded-card border border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-left transition-shadow hover:shadow-[var(--shadow-md)]"
          >
            <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
              <Mail size={16} />
            </div>
            <p className="font-medium text-[var(--color-heading)]">{t.subject}</p>
            <code className="text-[11px] text-[var(--color-muted)]">{t.key}</code>
          </button>
        ))}
      </div>

      <Drawer open={Boolean(editing)} onClose={() => setEditing(null)} title={editing?.key ?? ""}>
        {editing && (
          <div className="space-y-4">
            {saved && <SuccessBanner message="Template saved." />}
            <TextField label="Subject" value={subject} onChange={setSubject} />
            <TextAreaField label="HTML body" value={htmlBody} onChange={setHtmlBody} rows={10} />
            <div className="flex flex-wrap gap-1.5">
              {editing.variables.map((v) => (
                <code key={v} className="rounded bg-[var(--color-surface-secondary)] px-1.5 py-0.5 text-[11px] text-[var(--color-muted)]">
                  {`{{${v}}}`}
                </code>
              ))}
            </div>
            <button
              onClick={save}
              disabled={isSaving}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--color-primary)] px-4 py-2.5 text-sm font-medium text-white hover:bg-[var(--color-primary-hover)] disabled:opacity-60"
            >
              {isSaving && <ButtonSpinner />}
              Save template
            </button>
          </div>
        )}
      </Drawer>
    </div>
  );
}
