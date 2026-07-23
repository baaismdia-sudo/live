import { useEffect, useState } from "react";
import { Archive, Trash2, Mail, MailOpen } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import { PageLoader } from "../../components/ui/LoadingSpinner";
import { EmptyState } from "../../features/admin/components/EmptyState";

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  status: "new" | "read" | "archived";
  created_at: string;
}

export default function ContactMessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [selected, setSelected] = useState<ContactMessage | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const load = async () => {
    setIsLoading(true);
    const { data } = await supabase.from("contact_messages").select("*").order("created_at", { ascending: false }).limit(100);
    setMessages((data ?? []) as ContactMessage[]);
    setIsLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const markRead = async (msg: ContactMessage) => {
    if (msg.status !== "new") return;
    await supabase.from("contact_messages").update({ status: "read" }).eq("id", msg.id);
    setMessages((prev) => prev.map((m) => (m.id === msg.id ? { ...m, status: "read" } : m)));
  };

  const archive = async (msg: ContactMessage) => {
    await supabase.from("contact_messages").update({ status: "archived" }).eq("id", msg.id);
    setMessages((prev) => prev.map((m) => (m.id === msg.id ? { ...m, status: "archived" } : m)));
  };

  const remove = async (msg: ContactMessage) => {
    await supabase.from("contact_messages").delete().eq("id", msg.id);
    setMessages((prev) => prev.filter((m) => m.id !== msg.id));
    if (selected?.id === msg.id) setSelected(null);
  };

  if (isLoading) return <PageLoader label="Loading messages..." />;

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      <title>Contact Messages · TournamentLive Admin</title>
      <div className="w-full max-w-sm overflow-y-auto border-r border-[var(--color-border)]">
        <div className="border-b border-[var(--color-border)] p-4">
          <h1 className="font-heading text-lg font-bold text-[var(--color-heading)]">Inbox</h1>
          <p className="text-xs text-[var(--color-muted)]">{messages.filter((m) => m.status === "new").length} unread</p>
        </div>
        {messages.length === 0 ? (
          <EmptyState icon={Mail} title="No messages yet" />
        ) : (
          messages.map((msg) => (
            <button
              key={msg.id}
              onClick={() => {
                setSelected(msg);
                markRead(msg);
              }}
              className={`block w-full border-b border-[var(--color-border)] p-4 text-left transition-colors hover:bg-[var(--color-surface-secondary)] ${
                selected?.id === msg.id ? "bg-[var(--color-primary)]/5" : ""
              } ${msg.status === "archived" ? "opacity-50" : ""}`}
            >
              <div className="flex items-center justify-between">
                <p className={`text-sm ${msg.status === "new" ? "font-semibold text-[var(--color-heading)]" : "font-medium text-[var(--color-text)]"}`}>
                  {msg.name}
                </p>
                {msg.status === "new" && <span className="h-2 w-2 rounded-full bg-[var(--color-primary)]" />}
              </div>
              <p className="truncate text-xs text-[var(--color-muted)]">{msg.subject || msg.message}</p>
              <p className="mt-1 text-[10px] text-[var(--color-muted)]">{new Date(msg.created_at).toLocaleDateString()}</p>
            </button>
          ))
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {selected ? (
          <div className="max-w-xl space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="font-heading text-lg font-semibold text-[var(--color-heading)]">{selected.subject || "No subject"}</h2>
                <p className="text-sm text-[var(--color-muted)]">
                  {selected.name} · {selected.email}
                </p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => archive(selected)} className="rounded-lg border border-[var(--color-border)] p-2 hover:bg-[var(--color-surface-secondary)]" aria-label="Archive">
                  <Archive size={16} />
                </button>
                <button onClick={() => remove(selected)} className="rounded-lg border border-[var(--color-border)] p-2 text-[var(--color-danger)] hover:bg-red-50 dark:hover:bg-red-900/20" aria-label="Delete">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            <p className="whitespace-pre-wrap rounded-card border border-[var(--color-border)] bg-[var(--color-surface)] p-5 text-sm text-[var(--color-text)]">
              {selected.message}
            </p>
            <a
              href={`mailto:${selected.email}`}
              className="inline-block rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-primary-hover)]"
            >
              Reply via email
            </a>
          </div>
        ) : (
          <EmptyState icon={MailOpen} title="Select a message" description="Choose a message from the inbox to read it." />
        )}
      </div>
    </div>
  );
}
