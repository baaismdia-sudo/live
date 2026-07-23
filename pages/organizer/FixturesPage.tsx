import { useEffect, useState } from "react";
import { Shuffle } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import { AdminDataTable, type Column } from "../../features/admin/components/AdminDataTable";
import { Drawer } from "../../features/admin/components/Drawer";
import { TextField } from "../../features/admin/components/FormField";
import { TournamentSelector } from "../../features/organizer/components/TournamentSelector";
import { useOrganizerTournaments } from "../../features/organizer/hooks/useOrganizerTournaments";
import { ButtonSpinner } from "../../components/ui/LoadingSpinner";
import { EmptyState } from "../../features/admin/components/EmptyState";
import { CalendarDays } from "lucide-react";

interface Fixture {
  id: string;
  round_name: string;
  scheduled_at: string | null;
  venue: string | null;
}
interface TeamOption { id: string; name: string }

const emptyForm = { round_name: "", scheduled_at: "", venue: "" };

export default function FixturesPage() {
  const { tournaments, selectedId, setSelectedId, isLoading: tournamentsLoading } = useOrganizerTournaments();
  const [teams, setTeams] = useState<TeamOption[]>([]);
  const [rows, setRows] = useState<Fixture[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (!selectedId) return;
    supabase.from("teams").select("id, name").eq("tournament_id", selectedId).is("deleted_at", null).then(({ data }) => setTeams(data ?? []));
  }, [selectedId]);

  const load = async () => {
    if (!selectedId) return;
    setIsLoading(true);
    const { data, error: fetchError } = await supabase.from("fixtures").select("*").eq("tournament_id", selectedId).order("scheduled_at");
    if (fetchError) setError(fetchError.message);
    else setRows((data ?? []) as Fixture[]);
    setIsLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await supabase.from("fixtures").insert({
        tournament_id: selectedId,
        round_name: form.round_name,
        scheduled_at: form.scheduled_at || null,
        venue: form.venue || null,
      });
      setDrawerOpen(false);
      setForm(emptyForm);
      load();
    } finally {
      setIsSaving(false);
    }
  };

  const remove = async (f: Fixture) => {
    await supabase.from("fixtures").delete().eq("id", f.id);
    load();
  };

  /**
   * Round-robin generator: each team plays every other team once, using the
   * standard circle method. Knockout brackets, group-stage seeding, and
   * double-elimination trees need a proper bracket engine and are scoped
   * into Prompt 7 (Fixtures & Match Engine) per the project's own roadmap,
   * rather than bolted on here as a half-depth version.
   */
  const generateRoundRobin = async () => {
    if (teams.length < 2) return;
    setIsGenerating(true);
    try {
      const ids = [...teams.map((t) => t.id)];
      if (ids.length % 2 !== 0) ids.push("__bye__");
      const rounds = ids.length - 1;
      const half = ids.length / 2;
      const fixtureInserts: { tournament_id: string; round_name: string }[] = [];
      const matchPairs: { round: number; home: string; away: string }[] = [];

      let arr = [...ids];
      for (let r = 0; r < rounds; r++) {
        for (let i = 0; i < half; i++) {
          const home = arr[i];
          const away = arr[arr.length - 1 - i];
          if (home !== "__bye__" && away !== "__bye__") {
            matchPairs.push({ round: r + 1, home, away });
          }
        }
        arr = [arr[0], ...arr.slice(-1), ...arr.slice(1, -1)];
      }

      for (let r = 1; r <= rounds; r++) {
        fixtureInserts.push({ tournament_id: selectedId, round_name: `Round ${r}` });
      }
      const { data: createdFixtures, error: fixtureError } = await supabase.from("fixtures").insert(fixtureInserts).select();
      if (fixtureError) throw fixtureError;

      const fixtureByRound = new Map(createdFixtures!.map((f, i) => [i + 1, f.id]));
      const matchInserts = matchPairs.map((mp) => ({
        tournament_id: selectedId,
        fixture_id: fixtureByRound.get(mp.round),
        home_team_id: mp.home,
        away_team_id: mp.away,
        status: "scheduled",
      }));
      await supabase.from("matches").insert(matchInserts);
      load();
    } finally {
      setIsGenerating(false);
    }
  };

  const columns: Column<Fixture>[] = [
    { header: "Round", render: (f) => <span className="font-medium text-[var(--color-heading)]">{f.round_name}</span> },
    { header: "Scheduled", render: (f) => (f.scheduled_at ? new Date(f.scheduled_at).toLocaleString() : "—") },
    { header: "Venue", render: (f) => f.venue ?? "—" },
  ];

  if (tournamentsLoading) return null;
  if (tournaments.length === 0) return <EmptyState icon={CalendarDays} title="Create a tournament first" />;

  return (
    <>
      <title>Fixtures · TournamentLive</title>
      <div className="flex flex-wrap items-center justify-between gap-3 px-6 pt-6">
        <TournamentSelector tournaments={tournaments} selectedId={selectedId} onChange={setSelectedId} />
        <button
          onClick={generateRoundRobin}
          disabled={isGenerating || teams.length < 2}
          className="flex items-center gap-1.5 rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm font-medium hover:bg-[var(--color-surface-secondary)] disabled:opacity-50"
        >
          {isGenerating ? <ButtonSpinner /> : <Shuffle size={15} />}
          Auto-generate round robin
        </button>
      </div>
      <AdminDataTable
        title="Fixtures"
        description="Rounds for the selected tournament. Matches within each round are managed from Matches."
        columns={columns}
        rows={rows}
        isLoading={isLoading}
        error={error}
        search=""
        onSearchChange={() => {}}
        onCreate={() => setDrawerOpen(true)}
        onDelete={remove}
        page={1}
        totalPages={1}
        onPageChange={() => {}}
        emptyLabel="No fixtures yet — add teams, then generate or create rounds"
      />

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title="New round">
        <form onSubmit={handleSubmit} className="space-y-4">
          <TextField label="Round name" value={form.round_name} onChange={(v) => setForm((f) => ({ ...f, round_name: v }))} />
          <TextField label="Scheduled at" type="datetime-local" value={form.scheduled_at} onChange={(v) => setForm((f) => ({ ...f, scheduled_at: v }))} />
          <TextField label="Venue" value={form.venue} onChange={(v) => setForm((f) => ({ ...f, venue: v }))} />
          <button type="submit" disabled={isSaving} className="flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--color-primary)] px-4 py-2.5 text-sm font-medium text-white hover:bg-[var(--color-primary-hover)] disabled:opacity-60">
            {isSaving && <ButtonSpinner />}
            Add round
          </button>
        </form>
      </Drawer>
    </>
  );
}
