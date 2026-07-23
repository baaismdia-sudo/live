import { type ReactNode } from "react";
import { Link } from "react-router-dom";

export function AuthLayout({
  children,
  title,
  subtitle,
  seoTitle,
}: {
  children: ReactNode;
  title: string;
  subtitle?: string;
  seoTitle: string;
}) {
  return (
    <div className="flex min-h-screen bg-[var(--color-surface)]">
      <title>{`${seoTitle} · TournamentLive`}</title>
      <meta name="robots" content="noindex" />

      {/* Left: form panel */}
      <div className="flex w-full flex-col justify-center px-6 py-12 sm:px-12 lg:w-1/2 lg:px-20">
        <Link to="/" className="mb-10 inline-flex items-center gap-2 text-lg font-semibold text-[var(--color-text)]">
          <span className="inline-block h-7 w-7 rounded-lg bg-[var(--color-brand)]" />
          TournamentLive
        </Link>

        <div className="w-full max-w-sm animate-[fadeIn_0.3s_ease-out]">
          <h1 className="text-2xl font-semibold text-[var(--color-text)]">{title}</h1>
          {subtitle && <p className="mt-2 text-sm text-[var(--color-text-muted)]">{subtitle}</p>}
          <div className="mt-8">{children}</div>
        </div>
      </div>

      {/* Right: brand panel, hidden on mobile */}
      <div className="relative hidden w-1/2 items-center justify-center overflow-hidden bg-[var(--color-brand)] lg:flex">
        <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(circle_at_20%_20%,white,transparent_40%),radial-gradient(circle_at_80%_60%,white,transparent_35%)]" />
        <div className="relative max-w-md px-10 text-center text-white">
          <p className="text-2xl font-semibold leading-snug">
            Launch a tournament website in minutes, not weeks.
          </p>
          <p className="mt-4 text-sm text-white/80">
            Live scores, fixtures, sponsors, and a fully branded site — all from one dashboard.
          </p>
        </div>
      </div>
    </div>
  );
}
