import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportToCsv(rows: Record<string, unknown>[], filename: string) {
  if (rows.length === 0) return;
  const headers = Object.keys(rows[0]);
  const csvRows = rows.map((row) => headers.map((h) => JSON.stringify(row[h] ?? "")).join(","));
  const csv = [headers.join(","), ...csvRows].join("\n");
  downloadBlob(new Blob([csv], { type: "text/csv" }), filename);
}

export function exportToJson(rows: Record<string, unknown>[], filename: string) {
  downloadBlob(new Blob([JSON.stringify(rows, null, 2)], { type: "application/json" }), filename);
}

export function exportToExcel(rows: Record<string, unknown>[], filename: string, sheetName = "Sheet1") {
  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  XLSX.writeFile(workbook, filename);
}

export function exportToPdf(rows: Record<string, unknown>[], filename: string, title: string) {
  if (rows.length === 0) return;
  const doc = new jsPDF();
  doc.setFontSize(14);
  doc.text(title, 14, 15);
  const headers = Object.keys(rows[0]);
  autoTable(doc, {
    startY: 22,
    head: [headers],
    body: rows.map((row) => headers.map((h) => String(row[h] ?? ""))),
    styles: { fontSize: 8 },
    headStyles: { fillColor: [79, 70, 229] },
  });
  doc.save(filename);
}
