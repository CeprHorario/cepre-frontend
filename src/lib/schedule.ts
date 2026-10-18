import type { HourSession, Weekday } from "@/api/types";

export const WEEKDAYS: Weekday[] = ["Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sabado"];

export const WEEKDAY_LABEL: Record<Weekday, string> = {
  Lunes: "Lunes",
  Martes: "Martes",
  Miercoles: "Miércoles",
  Jueves: "Jueves",
  Viernes: "Viernes",
  Sabado: "Sábado",
};

export const WEEKDAY_SHORT: Record<Weekday, string> = {
  Lunes: "Lun",
  Martes: "Mar",
  Miercoles: "Mié",
  Jueves: "Jue",
  Viernes: "Vie",
  Sabado: "Sáb",
};

/** "1970-01-01T07:00:00.000Z" | "07:00:00" | "07:00" → "07:00" (horas guardadas en UTC) */
export function toHHMM(value: string | null | undefined): string {
  if (!value) return "";
  if (/^\d{1,2}:\d{2}/.test(value)) return value.slice(0, 5).padStart(5, "0");
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(11, 16);
}

export function minutesOf(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

export function addMinutes(hhmm: string, minutes: number): string {
  const total = minutesOf(hhmm) + minutes;
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

/** Día de hoy como Weekday (domingo → lunes) */
export function todayWeekday(date = new Date()): Weekday {
  const index = date.getDay();
  return WEEKDAYS[index === 0 ? 0 : index - 1];
}

/** Normaliza nombres de día que llegan con tilde o en mayúsculas */
export function normalizeWeekday(value: string): Weekday | null {
  const plain = value.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  return WEEKDAYS.find((day) => day.toLowerCase() === plain) ?? null;
}

export interface Period {
  id: number;
  shiftId: number;
  shiftName: string;
  period: number;
  start: string;
  end: string;
}

export function toPeriods(sessions: HourSession[]): Period[] {
  return sessions
    .map((s) => ({
      id: s.id,
      shiftId: s.shiftId,
      shiftName: s.shift?.name ?? `Turno ${s.shiftId}`,
      period: s.period,
      start: toHHMM(s.startTime),
      end: toHHMM(s.endTime),
    }))
    .sort((a, b) => minutesOf(a.start) - minutesOf(b.start) || a.shiftId - b.shiftId);
}

/** Filas únicas de horario (inicio–fin) presentes en una lista de periodos */
export function uniqueRows(periods: { start: string; end: string }[]): { start: string; end: string }[] {
  const map = new Map<string, { start: string; end: string }>();
  periods.forEach((p) => map.set(`${p.start}-${p.end}`, { start: p.start, end: p.end }));
  return [...map.values()].sort((a, b) => minutesOf(a.start) - minutesOf(b.start));
}

/** Un bloque de 40 min en un día, con datos de presentación */
export interface ScheduleEntry {
  day: Weekday;
  start: string;
  end: string;
  title: string;
  subtitle?: string;
  color?: string;
  /** Sin docente: se pinta con borde punteado */
  pending?: boolean;
  /** Clave para unir bloques consecutivos (p. ej. curso o salón) */
  groupKey?: string;
  meta?: Record<string, unknown>;
}

export interface MergedEntry extends ScheduleEntry {
  rowStart: number;
  rowSpan: number;
}

/**
 * Coloca bloques en una grilla de filas y une los consecutivos del mismo grupo
 * en el mismo día (p. ej. dos horas seguidas del mismo curso).
 */
export function layoutEntries(entries: ScheduleEntry[], rows: { start: string; end: string }[]): MergedEntry[] {
  const rowIndex = new Map(rows.map((r, i) => [r.start, i]));
  const sorted = entries
    .filter((e) => rowIndex.has(e.start))
    .sort((a, b) => WEEKDAYS.indexOf(a.day) - WEEKDAYS.indexOf(b.day) || minutesOf(a.start) - minutesOf(b.start));

  const merged: MergedEntry[] = [];
  for (const entry of sorted) {
    const row = rowIndex.get(entry.start)!;
    const last = merged[merged.length - 1];
    const key = entry.groupKey ?? entry.title;
    if (
      last &&
      last.day === entry.day &&
      (last.groupKey ?? last.title) === key &&
      last.rowStart + last.rowSpan === row &&
      Boolean(last.pending) === Boolean(entry.pending)
    ) {
      last.rowSpan += 1;
      last.end = entry.end;
    } else {
      merged.push({ ...entry, rowStart: row, rowSpan: 1 });
    }
  }
  return merged;
}

/** Tinte legible a partir del color del curso: fondo claro, borde medio y texto oscuro */
export function courseTint(hex: string | undefined): { background: string; border: string; text: string } {
  const fallback = { background: "#ECEEF6", border: "#C5C9DE", text: "#1C2140" };
  if (!hex || !/^#?[0-9a-f]{6}$/i.test(hex)) return fallback;
  const clean = hex.replace("#", "");
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(clean.slice(i, i + 2), 16));
  const mix = (c: number, target: number, amount: number) => Math.round(c + (target - c) * amount);
  const toHex = (rgb: number[]) => `#${rgb.map((c) => c.toString(16).padStart(2, "0")).join("")}`;
  return {
    background: toHex([mix(r, 255, 0.86), mix(g, 255, 0.86), mix(b, 255, 0.86)]),
    border: toHex([mix(r, 255, 0.55), mix(g, 255, 0.55), mix(b, 255, 0.55)]),
    text: toHex([mix(r, 0, 0.55), mix(g, 0, 0.55), mix(b, 0, 0.55)]),
  };
}

/** Quita filas vacías al inicio y al final de la grilla según los bloques presentes */
export function trimRows<T extends { start: string }>(rows: T[], entries: { start: string; end: string }[]): T[] {
  if (!entries.length) return rows;
  const first = Math.min(...entries.map((e) => minutesOf(e.start)));
  const last = Math.max(...entries.map((e) => minutesOf(e.end)));
  return rows.filter((r) => minutesOf(r.start) >= first && minutesOf(r.start) < last);
}
