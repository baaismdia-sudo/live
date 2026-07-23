import { Link } from "react-router-dom";

const COLUMNS = [
  { title: "Company", links: [{ label: "About", to: "/about" }, { label: "Blog", to: "/blog" }, { label: "Contact", to: "/contact" }] },
  { title: "Product", links: [{ label: "Features", to: "/features" }, { label: "Pricing", to: "/pricing" }, { label: "Templates", to: "/templates" }] },
  { title: "Resources", links: [{ label: "Documentation", to: "/docs" }, { label: "Support", to: "/support" }, { label: "Sports", to: "/sports" }] },
  { title: "Legal", links: [{ label: "Privacy Policy", to: "/privacy" }, { label: "Terms", to: "/terms" }, { label: "Refund Policy", to: "/refund-policy" }] },
];

const SOCIALS = [
  { label: "Twitter", href: "https://twitter.com", icon: "🐦" },
  { label: "Instagram", href: "https://instagram.com", icon: "📸" },
  { label: "LinkedIn", href: "https://linkedin.com", icon: "💼" },
  { label: "YouTube", href: "https://youtube.com", icon: "▶️" },
];

export function Footer() {
  return (
    <footer className="border-t border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-16">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4 lg:grid-cols-5">
          <div className="col-span-2 lg:col-span-1">
            <Link to="/" className="flex items-center gap-2 text-lg font-semibold text-[var(--color-text)]">
              <span className="inline-block h-7 w-7 rounded-lg bg-[var(--color-brand)]" />
              TournamentLive
            </Link>
            <p className="mt-3 text-sm text-[var(--color-text-muted)]">
              Rent a fully branded tournament website in minutes.
            </p>
            <div className="mt-4 flex gap-3">
              {SOCIALS.map((s) => (
                <a key={s.label} href={s.href} aria-label={s.label} className="text-lg opacity-70 transition hover:opacity-100">
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <p className="text-sm font-semibold text-[var(--color-text)]">{col.title}</p>
              <ul className="mt-3 space-y-2">
                {col.links.map((link) => (
                  <li key={link.to}>
                    <Link to={link.to} className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)]">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-[var(--color-border)] pt-6 sm:flex-row">
          <p className="text-xs text-[var(--color-text-muted)]">
            © {new Date().getFullYear()} TournamentLive. All rights reserved.
          </p>
          <p className="text-xs text-[var(--color-text-muted)]">Made for organizers, by organizers.</p>
        </div>
      </div>
    </footer>
  );
}
