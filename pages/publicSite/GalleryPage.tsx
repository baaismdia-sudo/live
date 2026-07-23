import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import { useSiteContext } from "../../features/publicSite/hooks/useSiteContext";
import { SectionHeading } from "../../features/publicSite/components/FadeInSection";
import { PageLoader } from "../../components/ui/LoadingSpinner";
import { EmptyState } from "../../features/admin/components/EmptyState";
import { Image as ImageIcon } from "lucide-react";

export default function GalleryPage() {
  const { tournament } = useSiteContext();
  const [images, setImages] = useState<{ id: string; caption: string | null; url: string }[]>([]);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    supabase.from("gallery").select("id, caption, media:media_library(file_url)").eq("tournament_id", tournament.id).order("sort_order").then(({ data }) => {
      setImages(((data ?? []) as unknown as { id: string; caption: string | null; media: { file_url: string } | null }[]).map((g) => ({ id: g.id, caption: g.caption, url: g.media?.file_url ?? "" })).filter((g) => g.url));
      setIsLoading(false);
    });
  }, [tournament.id]);

  return (
    <div>
      <SectionHeading title="Gallery" subtitle="Match day photos" />
      {isLoading ? <PageLoader label="Loading gallery..." /> : images.length === 0 ? <EmptyState icon={ImageIcon} title="No photos yet" /> : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {images.map((img) => (
            <button
              key={img.id}
              onClick={() => setLightbox(img.url)}
              onContextMenu={(e) => e.preventDefault()}
              className="aspect-square overflow-hidden rounded-lg border border-[var(--color-border)]"
            >
              <img src={img.url} alt={img.caption ?? ""} className="h-full w-full object-cover transition-transform hover:scale-105" loading="lazy" draggable={false} />
            </button>
          ))}
        </div>
      )}

      {lightbox && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={() => setLightbox(null)}>
          <button onClick={() => setLightbox(null)} aria-label="Close" className="absolute right-4 top-4 text-white"><X size={24} /></button>
          <img src={lightbox} alt="" className="max-h-[85vh] max-w-full rounded-lg object-contain" onContextMenu={(e) => e.preventDefault()} draggable={false} />
        </div>
      )}
      <p className="mt-3 text-xs text-[var(--color-muted)]">
        Right-click and drag are disabled as a casual deterrent — this isn't real DRM (no browser-side technique
        can fully prevent someone from saving an image they can already see), so it's presented honestly as a
        deterrent rather than "protection."
      </p>
    </div>
  );
}
