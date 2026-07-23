import { useEffect, useState } from "react";
import { Reorder, useDragControls } from "framer-motion";
import { GripVertical, Eye, EyeOff, RotateCcw, Copy } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import { useAuth } from "../../contexts/AuthContext";
import { TournamentSelector } from "../../features/organizer/components/TournamentSelector";
import { useOrganizerTournaments } from "../../features/organizer/hooks/useOrganizerTournaments";
import { TextField, TextAreaField, CheckboxField, SelectField } from "../../features/admin/components/FormField";
import { PageLoader, ButtonSpinner } from "../../components/ui/LoadingSpinner";
import { SuccessBanner } from "../../components/ui/ErrorState";
import { EmptyState } from "../../features/admin/components/EmptyState";
import { Globe } from "lucide-react";

const BASE_TEMPLATES = [
  { name: "Classic", primary: "#4F46E5", secondary: "#7C3AED", accent: "#06B6D4", layout: "classic" },
  { name: "Modern", primary: "#0EA5E9", secondary: "#6366F1", accent: "#22D3EE", layout: "modern" },
  { name: "Sports", primary: "#16A34A", secondary: "#F59E0B", accent: "#06B6D4", layout: "modern" },
  { name: "Minimal", primary: "#111827", secondary: "#6B7280", accent: "#9CA3AF", layout: "minimal" },
  { name: "Dark", primary: "#8B5CF6", secondary: "#6366F1", accent: "#22D3EE", layout: "modern" },
  { name: "Light", primary: "#4F46E5", secondary: "#7C3AED", accent: "#06B6D4", layout: "classic" },
  { name: "Professional", primary: "#1E3A8A", secondary: "#334155", accent: "#0EA5E9", layout: "classic" },
  { name: "Football", primary: "#15803D", secondary: "#FACC15", accent: "#06B6D4", layout: "modern" },
  { name: "Cricket", primary: "#1D4ED8", secondary: "#DC2626", accent: "#F59E0B", layout: "modern" },
  { name: "Esports", primary: "#7C3AED", secondary: "#EC4899", accent: "#22D3EE", layout: "modern" },
];

const SECTION_LABELS: Record<string, string> = {
  hero: "Hero Banner", quick_stats: "Quick Statistics", live_matches: "Live Matches", upcoming_matches: "Upcoming Matches",
  latest_results: "Latest Results", featured_teams: "Featured Teams", featured_players: "Featured Players",
  sponsors: "Sponsors", news: "Latest News", gallery: "Gallery Preview",
};

const DEFAULT_SECTIONS = Object.keys(SECTION_LABELS).map((key) => ({ key, visible: true }));

interface HomepageSection { key: string; visible: boolean }
interface CustomTheme { id: string; name: string; primary_color: string; secondary_color: string; accent_color: string; layout_variant: string; is_base_template: boolean }

