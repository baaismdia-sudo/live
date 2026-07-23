import { useState } from "react";
import { FileDown } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { MatchRow, LiveScoreRow, MatchEventRow } from "../hooks/useRealtimeMatch";
import { exportToCsv, exportToJson } from "../../../shared/utils/exporters";

interface ReportData {
  match: MatchRow;
  liveScore: LiveScoreRow | null;
  events: MatchEventRow[];
  homeTeamName: string;
  awayTeamName: string;
  tournamentName: string;
  venueName?: string;
  attendance?: number | null;
}

function buildSummary(data: ReportData) {
  return {
    tournament: data.tournamentName,
    match: `${data.homeTeamName} vs ${data.awayTeamName}`,
    final_score: `${data.liveScore?.home_score ?? data.match.home_score} - ${data.liveScore?.away_score ?? data.match.away_score}`,
    status: data.match.status,
    venue: data.venueName ?? data.match.venue ?? "—",
    attendance: data.attendance ?? "—",
  };
}

export function MatchReportButton({ data }: { data: ReportData }) {
  const [open, setOpen] = useState(false);
  const filenameBase = `match-report-${data.homeTeamName}-vs-${data.awayTeamName}`.toLowerCase().replace(/\s+/g, "-");

  const downloadPdf = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Match Report", 14, 16);
    doc.setFontSize(11);
    const summary = buildSummary(data);
    doc.text(`${summary.match}`, 14, 26);
    doc.text(`Final score: ${summary.final_score}`, 14, 33);
    doc.text(`Tournament: ${summary.tournament}`, 14, 40);
    doc.text(`Venue: ${summary.venue}`, 14, 47);

    autoTable(doc, {
      startY: 55,
      head: [["Time", "Event", "Description"]],
      body: data.events.filter((e) => !e.undone).map((e) => [
        e.minute !== null ? `${e.minute}'` : "—",
        e.event_type.replace(/_/g, " "),
        e.description ?? "",
      ]),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [79, 70, 229] },
    });
    doc.save(`${filenameBase}.pdf`);
  };

  const downloadCsv = () => {
    exportToCsv(
      data.events.filter((e) => !e.undone).map((e) => ({ minute: e.minute, event: e.event_type, description: e.description })),
      `${filenameBase}.csv`
    );
  };

  const downloadJson = () => {
    exportToJson([{ summary: buildSummary(data), timeline: data.events.filter((e) => !e.undone) }], `${filenameBase}.json`);
  };

  return (
    <div className="relative">
      <button onClick={() => setOpen((v) => !v)} className="flex items-center gap-1.5 rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm font-medium hover:bg-[var(--color-surface-secondary)]">
        <FileDown size={15} /> Match Report
      </button>
      {open && (
        <div className="absolute right-0 z-20 mt-1 w-36 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] py-1 shadow-[var(--shadow-lg)]">
          <button onClick={() => { downloadPdf(); setOpen(false); }} className="block w-full px-3 py-1.5 text-left text-sm hover:bg-[var(--color-surface-secondary)]">PDF</button>
          <button onClick={() => { downloadCsv(); setOpen(false); }} className="block w-full px-3 py-1.5 text-left text-sm hover:bg-[var(--color-surface-secondary)]">CSV</button>
          <button onClick={() => { downloadJson(); setOpen(false); }} className="block w-full px-3 py-1.5 text-left text-sm hover:bg-[var(--color-surface-secondary)]">JSON</button>
        </div>
      )}
    </div>
  );
}
