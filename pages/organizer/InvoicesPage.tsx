import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import { AdminDataTable, type Column } from "../../features/admin/components/AdminDataTable";

interface Payment {
  id: string;
  amount_cents: number;
  currency: string;
  status: string;
  gateway: string;
  created_at: string;
}

export default function InvoicesPage() {
  const [rows, setRows] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase.from("payments").select("*").order("created_at", { ascending: false }).then(({ data, error: fetchError }) => {
      if (fetchError) setError(fetchError.message);
      else setRows((data ?? []) as Payment[]);
      setIsLoading(false);
    });
  }, []);

  const columns: Column<Payment>[] = [
    { header: "Date", render: (p) => new Date(p.created_at).toLocaleDateString() },
    { header: "Amount", render: (p) => new Intl.NumberFormat("en-IN", { style: "currency", currency: p.currency, maximumFractionDigits: 0 }).format(p.amount_cents / 100) },
    { header: "Gateway", render: (p) => <span className="capitalize">{p.gateway}</span> },
    { header: "Status", render: (p) => <span className="capitalize">{p.status}</span> },
    { header: "Receipt", render: () => <button className="flex items-center gap-1 text-[var(--color-primary)] hover:underline"><Download size={13} /> Download</button> },
  ];

  return (
    <>
      <title>Invoices · TournamentLive</title>
      <AdminDataTable title="Invoices" description="Payment history for your account." columns={columns} rows={rows} isLoading={isLoading} error={error} search="" onSearchChange={() => {}} page={1} totalPages={1} onPageChange={() => {}} emptyLabel="No invoices yet" />
    </>
  );
}
