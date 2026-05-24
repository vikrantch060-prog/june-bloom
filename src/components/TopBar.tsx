import { CalendarDays } from "lucide-react";
import { sunsetsRemaining } from "@/lib/time";

interface Props { onOpenCalendar: () => void }

export function TopBar({ onOpenCalendar }: Props) {
  const sunsets = sunsetsRemaining();
  return (
    <header className="fixed top-0 inset-x-0 z-30 flex items-start justify-between px-4 pt-[max(env(safe-area-inset-top),12px)] pb-2">
      <div className="glass rounded-full px-3.5 py-1.5">
        <div className="text-[10px] uppercase tracking-[0.25em] text-[var(--muted-foreground)] leading-none">today</div>
        <div className="font-display text-[13px] leading-tight">
          {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric" })}
        </div>
      </div>

      <button
        onClick={onOpenCalendar}
        className="glass rounded-full pl-3 pr-3.5 py-1.5 flex items-center gap-2 active:scale-95 transition"
      >
        <CalendarDays size={14} />
        <span className="text-[11px] font-mono tabular-nums">{sunsets} sunsets</span>
      </button>
    </header>
  );
}
