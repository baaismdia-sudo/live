import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useSiteContext } from "../../features/publicSite/hooks/useSiteContext";
import { SectionHeading } from "../../features/publicSite/components/FadeInSection";
import { NewsCard } from "../../features/publicSite/components/NewsCard";
import { PageLoader } from "../../components/ui/LoadingSpinner";
import { EmptyState } from "../../features/admin/components/EmptyState";
import { Newspaper } from "lucide-react";

export default function NewsPage() {
  const { tournament } = useSiteContext();
  const [articles, setArticles] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    supabase.from("news").select("id, title, slug, excerpt, cover_image_url, published_at").eq("tournament_id", tournament.id).eq("is_published", true).order("published_at", { ascending: false }).then(({ data }) => {
      setArticles(data ?? []);
      setIsLoading(false);
    });
  }, [tournament.id]);

  const filtered = search ? articles.filter((a) => a.title.toLowerCase().includes(search.toLowerCase())) : articles;

  return (
    <div>
      <SectionHeading title="News" subtitle="Latest updates and announcements" />
      <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search news..." className="mb-5 w-full max-w-xs rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3.5 py-2 text-sm outline-none focus:border-[var(--color-primary)]" />
      {isLoading ? <PageLoader label="Loading news..." /> : filtered.length === 0 ? <EmptyState icon={Newspaper} title="No articles yet" /> : (
        <div className="grid gap-4 sm:grid-cols-3">{filtered.map((a) => <NewsCard key={a.id} article={a} slug={tournament.slug} />)}</div>
      )}
    </div>
  );
}
