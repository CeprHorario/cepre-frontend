import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { tokenStore } from "./client";
import {
  AdmissionsApi,
  AuthApi,
  CatalogApi,
  ClassesApi,
  CoordinatorsApi,
  CoursesApi,
  MonitorsApi,
  SchedulesApi,
  SupervisorsApi,
  SystemApi,
  TeachersApi,
} from "./services";
import type { AvailableClassroom, Paginated, Slot } from "./types";
import { toPeriods } from "@/lib/schedule";

const MINUTE = 60_000;

export const keys = {
  me: ["me"] as const,
  status: ["system", "status"] as const,
  config: ["system", "config"] as const,
  schemas: ["system", "schemas"] as const,
  history: ["system", "history"] as const,
  admissions: ["admissions"] as const,
  currentAdmission: ["admissions", "current"] as const,
  areas: ["areas"] as const,
  shifts: ["shifts"] as const,
  sedes: ["sedes"] as const,
  hourSessions: ["hourSessions"] as const,
  courses: ["courses"] as const,
  classes: ["classes"] as const,
  classSchedules: (id: string) => ["classes", id, "schedules"] as const,
  classTeachers: (id: string) => ["classes", id, "teachers"] as const,
  ownClasses: ["classes", "own"] as const,
  teachers: (params: object) => ["teachers", params] as const,
  teacher: (id: string) => ["teachers", "detail", id] as const,
  teacherSchedule: (id: string) => ["teachers", "schedule", id] as const,
  availableTeachers: (params: object) => ["teachers", "available", params] as const,
  availableClasses: (params: object) => ["classes", "available", params] as const,
  monitors: (params: object) => ["monitors", params] as const,
  monitorsFiltered: (params: object) => ["monitors", "filtered", params] as const,
  monitorInfo: ["monitors", "me"] as const,
  monitorSchedule: (id?: string) => ["monitors", "schedule", id ?? "me"] as const,
  monitorTeachers: (id?: string) => ["monitors", "teachers", id ?? "me"] as const,
  supervisors: (params: object) => ["supervisors", params] as const,
  supervisorMonitors: (id: string) => ["supervisors", id, "monitors"] as const,
  ownMonitors: ["supervisors", "me", "monitors"] as const,
  coordinators: (params: object) => ["coordinators", params] as const,
};

/* ─── Sesión y sistema ─── */

export function useMe() {
  return useQuery({
    queryKey: keys.me,
    queryFn: AuthApi.me,
    enabled: Boolean(tokenStore.get()),
    staleTime: 10 * MINUTE,
    retry: false,
  });
}

export function useSystemStatus() {
  return useQuery({
    queryKey: keys.status,
    queryFn: SystemApi.status,
    staleTime: 30_000,
    refetchOnWindowFocus: "always",
    retry: 2,
  });
}

export function useRuntimeConfig() {
  return useQuery({ queryKey: keys.config, queryFn: SystemApi.config });
}

export function useSchemas() {
  return useQuery({ queryKey: keys.schemas, queryFn: SystemApi.schemas, staleTime: 5 * MINUTE });
}

export function useConfigHistory() {
  return useQuery({ queryKey: keys.history, queryFn: () => SystemApi.history(20) });
}

export function useSystemMutations() {
  const client = useQueryClient();
  const refresh = () => client.invalidateQueries({ queryKey: ["system"] });
  return {
    update: useMutation({ mutationFn: SystemApi.updateConfig, onSuccess: refresh }),
    rollback: useMutation({ mutationFn: SystemApi.rollback, onSuccess: refresh }),
  };
}

/* ─── Catálogos ─── */

/** Solo administradores pueden consultar el proceso actual */
export function useCurrentAdmission(enabled = true) {
  return useQuery({ queryKey: keys.currentAdmission, queryFn: AdmissionsApi.current, staleTime: 5 * MINUTE, enabled });
}

