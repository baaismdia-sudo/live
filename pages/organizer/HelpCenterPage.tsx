import { BookOpen, MessageCircle, LifeBuoy } from "lucide-react";
import { Link } from "react-router-dom";

const LINKS = [
  { icon: BookOpen, title: "Documentation", description: "Guides for every dashboard feature.", to: "/docs" },
  { icon: MessageCircle, title: "Tutorials", description: "Step-by-step walkthroughs for common tasks.", to: "/docs/tutorials" },
  { icon: LifeBuoy, title: "Contact Support", description: "Open a support ticket with our team.", to: "/dashboard/support" },
];

export default function HelpCenterPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <title>Help Center · TournamentLive</title>
      <div>
        <h1 className="font-heading text-xl font-bold text-[var(--color-heading)]">Help Center</h1>
        <p className="text-sm text-[var(--color-muted)]">Get help running your tournament.</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        {LINKS.map((link) => (
          <Link key={link.title} to={link.to} className="rounded-card border border-[var(--color-border)] bg-[var(--color-surface)] p-5 transition-shadow hover:shadow-[var(--shadow-md)]">
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
              <link.icon size={17} />
            </div>
            <p className="font-medium text-[var(--color-heading)]">{link.title}</p>
            <p className="mt-1 text-xs text-[var(--color-muted)]">{link.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
