import { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { useGlobalSearch } from "../hooks/useGlobalSearch";

export function GlobalSearch() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const { results, isLoading } = useGlobalSearch(query);
  const navigate = useNavigate();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  return (
    <div ref={ref} className="relative hidden max-w-md flex-1 sm:block">
      <div className="flex items-center gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-secondary)] px-3 py-2">
        <Search size={16} className="text-[var(--color-muted)]" />
        <input
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder="Search teams, players, officials, venues..."
          className="w-full bg-transparent text-sm outline-none placeholder:text-[var(--color-muted)]"
        />
      </div>
      {open && query.trim().length >= 2 && (
        <div className="absolute left-0 right-0 z-30 mt-1 max-h-80 overflow-y-auto rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] py-1 shadow-[var(--shadow-lg)]">
          {isLoading ? (
            <p className="px-3 py-2 text-sm text-[var(--color-muted)]">Searching...</p>
          ) : results.length === 0 ? (
            <p className="px-3 py-2 text-sm text-[var(--color-muted)]">No results for "{query}"</p>
          ) : (
            results.map((r) => (
              <button
                key={`${r.type}-${r.id}`}
                onClick={() => { navigate(r.to); setOpen(false); setQuery(""); }}
                className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-[var(--color-surface-secondary)]"
              >
                <span className="text-[var(--color-text)]">{r.label}</span>
                <span className="text-xs capitalize text-[var(--color-muted)]">{r.sublabel}</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
