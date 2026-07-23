import { Link, useParams } from "react-router-dom";

export default function PublicNotFoundPage() {
  const { slug } = useParams<{ slug: string }>();
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-center">
      <p className="text-5xl">🏆</p>
      <p className="font-heading text-lg font-semibold text-[var(--color-heading)]">Page not found</p>
      <p className="text-sm text-[var(--color-muted)]">This page doesn't exist on this tournament site.</p>
      {slug && <Link to={`/tournament/${slug}`} className="mt-2 rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-primary-hover)]">Back to home</Link>}
    </div>
  );
}
