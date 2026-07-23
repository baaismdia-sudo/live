import type { ReactNode } from "react";

export function IconWrapper({ children, tone = "brand" }: { children: ReactNode; tone?: "brand" | "success" | "warning" }) {
  const tones = {
    brand: "bg-[var(--color-brand)]/10 text-[var(--color-brand)]",
    success: "bg-[var(--color-success)]/10 text-[var(--color-success)]",
    warning: "bg-[var(--color-warning)]/10 text-[var(--color-warning)]",
  };
  return (
    <div className={`flex h-11 w-11 items-center justify-center rounded-xl text-xl ${tones[tone]}`}>
      {children}
    </div>
  );
}
