import { Check } from "lucide-react";

export function WizardStepper({ steps, currentStep }: { steps: string[]; currentStep: number }) {
  return (
    <div className="flex items-center overflow-x-auto pb-2">
      {steps.map((label, i) => {
        const stepNum = i + 1;
        const isDone = stepNum < currentStep;
        const isActive = stepNum === currentStep;
        return (
          <div key={label} className="flex shrink-0 items-center">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
                  isDone
                    ? "bg-[var(--color-success)] text-white"
                    : isActive
                    ? "bg-[var(--color-primary)] text-white"
                    : "bg-[var(--color-surface-secondary)] text-[var(--color-muted)]"
                }`}
              >
                {isDone ? <Check size={15} /> : stepNum}
              </div>
              <span className={`w-20 text-center text-[11px] ${isActive ? "font-medium text-[var(--color-heading)]" : "text-[var(--color-muted)]"}`}>
                {label}
              </span>
            </div>
            {stepNum < steps.length && <div className={`mx-1 h-0.5 w-8 ${isDone ? "bg-[var(--color-success)]" : "bg-[var(--color-border)]"}`} />}
          </div>
        );
      })}
    </div>
  );
}