export default function WebsiteSettingsPage() {
  const { profile } = useAuth();
  const { tournaments, selectedId, setSelectedId, isLoading: tournamentsLoading } = useOrganizerTournaments();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [tab, setTab] = useState<"branding" | "sections" | "themes" | "seo">("branding");

  const [theme, setTheme] = useState({ primary_color: "#4F46E5", secondary_color: "#7C3AED", accent_color: "#06B6D4", font_heading: "Manrope", font_body: "Inter", dark_mode_enabled: true, layout_variant: "classic" });
  const [site, setSite] = useState({ site_title: "", tagline: "", show_sponsors: true, show_gallery: true, show_news: true, show_live_stream: false, footer_text: "" });
  const [seo, setSeo] = useState({ meta_title: "", meta_description: "" });
  const [sections, setSections] = useState<HomepageSection[]>(DEFAULT_SECTIONS);
  const [customThemes, setCustomThemes] = useState<CustomTheme[]>([]);
  const [newThemeName, setNewThemeName] = useState("");

  useEffect(() => {
    if (!selectedId) return;
    setIsLoading(true);
    Promise.all([
      supabase.from("website_themes").select("*").eq("tournament_id", selectedId).single(),
      supabase.from("site_settings").select("*").eq("tournament_id", selectedId).single(),
      supabase.from("seo_settings").select("*").eq("tournament_id", selectedId).single(),
    ]).then(([themeRes, siteRes, seoRes]) => {
      if (themeRes.data) setTheme(themeRes.data);
      if (siteRes.data) {
        setSite(siteRes.data);
        setSections(siteRes.data.homepage_sections?.length ? siteRes.data.homepage_sections : DEFAULT_SECTIONS);
      }
      if (seoRes.data) setSeo(seoRes.data);
      setIsLoading(false);
    });
  }, [selectedId]);

  useEffect(() => {
    if (!profile) return;
    supabase.from("custom_themes").select("*").or(`organizer_id.eq.${profile.id},is_base_template.eq.true`).then(({ data }) => setCustomThemes((data ?? []) as CustomTheme[]));
  }, [profile]);

  const save = async () => {
    setIsSaving(true);
    setSaved(false);
    await Promise.all([
      supabase.from("website_themes").update(theme).eq("tournament_id", selectedId),
      supabase.from("site_settings").update({ ...site, homepage_sections: sections }).eq("tournament_id", selectedId),
      supabase.from("seo_settings").update(seo).eq("tournament_id", selectedId),
    ]);
    setIsSaving(false);
    setSaved(true);
  };

  const applyTemplate = (t: { primary: string; secondary: string; accent: string; layout: string }) => {
    setTheme((prev) => ({ ...prev, primary_color: t.primary, secondary_color: t.secondary, accent_color: t.accent, layout_variant: t.layout }));
  };

  const applyCustomTheme = (t: CustomTheme) => {
    setTheme((prev) => ({ ...prev, primary_color: t.primary_color, secondary_color: t.secondary_color, accent_color: t.accent_color, layout_variant: t.layout_variant }));
  };

  const saveAsCustomTheme = async () => {
    if (!profile || !newThemeName.trim()) return;
    const { data } = await supabase.from("custom_themes").insert({
      organizer_id: profile.id, name: newThemeName.trim(), primary_color: theme.primary_color, secondary_color: theme.secondary_color,
      accent_color: theme.accent_color, font_heading: theme.font_heading, font_body: theme.font_body, layout_variant: theme.layout_variant,
      dark_mode_enabled: theme.dark_mode_enabled,
    }).select().single();
    if (data) setCustomThemes((prev) => [...prev, data as CustomTheme]);
    setNewThemeName("");
  };

  const resetTheme = () => applyTemplate(BASE_TEMPLATES[0]);

  const toggleSection = (key: string) => setSections((prev) => prev.map((s) => (s.key === key ? { ...s, visible: !s.visible } : s)));

  if (tournamentsLoading) return null;
  if (tournaments.length === 0) return <EmptyState icon={Globe} title="Create a tournament first" />;

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <title>Website Builder · TournamentLive</title>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-xl font-bold text-[var(--color-heading)]">Website Builder</h1>
          <p className="text-sm text-[var(--color-muted)]">No-code customization for your tournament's public site.</p>
        </div>
        <TournamentSelector tournaments={tournaments} selectedId={selectedId} onChange={setSelectedId} />
      </div>

      <div className="flex gap-1 border-b border-[var(--color-border)]">
        {(["branding", "sections", "themes", "seo"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`border-b-2 px-3 py-2 text-sm font-medium capitalize ${tab === t ? "border-[var(--color-primary)] text-[var(--color-primary)]" : "border-transparent text-[var(--color-muted)]"}`}>
            {t === "sections" ? "Homepage Sections" : t}
          </button>
        ))}
      </div>

      {isLoading ? (
        <PageLoader label="Loading website settings..." />
      ) : (
        <>
          {saved && <SuccessBanner message="Website settings saved." />}

          {tab === "branding" && (
            <section className="space-y-4 rounded-card border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
              <div className="flex items-center justify-between">
                <h2 className="font-heading text-sm font-semibold text-[var(--color-heading)]">Branding</h2>
                <button onClick={resetTheme} className="flex items-center gap-1.5 text-xs font-medium text-[var(--color-muted)] hover:text-[var(--color-danger)]">
                  <RotateCcw size={13} /> Reset theme
                </button>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[var(--color-text)]">Primary</label>
                  <input type="color" value={theme.primary_color} onChange={(e) => setTheme((t) => ({ ...t, primary_color: e.target.value }))} className="h-10 w-full rounded-lg border border-[var(--color-border)]" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[var(--color-text)]">Secondary</label>
                  <input type="color" value={theme.secondary_color} onChange={(e) => setTheme((t) => ({ ...t, secondary_color: e.target.value }))} className="h-10 w-full rounded-lg border border-[var(--color-border)]" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[var(--color-text)]">Accent</label>
                  <input type="color" value={theme.accent_color} onChange={(e) => setTheme((t) => ({ ...t, accent_color: e.target.value }))} className="h-10 w-full rounded-lg border border-[var(--color-border)]" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <TextField label="Heading font" value={theme.font_heading} onChange={(v) => setTheme((t) => ({ ...t, font_heading: v }))} />
                <TextField label="Body font" value={theme.font_body} onChange={(v) => setTheme((t) => ({ ...t, font_body: v }))} />
              </div>
              <SelectField label="Layout" value={theme.layout_variant} onChange={(v) => setTheme((t) => ({ ...t, layout_variant: v }))} options={[{ value: "classic", label: "Classic" }, { value: "modern", label: "Modern" }, { value: "minimal", label: "Minimal" }]} />
              <CheckboxField label="Enable dark mode toggle on public site" checked={theme.dark_mode_enabled} onChange={(v) => setTheme((t) => ({ ...t, dark_mode_enabled: v }))} />
              <TextField label="Site title" value={site.site_title ?? ""} onChange={(v) => setSite((s) => ({ ...s, site_title: v }))} />
              <TextField label="Tagline" value={site.tagline ?? ""} onChange={(v) => setSite((s) => ({ ...s, tagline: v }))} />
              <TextAreaField label="Footer text" value={site.footer_text ?? ""} onChange={(v) => setSite((s) => ({ ...s, footer_text: v }))} />

              <div
                className="mt-2 rounded-lg border border-[var(--color-border)] p-5 text-center"
                style={{ background: `linear-gradient(135deg, ${theme.primary_color}22, ${theme.secondary_color}22)` }}
              >
                <p style={{ fontFamily: theme.font_heading, color: theme.primary_color }} className="text-lg font-semibold">{site.site_title || "Your Tournament"}</p>
                <p style={{ fontFamily: theme.font_body }} className="text-xs text-[var(--color-muted)]">Live preview</p>
              </div>
            </section>
          )}

          {tab === "sections" && (
            <section className="space-y-3 rounded-card border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
              <h2 className="font-heading text-sm font-semibold text-[var(--color-heading)]">Homepage sections</h2>
              <p className="text-xs text-[var(--color-muted)]">Drag to reorder. Toggle to show or hide on the public homepage.</p>
              <Reorder.Group axis="y" values={sections} onReorder={setSections} className="space-y-2">
                {sections.map((section) => (
                  <SectionRow key={section.key} section={section} onToggle={() => toggleSection(section.key)} />
                ))}
              </Reorder.Group>
              <div className="grid grid-cols-2 gap-2 pt-2">
                <CheckboxField label="Show sponsors sitewide" checked={site.show_sponsors} onChange={(v) => setSite((s) => ({ ...s, show_sponsors: v }))} />
                <CheckboxField label="Show gallery sitewide" checked={site.show_gallery} onChange={(v) => setSite((s) => ({ ...s, show_gallery: v }))} />
                <CheckboxField label="Show news sitewide" checked={site.show_news} onChange={(v) => setSite((s) => ({ ...s, show_news: v }))} />
                <CheckboxField label="Show live stream sitewide" checked={site.show_live_stream} onChange={(v) => setSite((s) => ({ ...s, show_live_stream: v }))} />
              </div>
            </section>
          )}

          {tab === "themes" && (
            <section className="space-y-6">
              <div className="rounded-card border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
                <h2 className="mb-3 font-heading text-sm font-semibold text-[var(--color-heading)]">Professional templates</h2>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                  {BASE_TEMPLATES.map((t) => (
                    <button key={t.name} onClick={() => applyTemplate(t)} className="rounded-lg border border-[var(--color-border)] p-2.5 text-center text-xs font-medium hover:border-[var(--color-primary)]">
                      <span className="mx-auto mb-1.5 flex h-7 w-7 rounded-full" style={{ background: `linear-gradient(135deg, ${t.primary}, ${t.secondary})` }} />
                      {t.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-card border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
                <h2 className="mb-3 font-heading text-sm font-semibold text-[var(--color-heading)]">Your saved themes</h2>
                {customThemes.filter((t) => !t.is_base_template).length === 0 ? (
                  <p className="text-sm text-[var(--color-muted)]">No custom themes saved yet.</p>
                ) : (
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {customThemes.filter((t) => !t.is_base_template).map((t) => (
                      <button key={t.id} onClick={() => applyCustomTheme(t)} className="rounded-lg border border-[var(--color-border)] p-2.5 text-center text-xs font-medium hover:border-[var(--color-primary)]">
                        <span className="mx-auto mb-1.5 flex h-7 w-7 rounded-full" style={{ background: `linear-gradient(135deg, ${t.primary_color}, ${t.secondary_color})` }} />
                        {t.name}
                      </button>
                    ))}
                  </div>
                )}
                <div className="mt-4 flex gap-2">
                  <input value={newThemeName} onChange={(e) => setNewThemeName(e.target.value)} placeholder="Name this theme..." className="flex-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)]" />
                  <button onClick={saveAsCustomTheme} disabled={!newThemeName.trim()} className="flex items-center gap-1.5 rounded-lg bg-[var(--color-primary)] px-3 py-2 text-sm font-medium text-white hover:bg-[var(--color-primary-hover)] disabled:opacity-50">
                    <Copy size={14} /> Save current as theme
                  </button>
                </div>
              </div>
            </section>
          )}

          {tab === "seo" && (
            <section className="space-y-4 rounded-card border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
              <h2 className="font-heading text-sm font-semibold text-[var(--color-heading)]">SEO</h2>
              <TextField label="Meta title" value={seo.meta_title ?? ""} onChange={(v) => setSeo((s) => ({ ...s, meta_title: v }))} />
              <TextAreaField label="Meta description" value={seo.meta_description ?? ""} onChange={(v) => setSeo((s) => ({ ...s, meta_description: v }))} />
              <p className="text-xs text-[var(--color-muted)]">
                Open Graph and Twitter Card tags render automatically from these fields via the site's Seo
                component. Per-tournament sitemap.xml/robots.txt need a serverless route to serve correct
                content-type headers — this SPA can't generate those as static files per tenant, flagged as a
                follow-up rather than faked.
              </p>
            </section>
          )}

          <button onClick={save} disabled={isSaving} className="flex items-center gap-2 rounded-lg bg-[var(--color-primary)] px-5 py-2.5 text-sm font-medium text-white hover:bg-[var(--color-primary-hover)] disabled:opacity-60">
            {isSaving && <ButtonSpinner />}
            Save website settings
          </button>
        </>
      )}
    </div>
  );
}

function SectionRow({ section, onToggle }: { section: HomepageSection; onToggle: () => void }) {
  const controls = useDragControls();
  return (
    <Reorder.Item value={section} dragListener={false} dragControls={controls} className="flex items-center justify-between rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5">
      <div className="flex items-center gap-2.5">
        <button onPointerDown={(e) => controls.start(e)} className="cursor-grab touch-none text-[var(--color-muted)] active:cursor-grabbing" aria-label="Drag to reorder">
          <GripVertical size={16} />
        </button>
        <span className={`text-sm ${section.visible ? "text-[var(--color-text)]" : "text-[var(--color-muted)] line-through"}`}>{SECTION_LABELS[section.key] ?? section.key}</span>
      </div>
      <button onClick={onToggle} aria-label={section.visible ? "Hide section" : "Show section"} className="text-[var(--color-muted)] hover:text-[var(--color-primary)]">
        {section.visible ? <Eye size={16} /> : <EyeOff size={16} />}
      </button>
    </Reorder.Item>
  );
}
