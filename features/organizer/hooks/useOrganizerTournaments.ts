import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";

export interface TournamentOption {
  id: string;
  name: string;
}

export function useOrganizerTournaments() {
  const [tournaments, setTournaments] = useState<TournamentOption[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("tournaments")
      .select("id, name")
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setTournaments(data ?? []);
        if (data && data.length > 0) setSelectedId(data[0].id);
        setIsLoading(false);
      });
  }, []);

  return { tournaments, selectedId, setSelectedId, isLoading };
}
