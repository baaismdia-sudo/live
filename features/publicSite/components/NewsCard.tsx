import { Link } from "react-router-dom";

interface NewsItem { id: string; title: string; slug: string; excerpt: string | null; cover_image_url: string | null; published_at: string | null }

export function NewsCard({ article, slug }: { article: NewsItem; slug: string }) {
  return (
    <Link to={`/tournament/${slug}/news/${article.slug}`} className="block overflow-hidden rounded-card border border-[var(--color-border)] bg-[var(--color-surface)] transition-shadow hover:shadow-[var(--shadow-md)]">
      <div className="flex h-32 items-center justify-center bg-[var(--color-surface-secondary)]">
        {article.cover_image_url ? <img src={article.cover_image_url} alt="" className="h-full w-full object-cover" loading="lazy" /> : <span className="text-3xl">📰</span>}
      </div>
      <div className="p-4">
        <p className="font-medium text-[var(--color-heading)]">{article.title}</p>
        {article.excerpt && <p className="mt-1 line-clamp-2 text-xs text-[var(--color-muted)]">{article.excerpt}</p>}
        {article.published_at && <p className="mt-2 text-[10px] text-[var(--color-muted)]">{new Date(article.published_at).toLocaleDateString()}</p>}
      </div>
    </Link>
  );
}
