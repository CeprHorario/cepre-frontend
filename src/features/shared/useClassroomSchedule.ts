import { useMemo } from "react";
import { useCourses, useMonitorSchedule, useMonitorTeachers, usePeriods } from "@/api/queries";
import { fullName } from "@/lib/format";
import { layoutEntries, toHHMM, uniqueRows, type ScheduleEntry } from "@/lib/schedule";

/**
 * Horario de un salón visto por su monitor (sin argumento) o por un supervisor (userId del monitor).
 * Única fuente para ambos roles: curso del propio bloque, docente según `hasTeacher` y turno según `shiftId`.
 */
export function useClassroomSchedule(monitorUserId?: string) {
  const schedule = useMonitorSchedule(monitorUserId);
  const teachers = useMonitorTeachers(monitorUserId);
  const courses = useCourses();
  const { periods } = usePeriods();

  const teacherByCourse = useMemo(() => new Map((teachers.data ?? []).map((t) => [t.courseName, t])), [teachers.data]);
  const colorByCourse = useMemo(() => new Map((courses.data ?? []).map((c) => [c.name, c.color])), [courses.data]);

  const entries: ScheduleEntry[] = useMemo(
    () =>
      (schedule.data ?? []).map((s) => {
        const teacher = s.hasTeacher ? teacherByCourse.get(s.courseName) : undefined;
        return {
          day: s.weekday,
          start: toHHMM(s.startTime),
          end: toHHMM(s.endTime),
          title: s.courseName,
          subtitle: teacher ? fullName(teacher) : "Por asignar",
          color: colorByCourse.get(s.courseName),
          pending: !s.hasTeacher,
          groupKey: s.courseName,
          meta: { phone: teacher?.phone },
        };
      }),
    [schedule.data, teacherByCourse, colorByCourse],
  );

  // El turno viene en cada bloque; varios turnos comparten horas, así que no se deduce por la hora
  const rows = useMemo(() => {
    const shift = schedule.data?.[0]?.shiftId;
    return uniqueRows(periods.filter((p) => p.shiftId === shift));
  }, [schedule.data, periods]);

  const merged = useMemo(() => layoutEntries(entries, rows), [entries, rows]);

  return { schedule, teachers, colorByCourse, entries, rows, merged };
}
