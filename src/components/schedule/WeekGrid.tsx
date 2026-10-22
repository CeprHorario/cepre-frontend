import type { ReactNode } from "react";
import type { Weekday } from "@/api/types";
import { cn } from "@/lib/cn";
import { courseTint, WEEKDAY_LABEL, WEEKDAY_SHORT, WEEKDAYS, type MergedEntry } from "@/lib/schedule";

export type CellKey = `${Weekday}|${string}`;
export const cellKey = (day: Weekday, start: string): CellKey => `${day}|${start}`;

export type EntryVariant = "course" | "pending" | "assigned" | "preview";

interface WeekGridProps {
  rows: { start: string; end: string }[];
  entries?: (MergedEntry & { variant?: EntryVariant })[];
  days?: Weekday[];
  /** Celdas marcadas (disponibilidad) */
  marked?: Set<CellKey>;
  /** Indicativo de ocupación que permite seguir editando la disponibilidad. */
  cellNotes?: Map<CellKey, string>;
  /** Si se pasan, la grilla es editable */
  onToggleCell?: (day: Weekday, start: string) => void;
  onToggleDay?: (day: Weekday) => void;
  onToggleRow?: (start: string) => void;
  onEntryClick?: (entry: MergedEntry) => void;
  highlightDay?: Weekday;
  compact?: boolean;
  emptyLabel?: ReactNode;
}

/** Grilla semanal: días en columnas, sesiones de 40 min en filas */
export function WeekGrid({
  rows,
  entries = [],
  days = WEEKDAYS,
  marked,
  cellNotes,
  onToggleCell,
  onToggleDay,
  onToggleRow,
  onEntryClick,
  highlightDay,
  compact,
  emptyLabel,
}: WeekGridProps) {
  if (!rows.length) {
    return <div className="rounded-xl bg-surface-2 p-8 text-center text-sm text-ink-500">{emptyLabel ?? "Sin sesiones configuradas"}</div>;
  }

  const editable = Boolean(onToggleCell);
  const occupied = new Set<CellKey>();
  entries.forEach((entry) => {
    for (let i = 0; i < entry.rowSpan; i++) {
      const row = rows[entry.rowStart + i];
      if (row) occupied.add(cellKey(entry.day, row.start));
    }
  });

  const rowHeight = compact ? 34 : 52;
  const headerClass = "font-display text-xs font-bold text-white bg-marino-900 rounded-lg";

  return (
    <div className="overflow-x-auto">
      <div
        className="grid gap-1.5"
        style={{
          gridTemplateColumns: `${compact ? 58 : 88}px repeat(${days.length}, minmax(${compact ? 40 : 64}px, 1fr))`,
          gridAutoRows: `minmax(${rowHeight}px, auto)`,
          minWidth: compact ? 360 : 500,
        }}
      >
        <div style={{ gridColumn: 1, gridRow: 1, minHeight: 34 }} />
        {days.map((day, i) => {
          const label = compact ? WEEKDAY_SHORT[day] : WEEKDAY_LABEL[day];
          const style = { gridColumn: i + 2, gridRow: 1, minHeight: 34 };
          const ring = highlightDay === day ? "ring-2 ring-oro-500 ring-offset-1" : "";
          return onToggleDay ? (
            <button key={day} type="button" onClick={() => onToggleDay(day)} className={cn(headerClass, ring, "cursor-pointer hover:bg-marino-700")} style={style}>
              {label}
            </button>
          ) : (
            <div key={day} className={cn(headerClass, ring, "flex items-center justify-center")} style={style}>
              {label}
            </div>
          );
        })}

        {rows.map((row, r) => {
          const style = { gridColumn: 1, gridRow: r + 2 };
          const text = compact ? row.start : `${row.start} – ${row.end}`;
          const cls = "tabular rounded-lg bg-marino-50 text-[11.5px] font-semibold text-ink-700 flex items-center justify-center text-center px-1";
          return onToggleRow ? (
            <button key={row.start} type="button" onClick={() => onToggleRow(row.start)} className={cn(cls, "cursor-pointer hover:bg-marino-100")} style={style}>
              {text}
            </button>
          ) : (
            <div key={row.start} className={cls} style={style}>
              {text}
            </div>
          );
        })}

        {days.flatMap((day, d) =>
          rows.map((row, r) => {
            const key = cellKey(day, row.start);
            if (occupied.has(key)) return null;
            const isMarked = marked?.has(key);
            const note = cellNotes?.get(key);
            const noteContent = note ? <span className="pointer-events-none flex flex-col gap-0.5 overflow-hidden text-[10px] leading-tight text-[#0B5A30]"><strong>Ocupado</strong><span className="truncate">{note.split("\n")[0]}</span></span> : null;
            const style = { gridColumn: d + 2, gridRow: r + 2 };
            if (editable) {
              return (
                <button
                  key={key}
                  type="button"
                  aria-pressed={isMarked}
                  aria-label={`${WEEKDAY_LABEL[day]} ${row.start}${isMarked ? ", disponible" : ""}${note ? `, ocupado: ${note}` : ""}`}
                  title={note}
                  onClick={() => onToggleCell?.(day, row.start)}
                  className={cn(
                    "min-w-0 cursor-pointer rounded-lg border px-2 py-1 text-left transition-colors",
                    isMarked ? "border-2 border-guinda-700" : "border-line hover:border-guinda-600/50",
                    note ? "bg-[#E2F2E8]" : isMarked ? "bg-guinda-50" : "bg-white hover:bg-[#FCF7F8]",
                  )}
                  style={style}
                >{noteContent}</button>
              );
            }
            return (
              <div
                key={key}
                className={cn("min-w-0 rounded-lg px-2 py-1", isMarked && "border-2 border-guinda-700", note ? "bg-[#E2F2E8]" : isMarked ? "bg-guinda-50" : "bg-surface-2")}
                title={note}
                style={style}
              >{noteContent}</div>
            );
          }),
        )}

        {entries.map((entry) => (
          <GridBlock
            key={`${entry.day}-${entry.start}-${entry.title}`}
            entry={entry}
            column={days.indexOf(entry.day) + 2}
            compact={compact}
            onClick={onEntryClick ? () => onEntryClick(entry) : undefined}
          />
        ))}
      </div>
    </div>
  );
}

