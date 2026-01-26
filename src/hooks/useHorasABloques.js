import { useMemo } from "react";
import { useHourSessions } from "./useHourSessions";

/**
 * Hook para transformar horas de disponibilidad en bloques horarios
 * @returns {{
 *   loading: boolean,
 *   error: Error | null,
 *   mapearABloques: (disponibilidad?: Array<any>) => Array<{id_hour_session: number, weekday: string}>,
 *   isReady: boolean
 * }}
 */
export const useHorasABloques = () => {
  const { hourSessions, loading, error } = useHourSessions();
  const isReady = !loading && !error && hourSessions.length > 0;

  const mapearABloques = useMemo(() => {
    return (disponibilidad = []) => {
      if (!Array.isArray(disponibilidad) || !isReady) return [];

      const formatHora = (hora) => {
        if (!hora || typeof hora !== "string") return null;
        const trimmed = hora.trim();
        // Si ya está en formato HH:mm, retornar tal cual
        if (/^\d{1,2}:\d{2}$/.test(trimmed)) {
          return trimmed.length === 4 ? `0${trimmed}` : trimmed; // Asegurar 2 dígitos en hora
        }
        // Si tiene segundos, quitarlos
        if (/^\d{1,2}:\d{2}:\d{2}$/.test(trimmed)) return trimmed.slice(0, 5);
        return null;
      };

      const capitalizar = (str) => {
        const strSinTildes = str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        return strSinTildes.charAt(0).toUpperCase() + strSinTildes.slice(1).toLowerCase();
      };

      const bloques = [];

      disponibilidad.forEach((item) => {
        // Ya viene en formato correcto
        if (item.id_hour_session && item.weekday && !item.hora_ini && !item.hora_fin) {
          const valid = hourSessions.some(h => h.id === Number(item.id_hour_session));
          if (!valid) return;

          bloques.push({
            id_hour_session: Number(item.id_hour_session),
            weekday: capitalizar(item.weekday),
          });
          return;
        }

        const { dia, hora_ini, hora_fin } = item;

        if (!dia || !hora_ini || !hora_fin) return;

        const formattedHoraIni = formatHora(hora_ini);
        const formattedHoraFin = formatHora(hora_fin);

        // Ahora startTime y endTime ya vienen en formato HH:mm
        const match = hourSessions.find(
          (sesion) =>
            sesion.startTime === formattedHoraIni &&
            sesion.endTime === formattedHoraFin
        );

        if (!match) {
          console.warn("No se encontró bloque para:", formattedHoraIni, formattedHoraFin, dia);
          return;
        }

        const base = {
          weekday: capitalizar(dia),
        };

        bloques.push({ id_hour_session: match.id, ...base });

        if (match.id === 7 || match.id === 14) {
          bloques.push({ id_hour_session: match.id + 1, ...base });
        }
      });

      return bloques;
    };
  }, [hourSessions, isReady]);

  return {
    loading,
    error,
    mapearABloques,
    isReady,
  };
};
