import type { Weekday } from "@/api/types";
import { cellKey, type CellKey } from "@/components/schedule/WeekGrid";
import { normalizeWeekday } from "@/lib/schedule";

/**
 * La disponibilidad del docente aún no tiene endpoint en el backend:
 * se guarda en este navegador. Se migra el formato de la versión anterior.
 */
const key = (teacherId: string) => `ceprunsa:disponibilidad:${teacherId}`;
const legacyKey = (teacherId: string) => `disponibilidad-${teacherId}`;

export function loadAvailability(teacherId: string): Set<CellKey> {
  try {
    const raw = localStorage.getItem(key(teacherId));
    if (raw) return new Set(JSON.parse(raw) as CellKey[]);

    const legacy = localStorage.getItem(legacyKey(teacherId));
    if (legacy) {
      const items = JSON.parse(legacy) as { dia?: string; hora_ini?: string }[];
      const migrated = new Set<CellKey>();
      items.forEach((item) => {
        const day = item.dia ? normalizeWeekday(item.dia) : null;
        if (day && item.hora_ini) migrated.add(cellKey(day as Weekday, item.hora_ini));
      });
      saveAvailability(teacherId, migrated);
      return migrated;
    }
  } catch {
    // datos corruptos: se empieza vacío
  }
  return new Set();
}

export function saveAvailability(teacherId: string, cells: Set<CellKey>) {
  try {
    localStorage.setItem(key(teacherId), JSON.stringify([...cells]));
  } catch {
    // sin almacenamiento disponible
  }
}