function GridBlock({ entry, column, compact, onClick }: {
  entry: MergedEntry & { variant?: EntryVariant };
  column: number;
  compact?: boolean;
  onClick?: () => void;
}) {
  if (column < 2) return null;
  const variant: EntryVariant = entry.variant ?? (entry.pending ? "pending" : "course");
  const tint = courseTint(entry.color);
  const style: React.CSSProperties = { gridColumn: column, gridRow: `${entry.rowStart + 2} / span ${entry.rowSpan}` };
  let className = "flex min-w-0 flex-col gap-0.5 overflow-hidden rounded-lg border text-left";

  if (variant === "pending") {
    className += " border-[1.5px] border-dashed border-[#B9BCCB] bg-white text-ink-700";
  } else if (variant === "preview") {
    className += " border-2 border-dashed border-[#B58B3E] text-[#6B4E14]";
    style.background = "repeating-linear-gradient(135deg,#FBF3E3 0 8px,#F6E8C9 8px 16px)";
  } else if (variant === "assigned") {
    className += " border-[#9CCFB1] bg-[#E2F2E8] text-[#0B5A30]";
  } else {
    Object.assign(style, { background: tint.background, borderColor: tint.border, color: tint.text });
  }

  const content = (
    <>
      <strong className={cn("truncate", compact ? "text-[11px]" : "text-[13px]")}>{entry.title}</strong>
      {!compact && entry.subtitle && (
        <span className={cn("truncate text-[11px]", variant === "pending" && "font-bold text-danger-700")}>{entry.subtitle}</span>
      )}
      {!compact && entry.rowSpan > 1 && <span className="tabular mt-auto text-[11px] opacity-80">{entry.start} – {entry.end}</span>}
    </>
  );

  const padding = compact ? "px-1.5 py-1" : "px-2.5 py-2";
  return onClick ? (
    <button type="button" onClick={onClick} className={cn(className, padding, "cursor-pointer hover:brightness-95")} style={style}>
      {content}
    </button>
  ) : (
    <div className={cn(className, padding)} style={style}>
      {content}
    </div>
  );
}
