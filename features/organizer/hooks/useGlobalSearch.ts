import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";

export interface SearchResult {
  id: string;
  label: string;
  sublabel: string;
  to: string;
  type: "team" | "player" | "match" | "official" | "venue";
}

export function useGlobalSearch(query: string) {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setIsLoading(true);
      const like = `%${query}%`;
      const [teams, players, officials, venues] = await Promise.all([
        supabase.from("teams").select("id, name").ilike("name", like).limit(5),
        supabase.from("players").select("id, full_name, teams(name)").ilike("full_name", like).limit(5),
        supabase.from("officials").select("id, full_name, role").ilike("full_name", like).limit(5),
        supabase.from("venues").select("id, name, city").ilike("name", like).limit(5),
      ]);

      const mapped: SearchResult[] = [
        ...(teams.data ?? []).map((t) => ({ id: t.id, label: t.name, sublabel: "Team", to: "/dashboard/teams", type: "team" as const })),
        ...(players.data ?? []).map((p) => ({
          id: p.id,
          label: p.full_name,
          sublabel: (p.teams as unknown as { name: string } | null)?.name ?? "Player",
          to: `/dashboard/players/${p.id}`,
          type: "player" as const,
        })),
        ...(officials.data ?? []).map((o) => ({ id: o.id, label: o.full_name, sublabel: o.role, to: "/dashboard/officials", type: "official" as const })),
        ...(venues.data ?? []).map((v) => ({ id: v.id, label: v.name, sublabel: v.city ?? "Venue", to: "/dashboard/venues", type: "venue" as const })),
      ];
      setResults(mapped);
      setIsLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  return { results, isLoading };
}
