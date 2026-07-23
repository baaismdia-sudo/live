import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { AdminDataTable, type Column } from "../../features/admin/components/AdminDataTable";
import { Drawer } from "../../features/admin/components/Drawer";
import { TextField, SelectField } from "../../features/admin/components/FormField";
import { TournamentSelector } from "../../features/organizer/components/TournamentSelector";
import { useOrganizerTournaments } from "../../features/organizer/hooks/useOrganizerTournaments";
import { ExportMenu } from "../../features/shared/components/ExportMenu";
import { QrCodeButton } from "../../features/shared/components/QrCodeButton";
import { ButtonSpinner } from "../../components/ui/LoadingSpinner";
import { EmptyState } from "../../features/admin/components/EmptyState";
import { Swords } from "lucide-react";

interface Match {
  id: string;
  home_team_id: string | null;
  away_team_id: string | null;
  status: string;
  venue: string | null;
  venue_id: string | null;
  scheduled_at: string | null;
  home_score: number;
  away_score: number;
  round: string | null;
  weather: string | null;
  attendance: number | null;
  ticket_link: string | null;
}
interface TeamOption { id: string; name: string }
interface VenueOption { id: string; name: string }
interface OfficialOption { id: string; full_name: string; role: string }

const STATUS_OPTIONS = [
  "scheduled", "warm_up", "live", "half_time", "break", "extra_time", "penalty_shootout",
  "completed", "cancelled", "abandoned", "postponed",
];
const OFFICIAL_ROLES = ["referee", "assistant_referee", "third_official", "commissioner", "scorekeeper", "commentator"];

const emptyForm = { home_team_id: "", away_team_id: "", venue_id: "", venue: "", scheduled_at: "", status: "scheduled", round: "", weather: "", attendance: "", ticket_link: "" };
const PAGE_SIZE = 15;

