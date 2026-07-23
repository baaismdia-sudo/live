import type { CommentaryRow } from "../hooks/useRealtimeMatch";

export function CommentaryFeed({ items }: { items: CommentaryRow[] }) {
  const pinned = items.filter((c) => c.is_pinned);
  const rest = items.filter((c) => !c.is_pinned);

  if (items.length === 0) {
    return <p className="py-8 text-center text-sm text-[var(--color-muted)]">No commentary yet.</p>;
  }

  return (
    <div className="space-y-2.5">
      {pinned.map((c) => <CommentaryLine key={c.id} item={c} />)}
      {rest.map((c) => <CommentaryLine key={c.id} item={c} />)}
    </div>
  );
}

function renderMarkdown(text: string) {
  return text
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>");
}

function CommentaryLine({ item }: { item: CommentaryRow }) {
  return (
    <div className={`rounded-lg border p-3 ${item.is_highlight ? "border-[var(--color-warning)] bg-[var(--color-warning)]/5" : "border-[var(--color-border)] bg-[var(--color-surface)]"}`}>
      <div className="flex items-center gap-2 text-[10px] text-[var(--color-muted)]">
        {item.is_pinned && <span>📌 Pinned</span>}
        {item.is_highlight && <span>✨ Highlight</span>}
        {item.minute !== null && <span className="font-mono">{item.minute}'</span>}
        <span>{new Date(item.created_at).toLocaleTimeString()}</span>
      </div>
      <p className="mt-1 text-sm text-[var(--color-text)]" dangerouslySetInnerHTML={{ __html: renderMarkdown(item.message) }} />
    </div>
  );
}
