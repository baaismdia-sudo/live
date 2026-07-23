import { useEffect, useState } from "react";

function getRemaining(target: string) {
  const diff = new Date(target).getTime() - Date.now();
  if (diff <= 0) return null;
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
  };
}

export function CountdownTimer({ target }: { target: string }) {
  const [remaining, setRemaining] = useState(getRemaining(target));

  useEffect(() => {
    const interval = setInterval(() => setRemaining(getRemaining(target)), 1000);
    return () => clearInterval(interval);
  }, [target]);

  if (!remaining) return null;

  return (
    <div className="flex gap-3">
      {[
        { label: "Days", value: remaining.days },
        { label: "Hours", value: remaining.hours },
        { label: "Min", value: remaining.minutes },
        { label: "Sec", value: remaining.seconds },
      ].map((unit) => (
        <div key={unit.label} className="flex flex-col items-center rounded-lg bg-white/10 px-3 py-2 backdrop-blur">
          <span className="font-mono text-xl font-bold text-white">{unit.value.toString().padStart(2, "0")}</span>
          <span className="text-[10px] uppercase tracking-wide text-white/70">{unit.label}</span>
        </div>
      ))}
    </div>
  );
}
