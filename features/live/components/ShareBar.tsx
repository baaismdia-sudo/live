import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { QrCodeButton } from "../../shared/components/QrCodeButton";

const CHANNELS = [
  { label: "WhatsApp", icon: "💬", urlFor: (url: string, text: string) => `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}` },
  { label: "Facebook", icon: "📘", urlFor: (url: string) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}` },
  { label: "Telegram", icon: "✈️", urlFor: (url: string, text: string) => `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}` },
  { label: "X", icon: "𝕏", urlFor: (url: string, text: string) => `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}` },
  { label: "Email", icon: "✉️", urlFor: (url: string, text: string) => `mailto:?subject=${encodeURIComponent(text)}&body=${encodeURIComponent(url)}` },
];

export function ShareBar({ url, text, qrLabel }: { url: string; text: string; qrLabel: string }) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {CHANNELS.map((c) => (
        <a
          key={c.label}
          href={c.urlFor(url, text)}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1.5 rounded-lg border border-[var(--color-border)] px-3 py-1.5 text-sm hover:bg-[var(--color-surface-secondary)]"
        >
          {c.icon} {c.label}
        </a>
      ))}
      <button onClick={copy} className="flex items-center gap-1.5 rounded-lg border border-[var(--color-border)] px-3 py-1.5 text-sm hover:bg-[var(--color-surface-secondary)]">
        {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? "Copied" : "Copy link"}
      </button>
      <QrCodeButton value={url} label={qrLabel} />
    </div>
  );
}
