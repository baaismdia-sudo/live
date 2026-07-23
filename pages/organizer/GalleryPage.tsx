import { useEffect, useRef, useState } from "react";
import { Trash2, Upload, Image as ImageIcon } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import { TournamentSelector } from "../../features/organizer/components/TournamentSelector";
import { useOrganizerTournaments } from "../../features/organizer/hooks/useOrganizerTournaments";
import { useAuth } from "../../contexts/AuthContext";
import { PageLoader } from "../../components/ui/LoadingSpinner";
import { EmptyState } from "../../features/admin/components/EmptyState";
import { ButtonSpinner } from "../../components/ui/LoadingSpinner";

interface GalleryItem {
  id: string;
  caption: string | null;
  media: { file_url: string } | null;
}

export default function GalleryPage() {
  const { profile } = useAuth();
  const { tournaments, selectedId, setSelectedId, isLoading: tournamentsLoading } = useOrganizerTournaments();
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    if (!selectedId) return;
    setIsLoading(true);
    const { data } = await supabase.from("gallery").select("id, caption, media:media_library(file_url)").eq("tournament_id", selectedId).order("sort_order");
    setItems((data ?? []) as unknown as GalleryItem[]);
    setIsLoading(false);
  };

  useEffect(() => { load(); // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0 || !profile) return;
    setIsUploading(true);
    try {
      for (const file of Array.from(files)) {
        const path = `${profile.id}/${selectedId}/${Date.now()}-${file.name}`;
        const { error: uploadError } = await supabase.storage.from("gallery-images").upload(path, file);
        if (uploadError) continue;
        const { data: urlData } = supabase.storage.from("gallery-images").getPublicUrl(path);
        const { data: media } = await supabase.from("media_library").insert({
          organizer_id: profile.id,
          tournament_id: selectedId,
          file_url: urlData.publicUrl,
          file_type: "image",
          uploaded_by: profile.id,
        }).select().single();
        if (media) {
          await supabase.from("gallery").insert({ tournament_id: selectedId, media_id: media.id });
        }
      }
      load();
    } finally {
      setIsUploading(false);
    }
  };

  const remove = async (item: GalleryItem) => {
    await supabase.from("gallery").delete().eq("id", item.id);
    load();
  };

  if (tournamentsLoading) return null;
  if (tournaments.length === 0) return <EmptyState icon={ImageIcon} title="Create a tournament first" />;

  return (
    <div className="space-y-5 p-6">
      <title>Gallery · TournamentLive</title>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-xl font-bold text-[var(--color-heading)]">Gallery</h1>
          <p className="text-sm text-[var(--color-muted)]">Photos shown on your tournament's public gallery page.</p>
        </div>
        <TournamentSelector tournaments={tournaments} selectedId={selectedId} onChange={setSelectedId} />
      </div>

      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); handleUpload(e.dataTransfer.files); }}
        className="flex flex-col items-center justify-center gap-2 rounded-card border-2 border-dashed border-[var(--color-border)] p-8 text-center"
      >
        <Upload size={22} className="text-[var(--color-muted)]" />
        <p className="text-sm text-[var(--color-muted)]">Drag & drop images here, or</p>
        <button onClick={() => fileInputRef.current?.click()} disabled={isUploading} className="flex items-center gap-2 rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-primary-hover)]">
          {isUploading && <ButtonSpinner />}
          Browse files
        </button>
        <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleUpload(e.target.files)} />
      </div>

      {isLoading ? (
        <PageLoader label="Loading gallery..." />
      ) : items.length === 0 ? (
        <EmptyState icon={ImageIcon} title="No photos yet" />
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {items.map((item) => (
            <div key={item.id} className="group relative aspect-square overflow-hidden rounded-lg border border-[var(--color-border)]">
              {item.media?.file_url && <img src={item.media.file_url} alt={item.caption ?? ""} className="h-full w-full object-cover" />}
              <button
                onClick={() => remove(item)}
                className="absolute right-1.5 top-1.5 rounded-full bg-black/60 p-1.5 text-white opacity-0 transition-opacity group-hover:opacity-100"
                aria-label="Delete image"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
