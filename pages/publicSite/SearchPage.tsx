import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { useSiteContext } from "../../features/publicSite/hooks/useSiteContext";
import { SectionHeading } from "../../features/publicSite/components/FadeInSection";

interface Result { id: string; label: string; category: string; to: string }

export default function SearchPage() {
  const { tournament } = useSiteContext();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setIsLoading(true);
      const like = `%${query}%`;
      const [teams, players, news, sponsors] = await Promise.all([
        supabase.from("teams").select("id, name").eq("tournament_id", tournament.id).ilike("name", like).limit(5),
        supabase.from("players").select("id, full_name, teams!inner(tournament_id)").eq("teams.tournament_id", tournament.id).ilike("full_name", like).limit(5),
        supabase.from("news").select("id, title, slug").eq("tournament_id", tournament.id).eq("is_published", true).ilike("title", like).limit(5),
        supabase.from("sponsors").select("id, name").eq("tournament_id", tournament.id).ilike("name", like).limit(5),
      ]);
      setResults([
        ...(teams.data ?? []).map((t) => ({ id: t.id, label: t.name, category: "Team", to: `/tournament/${tournament.slug}/teams/${t.id}` })),
        ...(players.data ?? []).map((p) => ({ id: p.id, label: p.full_name, category: "Player", to: `/tournament/${tournament.slug}/players/${p.id}` })),
        ...(news.data ?? []).map((n) => ({ id: n.id, label: n.title, category: "News", to: `/tournament/${tournament.slug}/news/${n.slug}` })),
        ...(sponsors.data ?? []).map((s) => ({ id: s.id, label: s.name, category: "Sponsor", to: `/tournament/${tournament.slug}/sponsors` })),
      ]);
      setIsLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [query, tournament.id, tournament.slug]);

  return (
    <div className="mx-auto max-w-xl space-y-5">
      <SectionHeading title="Search" subtitle={`Search across ${tournament.name}`} />
      <input
        autoFocus
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search teams, players, news, sponsors..."
        className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm outline-none focus:border-[var(--color-primary)]"
      />
      {isLoading && <p className="text-sm text-[var(--color-muted)]">Searching...</p>}
      {!isLoading && query.trim().length >= 2 && results.length === 0 && <p className="text-sm text-[var(--color-muted)]">No results for "{query}"</p>}
      <div className="space-y-2">
        {results.map((r) => (
          <Link key={`${r.category}-${r.id}`} to={r.to} className="flex items-center justify-between rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm hover:bg-[var(--color-surface-secondary)]">
            <span className="text-[var(--color-text)]">{r.label}</span>
            <span className="text-xs text-[var(--color-muted)]">{r.category}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
