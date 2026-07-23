export function StreamEmbed({ streamUrl, provider }: { streamUrl: string; provider: string }) {
  let embedSrc = streamUrl;
  if (provider === "youtube") {
    const idMatch = streamUrl.match(/(?:youtu\.be\/|v=)([\w-]+)/);
    if (idMatch) embedSrc = `https://www.youtube.com/embed/${idMatch[1]}`;
  }
  return (
    <div className="aspect-video overflow-hidden rounded-card border border-[var(--color-border)]">
      <iframe
        src={embedSrc}
        title="Live stream"
        allow="autoplay; encrypted-media; picture-in-picture"
        allowFullScreen
        className="h-full w-full"
      />
    </div>
  );
}
