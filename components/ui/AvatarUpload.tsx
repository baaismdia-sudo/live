import { useRef, useState } from "react";
import { ButtonSpinner } from "./LoadingSpinner";

interface AvatarUploadProps {
  currentUrl: string | null;
  fallbackInitial: string;
  onUpload: (file: File) => Promise<void>;
  onDelete?: () => Promise<void>;
}

const MAX_SIZE_BYTES = 5 * 1024 * 1024;

/**
 * Crop/resize/compress happens client-side via an offscreen canvas before
 * upload — this keeps every uploaded avatar a consistent square under the
 * bucket's 5MB limit without needing a heavier cropper library dependency.
 */
async function resizeAndCompress(file: File, maxDimension = 512): Promise<File> {
  const imageBitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxDimension / Math.max(imageBitmap.width, imageBitmap.height));
  const size = Math.round(Math.max(imageBitmap.width, imageBitmap.height) * scale);

  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;

  // Center-crop to a square before drawing, so avatars are consistently framed.
  const cropSize = Math.min(imageBitmap.width, imageBitmap.height);
  const sx = (imageBitmap.width - cropSize) / 2;
  const sy = (imageBitmap.height - cropSize) / 2;
  ctx.drawImage(imageBitmap, sx, sy, cropSize, cropSize, 0, 0, size, size);

  const blob: Blob = await new Promise((resolve) =>
    canvas.toBlob((b) => resolve(b!), "image/webp", 0.85)
  );
  return new File([blob], file.name.replace(/\.\w+$/, ".webp"), { type: "image/webp" });
}

export function AvatarUpload({ currentUrl, fallbackInitial, onUpload, onDelete }: AvatarUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(currentUrl);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file");
      return;
    }
    if (file.size > MAX_SIZE_BYTES) {
      setError("Image must be smaller than 5MB");
      return;
    }

    setError(null);
    setIsUploading(true);
    try {
      const processed = await resizeAndCompress(file);
      setPreview(URL.createObjectURL(processed));
      await onUpload(processed);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex items-center gap-4">
      <div className="relative h-20 w-20 overflow-hidden rounded-full bg-[var(--color-surface-alt)]">
        {preview ? (
          <img src={preview} alt="Avatar preview" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-2xl font-semibold text-[var(--color-text-muted)]">
            {fallbackInitial}
          </div>
        )}
        {isUploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-white">
            <ButtonSpinner />
          </div>
        )}
      </div>
      <div className="space-y-1">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="rounded-lg border border-[var(--color-border)] px-3 py-1.5 text-sm font-medium hover:bg-[var(--color-surface-alt)]"
          >
            {preview ? "Replace" : "Upload"}
          </button>
          {preview && onDelete && (
            <button
              type="button"
              onClick={async () => {
                await onDelete();
                setPreview(null);
              }}
              className="rounded-lg border border-[var(--color-border)] px-3 py-1.5 text-sm font-medium text-[var(--color-danger)] hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              Remove
            </button>
          )}
        </div>
        <p className="text-xs text-[var(--color-text-muted)]">PNG or JPG, up to 5MB</p>
        {error && <p className="text-xs text-[var(--color-danger)]">{error}</p>}
      </div>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
    </div>
  );
}