export default function MatchesPage() {
  const { tournaments, selectedId, setSelectedId, isLoading: tournamentsLoading } = useOrganizerTournaments();
  const [teams, setTeams] = useState<TeamOption[]>([]);
  const [venues, setVenues] = useState<VenueOption[]>([]);
  const [officials, setOfficials] = useState<OfficialOption[]>([]);
  const [assignments, setAssignments] = useState<Record<string, string>>({});
  const [rows, setRows] = useState<Match[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<Match | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedId) return;
    supabase.from("teams").select("id, name").eq("tournament_id", selectedId).is("deleted_at", null).then(({ data }) => setTeams(data ?? []));
    supabase.from("venues").select("id, name").then(({ data }) => setVenues(data ?? []));
    supabase.from("officials").select("id, full_name, role").then(({ data }) => setOfficials(data ?? []));
  }, [selectedId]);

  const load = async () => {
    if (!selectedId) return;
    setIsLoading(true);
    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;
    const { data, error: fetchError, count } = await supabase.from("matches").select("*", { count: "exact" }).eq("tournament_id", selectedId).order("scheduled_at", { ascending: true }).range(from, to);
    if (fetchError) setError(fetchError.message);
    else {
      setRows((data ?? []) as Match[]);
      setTotal(count ?? 0);
    }
    setIsLoading(false);
  };

  useEffect(() => { load(); // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId, page]);

  const teamName = (id: string | null) => teams.find((t) => t.id === id)?.name ?? "TBD";

  const openCreate = () => { setEditing(null); setForm(emptyForm); setAssignments({}); setDrawerOpen(true); };
  const openEdit = async (m: Match) => {
    setEditing(m);
    setForm({
      home_team_id: m.home_team_id ?? "", away_team_id: m.away_team_id ?? "", venue_id: m.venue_id ?? "",
      venue: m.venue ?? "", scheduled_at: m.scheduled_at?.slice(0, 16) ?? "", status: m.status,
      round: m.round ?? "", weather: m.weather ?? "", attendance: m.attendance?.toString() ?? "", ticket_link: m.ticket_link ?? "",
    });
    const { data } = await supabase.from("match_official_assignments").select("official_id, role_in_match").eq("match_id", m.id);
    const map: Record<string, string> = {};
    (data ?? []).forEach((a) => { map[a.role_in_match] = a.official_id; });
    setAssignments(map);
    setDrawerOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.home_team_id === form.away_team_id && form.home_team_id) {
      setFormError("Home and away team must be different.");
      return;
    }
    setFormError(null);
    setIsSaving(true);
    try {
      const values = {
        tournament_id: selectedId,
        home_team_id: form.home_team_id || null,
        away_team_id: form.away_team_id || null,
        venue_id: form.venue_id || null,
        venue: form.venue || venues.find((v) => v.id === form.venue_id)?.name || null,
        scheduled_at: form.scheduled_at || null,
        status: form.status,
        round: form.round || null,
        weather: form.weather || null,
        attendance: form.attendance ? Number(form.attendance) : null,
        ticket_link: form.ticket_link || null,
      };
      let matchId = editing?.id;
      if (editing) {
        const { error: updateError } = await supabase.from("matches").update(values).eq("id", editing.id);
        if (updateError) throw updateError;
      } else {
        const { data: inserted, error: insertError } = await supabase.from("matches").insert(values).select().single();
        if (insertError) throw insertError;
        matchId = inserted.id;
      }

      if (matchId) {
        await supabase.from("match_official_assignments").delete().eq("match_id", matchId);
        const assignmentRows = Object.entries(assignments)
          .filter(([, officialId]) => officialId)
          .map(([role, officialId]) => ({ match_id: matchId, official_id: officialId, role_in_match: role }));
        if (assignmentRows.length > 0) await supabase.from("match_official_assignments").insert(assignmentRows);
      }

      setDrawerOpen(false);
      load();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Could not save match");
    } finally {
      setIsSaving(false);
    }
  };

  const remove = async (m: Match) => { await supabase.from("matches").delete().eq("id", m.id); load(); };

  const statusColor: Record<string, string> = {
    scheduled: "bg-[var(--color-info)]/10 text-[var(--color-info)]",
    warm_up: "bg-[var(--color-info)]/10 text-[var(--color-info)]",
    live: "bg-[var(--color-success)]/10 text-[var(--color-success)]",
    half_time: "bg-[var(--color-warning)]/10 text-[var(--color-warning)]",
    break: "bg-[var(--color-warning)]/10 text-[var(--color-warning)]",
    extra_time: "bg-[var(--color-success)]/10 text-[var(--color-success)]",
    penalty_shootout: "bg-[var(--color-success)]/10 text-[var(--color-success)]",
    completed: "bg-[var(--color-muted)]/10 text-[var(--color-muted)]",
    cancelled: "bg-[var(--color-danger)]/10 text-[var(--color-danger)]",
    abandoned: "bg-[var(--color-danger)]/10 text-[var(--color-danger)]",
    postponed: "bg-[var(--color-warning)]/10 text-[var(--color-warning)]",
  };

  const columns: Column<Match>[] = [
    { header: "Match", render: (m) => <span className="font-medium text-[var(--color-heading)]">{teamName(m.home_team_id)} vs {teamName(m.away_team_id)}</span> },
    { header: "Round", render: (m) => m.round ?? "—" },
    { header: "Score", render: (m) => (m.status === "completed" || m.status === "live" ? `${m.home_score} - ${m.away_score}` : "—") },
    { header: "Venue", render: (m) => m.venue ?? "—" },
    { header: "Scheduled", render: (m) => (m.scheduled_at ? new Date(m.scheduled_at).toLocaleString() : "—") },
    { header: "Status", render: (m) => <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${statusColor[m.status]}`}>{m.status.replace("_", " ")}</span> },
    { header: "QR", render: (m) => <QrCodeButton value={`https://tournamentlive.app/matches/${m.id}`} label={`${teamName(m.home_team_id)} vs ${teamName(m.away_team_id)}`} /> },
  ];

  if (tournamentsLoading) return null;
  if (tournaments.length === 0) return <EmptyState icon={Swords} title="Create a tournament first" />;

  return (
    <>
      <title>Matches · TournamentLive</title>
      <div className="flex flex-wrap items-center justify-between gap-3 px-6 pt-6">
        <TournamentSelector tournaments={tournaments} selectedId={selectedId} onChange={(id) => { setPage(1); setSelectedId(id); }} />
        <ExportMenu rows={rows.map((m) => ({ home: teamName(m.home_team_id), away: teamName(m.away_team_id), venue: m.venue, scheduled_at: m.scheduled_at, status: m.status, home_score: m.home_score, away_score: m.away_score }))} filenameBase="matches-export" pdfTitle="Matches" />
      </div>
      <AdminDataTable
        title="Matches"
        description="Fixtures, results, and match status."
        columns={columns}
        rows={rows}
        isLoading={isLoading}
        error={error}
        search=""
        onSearchChange={() => {}}
        onCreate={teams.length >= 2 ? openCreate : undefined}
        onEdit={openEdit}
        onDelete={remove}
        page={page}
        totalPages={Math.max(1, Math.ceil(total / PAGE_SIZE))}
        onPageChange={setPage}
        emptyLabel={teams.length < 2 ? "Add at least 2 teams before scheduling matches" : "No matches yet"}
      />

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title={editing ? "Edit match" : "New match"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-[var(--color-danger)] dark:bg-red-900/20">{formError}</p>}
          <SelectField label="Home team" value={form.home_team_id} onChange={(v) => setForm((f) => ({ ...f, home_team_id: v }))} options={[{ value: "", label: "TBD" }, ...teams.map((t) => ({ value: t.id, label: t.name }))]} />
          <SelectField label="Away team" value={form.away_team_id} onChange={(v) => setForm((f) => ({ ...f, away_team_id: v }))} options={[{ value: "", label: "TBD" }, ...teams.map((t) => ({ value: t.id, label: t.name }))]} />
          <SelectField label="Venue" value={form.venue_id} onChange={(v) => setForm((f) => ({ ...f, venue_id: v }))} options={[{ value: "", label: "Custom / not listed" }, ...venues.map((v) => ({ value: v.id, label: v.name }))]} />
          {!form.venue_id && <TextField label="Venue name (custom)" value={form.venue} onChange={(v) => setForm((f) => ({ ...f, venue: v }))} />}
          <div className="grid grid-cols-2 gap-3">
            <TextField label="Round" value={form.round} onChange={(v) => setForm((f) => ({ ...f, round: v }))} />
            <TextField label="Scheduled at" type="datetime-local" value={form.scheduled_at} onChange={(v) => setForm((f) => ({ ...f, scheduled_at: v }))} />
          </div>
          <SelectField label="Status" value={form.status} onChange={(v) => setForm((f) => ({ ...f, status: v }))} options={STATUS_OPTIONS.map((s) => ({ value: s, label: s.replace("_", " ") }))} />
          <div className="grid grid-cols-2 gap-3">
            <TextField label="Weather" value={form.weather} onChange={(v) => setForm((f) => ({ ...f, weather: v }))} />
            <TextField label="Attendance" type="number" value={form.attendance} onChange={(v) => setForm((f) => ({ ...f, attendance: v }))} />
          </div>
          <TextField label="Ticket link" value={form.ticket_link} onChange={(v) => setForm((f) => ({ ...f, ticket_link: v }))} />

          {officials.length > 0 && (
            <div className="space-y-2 rounded-lg border border-[var(--color-border)] p-3">
              <p className="text-sm font-medium text-[var(--color-text)]">Match officials</p>
              {OFFICIAL_ROLES.map((role) => (
                <SelectField
                  key={role}
                  label={role.replace("_", " ")}
                  value={assignments[role] ?? ""}
                  onChange={(v) => setAssignments((a) => ({ ...a, [role]: v }))}
                  options={[{ value: "", label: "Unassigned" }, ...officials.map((o) => ({ value: o.id, label: o.full_name }))]}
                />
              ))}
            </div>
          )}

          <button type="submit" disabled={isSaving} className="flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--color-primary)] px-4 py-2.5 text-sm font-medium text-white hover:bg-[var(--color-primary-hover)] disabled:opacity-60">
            {isSaving && <ButtonSpinner />}
            {editing ? "Save changes" : "Schedule match"}
          </button>
        </form>
      </Drawer>
    </>
  );
}
