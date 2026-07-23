import { useEffect, useState } from "react";
import { CheckCircle, XCircle, Phone } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import { AdminDataTable, type Column } from "../../features/admin/components/AdminDataTable";
import { ButtonSpinner } from "../../components/ui/LoadingSpinner";

interface Enquiry {
  id: string;
  organization_name: string;
  contact_name: string;
  contact_phone: string;
  contact_email: string;
  status: "pending" | "contacted" | "activated" | "declined";
  created_at: string;
  rental_plans: { name: string } | null;
}

const PAGE_SIZE = 15;

export default function RentalEnquiriesPage() {
  const [rows, setRows] = useState<Enquiry[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activatingId, setActivatingId] = useState<string | null>(null);

  const load = async () => {
    setIsLoading(true);
    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;
    let query = supabase.from("rental_enquiries").select("*, rental_plans(name)", { count: "exact" }).order("created_at", { ascending: false }).range(from, to);
    if (search) query = query.ilike("organization_name", `%${search}%`);
    const { data, error: fetchError, count } = await query;
    if (fetchError) setError(fetchError.message);
    else {
      setRows((data ?? []) as unknown as Enquiry[]);
      setTotal(count ?? 0);
    }
    setIsLoading(false);
  };

  useEffect(() => { load(); // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search]);

  const activate = async (enquiry: Enquiry) => {
    setActivatingId(enquiry.id);
    try {
      const { error: rpcError } = await supabase.rpc("admin_activate_rental_enquiry", { p_enquiry_id: enquiry.id });
      if (rpcError) throw rpcError;
      load();
    } finally {
      setActivatingId(null);
    }
  };

  const decline = async (enquiry: Enquiry) => {
    await supabase.from("rental_enquiries").update({ status: "declined" }).eq("id", enquiry.id);
    load();
  };

  const statusColor: Record<string, string> = {
    pending: "bg-[var(--color-warning)]/10 text-[var(--color-warning)]",
    contacted: "bg-[var(--color-info)]/10 text-[var(--color-info)]",
    activated: "bg-[var(--color-success)]/10 text-[var(--color-success)]",
    declined: "bg-[var(--color-muted)]/10 text-[var(--color-muted)]",
  };

  const columns: Column<Enquiry>[] = [
    { header: "Organization", render: (e) => <span className="font-medium text-[var(--color-heading)]">{e.organization_name}</span> },
    { header: "Plan", render: (e) => e.rental_plans?.name ?? "—" },
    { header: "Contact", render: (e) => <a href={`tel:${e.contact_phone}`} className="flex items-center gap-1 text-[var(--color-primary)] hover:underline"><Phone size={12} /> {e.contact_phone}</a> },
    { header: "Status", render: (e) => <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${statusColor[e.status]}`}>{e.status}</span> },
    { header: "Received", render: (e) => new Date(e.created_at).toLocaleString() },
    {
      header: "Actions",
      render: (e) =>
        e.status === "pending" || e.status === "contacted" ? (
          <div className="flex items-center gap-3">
            <button onClick={() => activate(e)} disabled={activatingId === e.id} className="flex items-center gap-1 text-xs font-medium text-[var(--color-success)] hover:underline disabled:opacity-50">
              {activatingId === e.id ? <ButtonSpinner /> : <CheckCircle size={14} />} Activate
            </button>
            <button onClick={() => decline(e)} className="flex items-center gap-1 text-xs font-medium text-[var(--color-danger)] hover:underline">
              <XCircle size={14} /> Decline
            </button>
          </div>
        ) : (
          <span className="text-xs text-[var(--color-muted)]">—</span>
        ),
    },
  ];

  return (
    <>
      <title>Rental Enquiries · TournamentLive Admin</title>
      <AdminDataTable
        title="Rental Enquiries"
        description="WhatsApp rental requests from organizers. Activating creates the subscription and notifies them."
        columns={columns}
        rows={rows}
        isLoading={isLoading}
        error={error}
        search={search}
        onSearchChange={(v) => { setPage(1); setSearch(v); }}
        page={page}
        totalPages={Math.max(1, Math.ceil(total / PAGE_SIZE))}
        onPageChange={setPage}
        emptyLabel="No enquiries yet"
      />
    </>
  );
}
