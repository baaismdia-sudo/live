interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ title = "Something went wrong", message, onRetry }: ErrorStateProps) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center gap-3 rounded-xl border border-[var(--color-danger)]/30 bg-[var(--color-danger)]/5 p-6 text-center"
    >
      <p className="font-semibold text-[var(--color-danger)]">{title}</p>
      <p className="text-sm text-[var(--color-text-muted)]">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="rounded-lg bg-[var(--color-danger)] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
        >
          Try again
        </button>
      )}
    </div>
  );
}

export function InlineFieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="mt-1 text-sm text-[var(--color-danger)]">
      {message}
    </p>
  );
}

export function SuccessBanner({ message }: { message: string }) {
  return (
    <div
      role="status"
      className="rounded-xl border border-[var(--color-success)]/30 bg-[var(--color-success)]/10 px-4 py-3 text-sm text-[var(--color-success)]"
    >
      {message}
    </div>
  );
}