export function useAdmissions() {
  return useQuery({ queryKey: keys.admissions, queryFn: AdmissionsApi.list, staleTime: 5 * MINUTE });
}

export function useCreateAdmission() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: AdmissionsApi.create,
    onSuccess: () => client.invalidateQueries({ queryKey: keys.admissions }),
  });
}

export function useAreas() {
  return useQuery({ queryKey: keys.areas, queryFn: CatalogApi.areas, staleTime: 30 * MINUTE });
}

export function useShifts() {
  return useQuery({ queryKey: keys.shifts, queryFn: CatalogApi.shifts, staleTime: 30 * MINUTE });
}

export function useSedes() {
  return useQuery({ queryKey: keys.sedes, queryFn: CatalogApi.sedes, staleTime: 30 * MINUTE });
}

/** Sesiones de 40 min ya normalizadas a "HH:mm" */
export function usePeriods() {
  const query = useQuery({ queryKey: keys.hourSessions, queryFn: CatalogApi.hourSessions, staleTime: 30 * MINUTE });
  const periods = useMemo(() => toPeriods(query.data ?? []), [query.data]);
  return { ...query, periods };
}

export function useCourses() {
  return useQuery({ queryKey: keys.courses, queryFn: CoursesApi.list, staleTime: 10 * MINUTE });
}

export function useCourseMutations() {
  const client = useQueryClient();
  const refresh = () => client.invalidateQueries({ queryKey: keys.courses });
  return {
    create: useMutation({ mutationFn: CoursesApi.create, onSuccess: refresh }),
    update: useMutation({
      mutationFn: ({ id, ...data }: { id: number; name: string; color: string }) => CoursesApi.update(id, data),
      onSuccess: refresh,
    }),
    remove: useMutation({ mutationFn: CoursesApi.remove, onSuccess: refresh }),
  };
}

/* ─── Salones ─── */

export function useClasses() {
  return useQuery({ queryKey: keys.classes, queryFn: ClassesApi.list, staleTime: 2 * MINUTE });
}

export function useClassSchedules(id: string | undefined) {
  return useQuery({ queryKey: keys.classSchedules(id ?? ""), queryFn: () => ClassesApi.schedules(id!), enabled: Boolean(id) });
}

export function useClassTeachers(id: string | undefined) {
  return useQuery({ queryKey: keys.classTeachers(id ?? ""), queryFn: () => ClassesApi.teachers(id!), enabled: Boolean(id) });
}

export function useOwnClasses() {
  return useQuery({ queryKey: keys.ownClasses, queryFn: ClassesApi.ofTeacher });
}

export function useClassMutations() {
  const client = useQueryClient();
  const refresh = () => client.invalidateQueries({ queryKey: keys.classes });
  return {
    create: useMutation({
      mutationFn: ClassesApi.create,
      onSuccess: () => client.invalidateQueries({ queryKey: ["monitors"] }).then(refresh),
    }),
    remove: useMutation({ mutationFn: ClassesApi.remove, onSuccess: refresh }),
    setMeet: useMutation({
      mutationFn: ({ id, url }: { id: string; url: string }) => ClassesApi.setMeet(id, url),
      onSuccess: () => client.invalidateQueries({ queryKey: ["monitors"] }).then(refresh),
    }),
    setClassroom: useMutation({
      mutationFn: ({ id, url }: { id: string; url: string }) => ClassesApi.setClassroom(id, url),
      onSuccess: () => client.invalidateQueries({ queryKey: ["monitors"] }).then(refresh),
    }),
  };
}

/* ─── Docentes ─── */

export function useTeachers(params: { page: number; limit: number; courseId?: number | null }, enabled = true) {
  return useQuery({
    queryKey: keys.teachers(params),
    queryFn: () => TeachersApi.list(params),
    placeholderData: keepPreviousData,
    enabled,
  });
}

