import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { useSiteContext } from "../../features/publicSite/hooks/useSiteContext";
import { PageLoader } from "../../components/ui/LoadingSpinner";
import { ErrorState } from "../../components/ui/ErrorState";
import { ShareBar } from "../../features/live/components/ShareBar";

export default function NewsArticlePage() {
  const { articleSlug } = useParams<{ articleSlug: string }>();
  const { tournament } = useSiteContext();
  const [article, setArticle] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!articleSlug) return;
    supabase.from("news").select("*").eq("tournament_id", tournament.id).eq("slug", articleSlug).eq("is_published", true).single().then(({ data }) => {
      setArticle(data);
      setIsLoading(false);
    });
  }, [articleSlug, tournament.id]);

  if (isLoading) return <PageLoader label="Loading article..." />;
  if (!article) return <ErrorState message="Article not found" />;

  return (
    <article className="mx-auto max-w-2xl space-y-5">
      {article.cover_image_url && <img src={article.cover_image_url} alt="" className="w-full rounded-card object-cover" loading="lazy" />}
      <div>
        <h1 className="font-heading text-2xl font-bold text-[var(--color-heading)]">{article.title}</h1>
        {article.published_at && <p className="mt-1 text-xs text-[var(--color-muted)]">{new Date(article.published_at).toLocaleDateString()}</p>}
      </div>
      <div className="whitespace-pre-wrap text-sm leading-relaxed text-[var(--color-text)]">{article.content}</div>
      <ShareBar url={typeof window !== "undefined" ? window.location.href : ""} text={article.title} qrLabel={article.title} />
    </article>
  );
}
