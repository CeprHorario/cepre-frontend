import type { ReactNode } from "react";
import type { Weekday } from "@/api/types";
import { cn } from "@/lib/cn";
import { WEEKDAY_SHORT, WEEKDAYS, minutesOf, todayWeekday, type MergedEntry } from "@/lib/schedule";
import { Dot } from "@/components/ui/Badge";

/** Selector de día con el día actual destacado */
export function DayPicker({ value, onChange, counts }: { value: Weekday; onChange: (day: Weekday) => void; counts?: Partial<Record<Weekday, number>> }) {
  const today = todayWeekday();
  return (
    <div role="radiogroup" aria-label="Día" className="flex justify-between gap-1.5">
      {WEEKDAYS.map((day) => {
        const active = day === value;
        return (
          <button
            key={day}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(day)}
            className={cn(
              "relative flex h-14 min-w-11 flex-1 cursor-pointer flex-col items-center justify-center gap-0.5 rounded-xl border text-ink-700 transition-colors",
              active ? "border-guinda-700 bg-guinda-700 text-white" : "border-line bg-white hover:border-marino-300",
            )}
          >
            <span className="text-[11px]">{WEEKDAY_SHORT[day]}</span>
            <strong className="tabular text-sm">{counts?.[day] ?? 0}</strong>
            {day === today && <span className={cn("absolute -top-1 size-2 rounded-full", active ? "bg-oro-500" : "bg-guinda-700")} aria-label="hoy" />}
          </button>
        );
      })}
    </div>
  );
}

interface AgendaProps {
  entries: MergedEntry[];
  day: Weekday;
  renderActions?: (entry: MergedEntry) => ReactNode;
  emptyLabel?: string;
}

/** Lista vertical de las clases de un día (vista móvil) */
export function DayAgenda({ entries, day, renderActions, emptyLabel = "No hay clases este día" }: AgendaProps) {
  const list = entries.filter((e) => e.day === day).sort((a, b) => minutesOf(a.start) - minutesOf(b.start));
  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const isToday = day === todayWeekday();

  if (!list.length) return <p className="rounded-2xl bg-white p-6 text-center text-sm text-ink-500">{emptyLabel}</p>;

  return (
    <ol className="flex flex-col gap-2.5">
      {list.map((entry) => {
        const live = isToday && nowMinutes >= minutesOf(entry.start) && nowMinutes < minutesOf(entry.end);
        return (
          <li
            key={`${entry.start}-${entry.title}`}
            className={cn(
              "grid grid-cols-[56px_minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border bg-white px-3 py-3",
              live ? "border-guinda-700 shadow-[0_0_0_1px_#661124]" : "border-line",
            )}
          >
            <span className="tabular text-xs font-semibold leading-5 text-ink-500">
              {entry.start}
              <br />
              {entry.end}
            </span>
            <div className="flex min-w-0 flex-col gap-0.5">
              <span className="flex items-center gap-2 text-sm font-bold">
                {entry.color && <Dot color={entry.color} />}
                <span className="truncate">{entry.title}</span>
              </span>
              {entry.subtitle && (
                <span className={cn("truncate text-xs", entry.pending ? "font-semibold text-danger-700" : "text-ink-500")}>
                  {live ? "Ahora · " : ""}
                  {entry.subtitle}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5">{renderActions?.(entry)}</div>
          </li>
        );
      })}
    </ol>
  );
}
