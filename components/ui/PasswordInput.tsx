import { useId, useMemo, useState } from "react";

interface PasswordInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  showStrengthMeter?: boolean;
  autoComplete?: "new-password" | "current-password";
  placeholder?: string;
}

function scorePassword(password: string): { score: number; label: string; color: string } {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  const levels = [
    { label: "Very weak", color: "bg-red-500" },
    { label: "Weak", color: "bg-orange-500" },
    { label: "Fair", color: "bg-yellow-500" },
    { label: "Good", color: "bg-lime-500" },
    { label: "Strong", color: "bg-green-500" },
    { label: "Very strong", color: "bg-green-600" },
  ];
  return { score, ...levels[Math.min(score, levels.length - 1)] };
}

export function generateStrongPassword(length = 14): string {
  const charset = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*";
  let result = "";
  const array = new Uint32Array(length);
  crypto.getRandomValues(array);
  for (let i = 0; i < length; i++) result += charset[array[i] % charset.length];
  return result;
}

export function PasswordInput({
  label,
  value,
  onChange,
  error,
  showStrengthMeter = false,
  autoComplete = "current-password",
  placeholder,
}: PasswordInputProps) {
  const id = useId();
  const [visible, setVisible] = useState(false);
  const strength = useMemo(() => scorePassword(value), [value]);

  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-[var(--color-text)]">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={visible ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          placeholder={placeholder}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3.5 py-2.5 pr-11 text-sm text-[var(--color-text)] outline-none transition focus:border-[var(--color-brand)] focus:ring-2 focus:ring-[var(--color-brand)]/20"
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
        >
          {visible ? "🙈" : "👁"}
        </button>
      </div>

      {showStrengthMeter && value.length > 0 && (
        <div className="mt-2">
          <div className="flex gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full ${i < strength.score ? strength.color : "bg-[var(--color-border)]"}`}
              />
            ))}
          </div>
          <p className="mt-1 text-xs text-[var(--color-text-muted)]">{strength.label}</p>
        </div>
      )}

      {error && (
        <p id={`${id}-error`} role="alert" className="mt-1 text-sm text-[var(--color-danger)]">
          {error}
        </p>
      )}
    </div>
  );
}
