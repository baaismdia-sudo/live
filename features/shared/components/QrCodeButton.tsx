import { useState } from "react";
import QRCode from "qrcode";
import { QrCode, X, Download } from "lucide-react";

export function QrCodeButton({ value, label }: { value: string; label: string }) {
  const [open, setOpen] = useState(false);
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  const show = async () => {
    const url = await QRCode.toDataURL(value, { width: 320, margin: 2, color: { dark: "#0F172A", light: "#FFFFFF" } });
    setDataUrl(url);
    setOpen(true);
  };

  const download = () => {
    if (!dataUrl) return;
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `${label.toLowerCase().replace(/\s+/g, "-")}-qr.png`;
    a.click();
  };

  return (
    <>
      <button onClick={show} className="flex items-center gap-1.5 rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm font-medium hover:bg-[var(--color-surface-secondary)]">
        <QrCode size={15} /> QR Code
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setOpen(false)}>
          <div onClick={(e) => e.stopPropagation()} className="flex flex-col items-center gap-4 rounded-card bg-[var(--color-surface)] p-6 shadow-2xl">
            <div className="flex w-full items-center justify-between">
              <p className="font-heading text-sm font-semibold text-[var(--color-heading)]">{label}</p>
              <button onClick={() => setOpen(false)} aria-label="Close" className="text-[var(--color-muted)] hover:text-[var(--color-text)]"><X size={18} /></button>
            </div>
            {dataUrl && <img src={dataUrl} alt={`QR code for ${label}`} className="h-56 w-56 rounded-lg border border-[var(--color-border)]" />}
            <p className="max-w-56 truncate text-center text-xs text-[var(--color-muted)]">{value}</p>
            <button onClick={download} className="flex items-center gap-1.5 rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-primary-hover)]">
              <Download size={14} /> Download PNG
            </button>
          </div>
        </div>
      )}
    </>
  );
}