export function useTeacherSearch(query: string, page: number, limit: number) {
  return useQuery({
    queryKey: ["teachers", "search", query, page, limit],
    queryFn: () => TeachersApi.search(query, page, limit),
    enabled: query.trim().length >= 2,
    placeholderData: keepPreviousData,
  });
}

export function useTeacher(id: string | undefined) {
  return useQuery({ queryKey: keys.teacher(id ?? ""), queryFn: () => TeachersApi.get(id!), enabled: Boolean(id) });
}

export function useTeacherSchedule(id: string | undefined) {
  return useQuery({ queryKey: keys.teacherSchedule(id ?? ""), queryFn: () => TeachersApi.schedules(id!), enabled: Boolean(id) });
}

export function useAvailableTeachers(courseId: number | undefined, slots: Slot[]) {
  const params = { courseId, slots };
  return useQuery({
    queryKey: keys.availableTeachers(params),
    queryFn: () => TeachersApi.available({ courseId: courseId!, hourSessions: slots }, 1, 50),
    enabled: Boolean(courseId) && slots.length > 0,
  });
}

export function useAvailableClasses(params: {
  teacherId?: string;
  courseId?: number;
  slots: Slot[];
  areaId?: number | null;
  shiftId?: number | null;
}) {
  return useQuery({
    queryKey: keys.availableClasses(params),
    queryFn: async () => {
      const result = await SchedulesApi.availableClasses({
        teacherId: params.teacherId!,
        courseId: params.courseId!,
        slots: params.slots,
        areaId: params.areaId,
        shiftId: params.shiftId,
      });
      return Array.isArray(result) ? result : (result as Paginated<AvailableClassroom>).data;
    },
    enabled: Boolean(params.teacherId && params.courseId) && params.slots.length > 0,
  });
}

export function useTeacherMutations() {
  const client = useQueryClient();
  const refresh = () => client.invalidateQueries({ queryKey: ["teachers"] });
  return {
    create: useMutation({ mutationFn: TeachersApi.create, onSuccess: refresh }),
    update: useMutation({
      mutationFn: ({ id, ...data }: { id: string } & Parameters<typeof TeachersApi.update>[1]) => TeachersApi.update(id, data),
      onSuccess: refresh,
    }),
    deactivate: useMutation({ mutationFn: TeachersApi.deactivate, onSuccess: refresh }),
  };
}

/** Asignar/desasignar refresca horarios de docente y de salón */
export function useAssignmentMutations() {
  const client = useQueryClient();
  const refresh = () =>
    Promise.all([
      client.invalidateQueries({ queryKey: ["teachers"] }),
      client.invalidateQueries({ queryKey: ["classes"] }),
    ]);
  return {
    assign: useMutation({
      mutationFn: ({ teacherId, classId }: { teacherId: string; classId: string }) => SchedulesApi.assignTeacher(teacherId, classId),
      onSuccess: refresh,
    }),
    unassign: useMutation({
      mutationFn: ({ teacherId, classId }: { teacherId: string; classId: string }) =>
        SchedulesApi.unassignTeacher(teacherId, classId),
      onSuccess: refresh,
    }),
  };
}

/* ─── Monitores ─── */

export function useMonitors(params: { page: number; limit: number; shift_id?: number | null; area_id?: number | null }) {
  return useQuery({ queryKey: keys.monitors(params), queryFn: () => MonitorsApi.list(params), placeholderData: keepPreviousData });
}

export function useMonitorsFiltered(params: { shiftId?: number | null; page: number; limit: number; areaId?: number | null }) {
  return useQuery({
    queryKey: keys.monitorsFiltered(params),
    queryFn: () =>
      MonitorsApi.filtered({ shiftId: params.shiftId!, hasSupervisor: false, page: params.page, limit: params.limit, areaId: params.areaId }),
    enabled: Boolean(params.shiftId),
    placeholderData: keepPreviousData,
  });
}

