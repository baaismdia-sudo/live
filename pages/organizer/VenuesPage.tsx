import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { AdminDataTable, type Column } from "../../features/admin/components/AdminDataTable";
import { Drawer } from "../../features/admin/components/Drawer";
import { TextField, CheckboxField } from "../../features/admin/components/FormField";
import { ButtonSpinner } from "../../components/ui/LoadingSpinner";
import { QrCodeButton } from "../../features/shared/components/QrCodeButton";
import { useAuth } from "../../contexts/AuthContext";

interface Venue {
  id: string;
  name: string;
  city: string | null;
  state: string | null;
  country: string | null;
  address: string | null;
  google_maps_url: string | null;
  capacity: number | null;
  surface: string | null;
  parking: boolean;
  officials_room: boolean;
  media_room: boolean;
}

const emptyForm = { name: "", country: "India", state: "", city: "", address: "", google_maps_url: "", capacity: "", surface: "", parking: false, officials_room: false, media_room: false };

export default function VenuesPage() {
  const { profile } = useAuth();
  const [rows, setRows] = useState<Venue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<Venue | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [isSaving, setIsSaving] = useState(false);

  const load = async () => {
    setIsLoading(true);
    const { data, error: fetchError } = await supabase.from("venues").select("*").order("name");
    if (fetchError) setError(fetchError.message);
    else setRows((data ?? []) as Venue[]);
    setIsLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setDrawerOpen(true); };
  const openEdit = (v: Venue) => {
    setEditing(v);
    setForm({
      name: v.name, country: v.country ?? "India", state: v.state ?? "", city: v.city ?? "",
      address: v.address ?? "", google_maps_url: v.google_maps_url ?? "", capacity: v.capacity?.toString() ?? "",
      surface: v.surface ?? "", parking: v.parking, officials_room: v.officials_room, media_room: v.media_room,
    });
    setDrawerOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setIsSaving(true);
    try {
      const values = { ...form, capacity: form.capacity ? Number(form.capacity) : null, organizer_id: profile.id };
      if (editing) await supabase.from("venues").update(values).eq("id", editing.id);
      else await supabase.from("venues").insert(values);
      setDrawerOpen(false);
      load();
    } finally {
      setIsSaving(false);
    }
  };

  const remove = async (v: Venue) => { await supabase.from("venues").delete().eq("id", v.id); load(); };

  const columns: Column<Venue>[] = [
    { header: "Venue", render: (v) => <span className="font-medium text-[var(--color-heading)]">{v.name}</span> },
    { header: "Location", render: (v) => [v.city, v.state].filter(Boolean).join(", ") || "—" },
    { header: "Capacity", render: (v) => v.capacity?.toLocaleString() ?? "—" },
    { header: "Facilities", render: (v) => [v.parking && "Parking", v.officials_room && "Officials room", v.media_room && "Media room"].filter(Boolean).join(", ") || "—" },
    { header: "QR", render: (v) => <QrCodeButton value={`https://tournamentlive.app/venues/${v.id}`} label={v.name} /> },
  ];

  return (
    <>
      <title>Venues · TournamentLive</title>
      <AdminDataTable title="Venues" description="Reusable across all your tournaments." columns={columns} rows={rows} isLoading={isLoading} error={error} search="" onSearchChange={() => {}} onCreate={openCreate} onEdit={openEdit} onDelete={remove} page={1} totalPages={1} onPageChange={() => {}} emptyLabel="No venues yet" />
      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title={editing ? "Edit venue" : "New venue"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <TextField label="Venue name" value={form.name} onChange={(v) => setForm((f) => ({ ...f, name: v }))} />
          <div className="grid grid-cols-2 gap-3">
            <TextField label="Country" value={form.country} onChange={(v) => setForm((f) => ({ ...f, country: v }))} />
            <TextField label="State" value={form.state} onChange={(v) => setForm((f) => ({ ...f, state: v }))} />
          </div>
          <TextField label="City" value={form.city} onChange={(v) => setForm((f) => ({ ...f, city: v }))} />
          <TextField label="Address" value={form.address} onChange={(v) => setForm((f) => ({ ...f, address: v }))} />
          <TextField label="Google Maps link" value={form.google_maps_url} onChange={(v) => setForm((f) => ({ ...f, google_maps_url: v }))} />
          <div className="grid grid-cols-2 gap-3">
            <TextField label="Capacity" type="number" value={form.capacity} onChange={(v) => setForm((f) => ({ ...f, capacity: v }))} />
            <TextField label="Surface" value={form.surface} onChange={(v) => setForm((f) => ({ ...f, surface: v }))} />
          </div>
          <CheckboxField label="Parking available" checked={form.parking} onChange={(v) => setForm((f) => ({ ...f, parking: v }))} />
          <CheckboxField label="Officials room" checked={form.officials_room} onChange={(v) => setForm((f) => ({ ...f, officials_room: v }))} />
          <CheckboxField label="Media room" checked={form.media_room} onChange={(v) => setForm((f) => ({ ...f, media_room: v }))} />
          <button type="submit" disabled={isSaving} className="flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--color-primary)] px-4 py-2.5 text-sm font-medium text-white hover:bg-[var(--color-primary-hover)] disabled:opacity-60">
            {isSaving && <ButtonSpinner />}
            {editing ? "Save changes" : "Add venue"}
          </button>
        </form>
      </Drawer>
    </>
  );
}
