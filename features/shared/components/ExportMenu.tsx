import { useState, useRef, useEffect } from "react";
import { Download, ChevronDown } from "lucide-react";
import { exportToCsv, exportToExcel, exportToPdf, exportToJson } from "../../../shared/utils/exporters";

export function ExportMenu({ rows, filenameBase, pdfTitle }: { rows: Record<string, unknown>[]; filenameBase: string; pdfTitle: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  const options = [
    { label: "CSV", action: () => exportToCsv(rows, `${filenameBase}.csv`) },
    { label: "Excel", action: () => exportToExcel(rows, `${filenameBase}.xlsx`) },
    { label: "PDF", action: () => exportToPdf(rows, `${filenameBase}.pdf`, pdfTitle) },
    { label: "JSON", action: () => exportToJson(rows, `${filenameBase}.json`) },
  ];

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        disabled={rows.length === 0}
        className="flex items-center gap-1.5 rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm font-medium hover:bg-[var(--color-surface-secondary)] disabled:opacity-50"
      >
        <Download size={15} /> Export <ChevronDown size={13} />
      </button>
      {open && (
        <div className="absolute right-0 z-20 mt-1 w-32 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] py-1 shadow-[var(--shadow-lg)]">
          {options.map((opt) => (
            <button
              key={opt.label}
              onClick={() => { opt.action(); setOpen(false); }}
              className="block w-full px-3 py-1.5 text-left text-sm hover:bg-[var(--color-surface-secondary)]"
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