export function useMonitorInfo() {
  return useQuery({ queryKey: keys.monitorInfo, queryFn: MonitorsApi.information, retry: false });
}

export function useMonitorSchedule(monitorUserId?: string, enabled = true) {
  return useQuery({
    queryKey: keys.monitorSchedule(monitorUserId),
    queryFn: () => MonitorsApi.schedule(monitorUserId),
    enabled,
    retry: false,
  });
}

export function useMonitorTeachers(monitorUserId?: string, enabled = true) {
  return useQuery({
    queryKey: keys.monitorTeachers(monitorUserId),
    queryFn: () => MonitorsApi.teachers(monitorUserId),
    enabled,
    retry: false,
  });
}

export function useMonitorMutations() {
  const client = useQueryClient();
  const refresh = () => client.invalidateQueries({ queryKey: ["monitors"] });
  return {
    update: useMutation({
      mutationFn: ({ id, ...data }: { id: string } & Parameters<typeof MonitorsApi.update>[1]) => MonitorsApi.update(id, data),
      onSuccess: refresh,
    }),
    deactivate: useMutation({ mutationFn: MonitorsApi.deactivate, onSuccess: refresh }),
  };
}

/* ─── Supervisores ─── */

export function useSupervisors(params: { page: number; limit: number }) {
  return useQuery({ queryKey: keys.supervisors(params), queryFn: () => SupervisorsApi.list(params), placeholderData: keepPreviousData });
}

export function useSupervisorMonitors(userId: string | undefined) {
  return useQuery({
    queryKey: keys.supervisorMonitors(userId ?? ""),
    queryFn: () => SupervisorsApi.monitorsOf(userId!),
    enabled: Boolean(userId),
  });
}

export function useOwnMonitors() {
  return useQuery({ queryKey: keys.ownMonitors, queryFn: SupervisorsApi.ownMonitors, retry: false });
}

export function useSupervisorMutations() {
  const client = useQueryClient();
  const refresh = () => client.invalidateQueries({ queryKey: ["supervisors"] });
  const refreshAll = () =>
    Promise.all([client.invalidateQueries({ queryKey: ["supervisors"] }), client.invalidateQueries({ queryKey: ["monitors"] })]);
  return {
    create: useMutation({ mutationFn: SupervisorsApi.create, onSuccess: refresh }),
    update: useMutation({
      mutationFn: ({ id, ...data }: { id: string } & Parameters<typeof SupervisorsApi.update>[1]) => SupervisorsApi.update(id, data),
      onSuccess: refresh,
    }),
    deactivate: useMutation({ mutationFn: SupervisorsApi.deactivate, onSuccess: refresh }),
    assign: useMutation({
      mutationFn: ({ supervisorId, monitorId }: { supervisorId: string; monitorId: string }) =>
        SupervisorsApi.assignMonitor(supervisorId, monitorId),
      onSuccess: refreshAll,
    }),
    remove: useMutation({ mutationFn: SupervisorsApi.removeMonitor, onSuccess: refreshAll }),
  };
}

/* ─── Coordinadores ─── */

export function useCoordinators(params: { page: number; limit: number }) {
  return useQuery({ queryKey: keys.coordinators(params), queryFn: () => CoordinatorsApi.list(params), placeholderData: keepPreviousData });
}

export function useCoordinatorMutations() {
  const client = useQueryClient();
  const refresh = () => client.invalidateQueries({ queryKey: ["coordinators"] });
  return {
    create: useMutation({ mutationFn: CoordinatorsApi.create, onSuccess: refresh }),
    update: useMutation({
      mutationFn: ({ id, ...data }: { id: string } & Parameters<typeof CoordinatorsApi.update>[1]) => CoordinatorsApi.update(id, data),
      onSuccess: refresh,
    }),
    deactivate: useMutation({ mutationFn: CoordinatorsApi.deactivate, onSuccess: refresh }),
  };
}
