import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { AdminDataTable, type Column } from "../../features/admin/components/AdminDataTable";
import { Drawer } from "../../features/admin/components/Drawer";
import { TextField, TextAreaField, CheckboxField } from "../../features/admin/components/FormField";
import { TournamentSelector } from "../../features/organizer/components/TournamentSelector";
import { useOrganizerTournaments } from "../../features/organizer/hooks/useOrganizerTournaments";
import { useAuth } from "../../contexts/AuthContext";
import { ButtonSpinner } from "../../components/ui/LoadingSpinner";
import { EmptyState } from "../../features/admin/components/EmptyState";
import { Newspaper } from "lucide-react";

interface NewsArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  is_published: boolean;
  published_at: string | null;
}
const emptyForm = { title: "", slug: "", excerpt: "", content: "", is_published: false };

function slugify(text: string) {
  return text.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export default function NewsPage() {
  const { profile } = useAuth();
  const { tournaments, selectedId, setSelectedId, isLoading: tournamentsLoading } = useOrganizerTournaments();
  const [rows, setRows] = useState<NewsArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<NewsArticle | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const load = async () => {
    if (!selectedId) return;
    setIsLoading(true);
    const { data, error: fetchError } = await supabase.from("news").select("*").eq("tournament_id", selectedId).is("deleted_at", null).order("created_at", { ascending: false });
    if (fetchError) setError(fetchError.message);
    else setRows((data ?? []) as NewsArticle[]);
    setIsLoading(false);
  };

  useEffect(() => { load(); // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setDrawerOpen(true); };
  const openEdit = (n: NewsArticle) => { setEditing(n); setForm({ title: n.title, slug: n.slug, excerpt: n.excerpt ?? "", content: n.content, is_published: n.is_published }); setDrawerOpen(true); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsSaving(true);
    try {
      const values = {
        tournament_id: selectedId,
        author_id: profile?.id,
        title: form.title,
        slug: form.slug || slugify(form.title),
        excerpt: form.excerpt || null,
        content: form.content,
        is_published: form.is_published,
        published_at: form.is_published ? new Date().toISOString() : null,
      };
      if (editing) {
        const { error: updateError } = await supabase.from("news").update(values).eq("id", editing.id);
        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase.from("news").insert(values);
        if (insertError) throw insertError;
      }
      setDrawerOpen(false);
      load();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Could not save article");
    } finally {
      setIsSaving(false);
    }
  };

  const remove = async (n: NewsArticle) => { await supabase.from("news").update({ deleted_at: new Date().toISOString() }).eq("id", n.id); load(); };

  const columns: Column<NewsArticle>[] = [
    { header: "Title", render: (n) => <span className="font-medium text-[var(--color-heading)]">{n.title}</span> },
    { header: "Status", render: (n) => <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${n.is_published ? "bg-[var(--color-success)]/10 text-[var(--color-success)]" : "bg-[var(--color-muted)]/10 text-[var(--color-muted)]"}`}>{n.is_published ? "Published" : "Draft"}</span> },
    { header: "Published", render: (n) => (n.published_at ? new Date(n.published_at).toLocaleDateString() : "—") },
  ];

  if (tournamentsLoading) return null;
  if (tournaments.length === 0) return <EmptyState icon={Newspaper} title="Create a tournament first" />;

  return (
    <>
      <title>News · TournamentLive</title>
      <div className="px-6 pt-6"><TournamentSelector tournaments={tournaments} selectedId={selectedId} onChange={setSelectedId} /></div>
      <AdminDataTable title="News" description="Articles and announcements for your tournament's public site." columns={columns} rows={rows} isLoading={isLoading} error={error} search="" onSearchChange={() => {}} onCreate={openCreate} onEdit={openEdit} onDelete={remove} page={1} totalPages={1} onPageChange={() => {}} emptyLabel="No articles yet" />
      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title={editing ? "Edit article" : "New article"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-[var(--color-danger)] dark:bg-red-900/20">{formError}</p>}
          <TextField label="Title" value={form.title} onChange={(v) => setForm((f) => ({ ...f, title: v }))} />
          <TextField label="Slug" value={form.slug} onChange={(v) => setForm((f) => ({ ...f, slug: v }))} />
          <TextAreaField label="Excerpt" value={form.excerpt} onChange={(v) => setForm((f) => ({ ...f, excerpt: v }))} />
          <TextAreaField label="Content" value={form.content} onChange={(v) => setForm((f) => ({ ...f, content: v }))} rows={8} />
          <CheckboxField label="Published" checked={form.is_published} onChange={(v) => setForm((f) => ({ ...f, is_published: v }))} />
          <button type="submit" disabled={isSaving} className="flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--color-primary)] px-4 py-2.5 text-sm font-medium text-white hover:bg-[var(--color-primary-hover)] disabled:opacity-60">
            {isSaving && <ButtonSpinner />}
            {editing ? "Save changes" : "Create article"}
          </button>
        </form>
      </Drawer>
    </>
  );
}
