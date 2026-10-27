import { isAxiosError } from "axios";
import { del, get, patch, post, put, qs, upload, api } from "./client";
import type {
  Admission,
  AvailabilityInterval,
  Area,
  AvailableClassroom,
  AvailableTeacher,
  Classroom,
  ClassScheduleItem,
  ClassTeacher,
  Coordinator,
  Course,
  CurrentUser,
  HourSession,
  JobStatus,
  MonitorAssignment,
  MonitorInformation,
  MonitorScheduleItem,
  MonitorSummary,
  Paginated,
  RuntimeConfig,
  SchemaOption,
  Sede,
  Shift,
  Slot,
  SupervisorMonitors,
  SupervisorOwnMonitor,
  SupervisorSummary,
  SystemStatus,
  TeacherClassSchedule,
  TeacherDetail,
  TeacherOwnClass,
  TeacherSummary,
} from "./types";

export const AuthApi = {
  logout: () => post<{ success: boolean }>("/auth/logout"),
  me: () => get<CurrentUser>("/auth/user-info"),
  googleUrl: () => `${import.meta.env.VITE_API_BACK_URL}/api/auth/google`,
};

export interface CreateAdmissionPayload {
  name: string;
  year: number;
  sede: string;
  started: string;
  finished: string;
  configuration: {
    emailDomain: string;
    createSchedules: boolean;
    sessionMinutes: number;
    breakMinutes: number;
    shifts: {
      name: string;
      startTime: string;
      endTime: string;
      classesToAreas: { area: string; quantityClasses: number }[];
    }[];
  };
}

export const AdmissionsApi = {
  list: () => get<Admission[]>("/admissions"),
  current: () => get<Admission>("/admissions/current"),
  create: (payload: CreateAdmissionPayload) => post<{ success: boolean; data: { name: string } }>("/admissions", payload),
};

export const CatalogApi = {
  areas: () => get<Area[]>("/areas"),
  shifts: () => get<Shift[]>("/shifts"),
  sedes: () => get<Sede[]>("/sedes"),
  hourSessions: () => get<HourSession[]>("/hour-sessions"),
};

export interface CoursePayload {
  name: string;
  color: string;
  description?: string;
}

export const CoursesApi = {
  list: () => get<Course[]>("/courses"),
  get: (id: number) => get<Course>(`/courses/${id}`),
  create: (data: CoursePayload) => post<Course>("/courses", { description: "Sin descripción", ...data }),
  update: (id: number, data: CoursePayload) => put<Course>(`/courses/${id}`, { description: "Sin descripción", ...data }),
  remove: (id: number) => del<unknown>(`/courses/${id}`),
};

export interface ClassMonitorPayload {
  /** Vacío: correo automático, p. ej. 103b@cepr.unsa.pe */
  email?: string;
  dni?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  phonesAdditional?: string[];
  personalEmail?: string;
}

export interface DeactivateResult {
  deactivated: number;
}

export const ClassesApi = {
  createMany: (data: { area_id: number; shift_id: number; quantity: number }) => post<{ created: number; monitorsCreated: number; scheduleBlocks: number; classes: { id: string; name: string }[] }>("/classes/bulk", data),
  list: () => get<Classroom[]>("/classes"),
  /** Crea el salón con el siguiente número del área y turno, su monitor y su horario base */
  create: (data: { area_id: number; shift_id: number; monitor?: ClassMonitorPayload }) => post<Classroom>("/classes", data),
  update: (id: string, data: Partial<Pick<Classroom, "name" | "capacity" | "urlMeet" | "urlClassroom">>) =>
    put<Classroom>(`/classes/${id}`, data),
  remove: (id: string) => del<unknown>(`/classes/${id}`),
  schedules: (id: string) => get<ClassScheduleItem[]>(`/classes/${id}/schedules`),
  teachers: (id: string) => get<ClassTeacher[]>(`/classes/${id}/teachers`),
  ofTeacher: () => get<TeacherOwnClass[]>("/classes/getClassOfTeacher"),
  setMeet: (id: string, urlMeet: string) => patch<unknown>(`/classes/${id}/meet-link`, { urlMeet }),
  setClassroom: (id: string, urlClassroom: string) => patch<unknown>(`/classes/${id}/classroom-link`, { urlClassroom }),
};

export interface CreateTeacherPayload {
  email: string;
  personalEmail?: string;
  jobStatus: JobStatus;
  courseId: number;
  dni: string;
  firstName: string;
  lastName: string;
  phone: string;
  phonesAdditional: string[];
  isCoordinator: boolean;
}

export interface UpdateTeacherPayload {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  maxHours: number;
}

/** Reglas de horas máximas que aplicaba la versión anterior al crear docentes */
function defaultMaxHours(courseId: number, jobStatus: JobStatus): number {
  if (jobStatus === "FullTime") return 16;
  if (courseId === 10) return 21;
  return 20;
}

export const TeachersApi = {
  list: (params: { page: number; limit: number; courseId?: number | null }) =>
    get<Paginated<TeacherSummary>>(`/teachers${qs(params)}`),
  /** Búsqueda por nombre/DNI/correo (devuelve menos campos que list) */
  search: (query: string, page: number, limit: number) =>
    get<Paginated<Partial<TeacherSummary> & Pick<TeacherSummary, "id" | "firstName" | "lastName" | "email">>>(
      `/teachers/search${qs({ query, page, limit })}`,
    ),
  get: (id: string) => get<TeacherDetail>(`/teachers/${id}`),
  create: (data: CreateTeacherPayload) =>
    post<unknown>("/teachers", { ...data, scheduledHours: 0, maxHours: defaultMaxHours(data.courseId, data.jobStatus) }),
  update: (id: string, data: UpdateTeacherPayload) => put<unknown>(`/teachers/${id}`, data),
  /** Eliminación lógica en bloque (todos o ninguno) */
  deactivate: (ids: string[]) => patch<DeactivateResult>("/teachers/deactivate", { ids }),
  schedules: (id: string) => get<TeacherClassSchedule[]>(`/teachers/${id}/schedules`),
  available: (body: { courseId: number; hourSessions: Slot[] }, page = 1, limit = 20) =>
    post<Paginated<AvailableTeacher>>(`/teachers/available${qs({ page, limit })}`, body),
  importFile: (file: File) => upload<unknown>(file.name.endsWith(".csv") ? "/teachers/csv" : "/teachers/json", file),
  exportExcel: async () => {
    const response = await api.get<Blob>("/teachers/export", { responseType: "blob" });
    return response.data;
  },
};

export const SchedulesApi = {
  assignTeacherMany: (teacherId: string, classroomIds: string[]) =>
    patch<unknown>("/schedules/asignar/profesor", { teacherId, classroomIds }),
  unassignTeacherMany: (teacherId: string, classroomIds: string[]) =>
    patch<unknown>("/schedules/desasignar/profesor", { teacherId, classroomIds }),
  availability: (teacherId: string) => get<AvailabilityInterval[]>(`/schedules/teachers/${teacherId}/availability`),
  clearAvailability: (teacherIds: string[]) => post<{ teachers: number; intervals: number }>("/schedules/teachers/availability/clear", { teacherIds }),
  saveAvailability: (teacherId: string, intervals: AvailabilityInterval[]) =>
    put<AvailabilityInterval[]>(`/schedules/teachers/${teacherId}/availability`, { intervals }),
  assignTeacher: (teacherId: string, classId: string) =>
    patch<unknown>("/schedules/asignar/profesor", { teacherId, classroomIds: [classId] }),
  unassignTeacher: (teacherId: string, classId: string) =>
    patch<unknown>("/schedules/desasignar/profesor", { teacherId, classroomIds: [classId] }),
  /** Salones donde el curso del docente cae dentro de los bloques indicados */
  availableClasses: (params: {
    teacherId: string;
    courseId: number;
    slots: Slot[];
    areaId?: number | null;
    shiftId?: number | null;
    page?: number;
    pageSize?: number;
  }) => {
    const horario = JSON.stringify(params.slots.map((s) => ({ id_hour_session: s.hourSessionId, weekday: s.weekday })));
    return get<AvailableClassroom[] | Paginated<AvailableClassroom>>(
      `/schedules/salones/disponibles${qs({
        course_id: params.courseId,
        teacher_id: params.teacherId,
        horario,
        page: params.page ?? 1,
        pageSize: params.pageSize ?? 50,
        area_id: params.areaId,
        shift_id: params.shiftId,
      })}`,
    );
  },
};

export type ImportKind = "docentes" | "monitores" | "supervisores" | "disponibilidad";
export interface ImportPreview {
  schema: string;
  total: number;
  valid: number;
  rows: { line: number; values: Record<string, string>; errors: string[] }[];
}
export interface ImportColumn {
  key: string;
  label: string;
  required: boolean;
  headerRequired: boolean;
  format: string;
  example: string;
  description: string;
}
export const ImportsApi = {
  columns: (kind: ImportKind) => get<ImportColumn[]>(`/imports/${kind}/columns`),
  template: async (kind: ImportKind) => (await api.get<Blob>(`/imports/${kind}/template`, { responseType: "blob" })).data,
  preview: async (kind: ImportKind, file: File) => {
    const form = new FormData(); form.append("archivo", file);
    return (await api.post<ImportPreview>(`/imports/${kind}/preview`, form, { headers: { "Content-Type": "multipart/form-data" } })).data;
  },
  apply: async (kind: ImportKind, file: File, schema: string) => {
    const form = new FormData(); form.append("archivo", file); form.append("schema", schema);
    return (await api.post<{ processed: number; people?: number; teachers?: number; blocks?: number }>(`/imports/${kind}/apply`, form, { headers: { "Content-Type": "multipart/form-data" } })).data;
  },
};

export const MonitorsApi = {
  list: (params: { page: number; limit: number; shift_id?: number | null; area_id?: number | null }) =>
    get<Paginated<MonitorSummary>>(`/monitors${qs(params)}`),
  update: (userId: string, data: { firstName: string; lastName: string; personalEmail: string; phone: string }) =>
    put<unknown>(`/monitors/${userId}`, data),
  /** Eliminación lógica en bloque (todos o ninguno) */
  deactivate: (ids: string[]) => patch<DeactivateResult>("/monitors/deactivate", { ids }),
  filtered: (params: { shiftId: number; hasSupervisor: boolean; page: number; limit: number; areaId?: number | null }) =>
    get<Paginated<MonitorAssignment>>(
      `/monitors/filtered${qs({
        shiftId: params.shiftId,
        has_supervisor: params.hasSupervisor,
        page: params.page,
        limit: params.limit,
        areaId: params.areaId,
      })}`,
    ),
  /** Sin argumento: el monitor autenticado. Con el userId de un monitor: su salón (supervisor/admin) */
  schedule: (monitorUserId?: string) =>
    get<MonitorScheduleItem[]>(monitorUserId ? `/monitors/${monitorUserId}/horario` : "/monitors/cargar/horario"),
  /** El backend responde 404 cuando el salón aún no tiene docentes */
  teachers: (monitorUserId?: string) =>
    get<ClassTeacher[]>(monitorUserId ? `/monitors/${monitorUserId}/teachers` : "/monitors/datos/teachers").catch((error) => {
      if (isAxiosError(error) && error.response?.status === 404) return [];
      throw error;
    }),
  information: () => get<MonitorInformation>("/monitors/information"),
  importFile: (file: File) => upload<unknown>(file.name.endsWith(".csv") ? "/monitors/csv" : "/monitors/json", file),
};

export interface SupervisorPayload {
  email: string;
  firstName: string;
  lastName: string;
  personalEmail?: string;
  phone?: string;
  shift_id?: number;
  dni?: string;
  phonesAdditional?: string[];
}

export const SupervisorsApi = {
  list: (params: { page: number; limit: number }) => get<Paginated<SupervisorSummary>>(`/supervisors${qs(params)}`),
  create: (data: SupervisorPayload) => post<unknown>("/supervisors", data),
  update: (id: string, data: SupervisorPayload) => put<unknown>(`/supervisors/${id}`, data),
  /** Eliminación lógica en bloque (todos o ninguno) */
  deactivate: (ids: string[]) => patch<DeactivateResult>("/supervisors/deactivate", { ids }),
  monitorsOf: (userId: string) => get<SupervisorMonitors>(`/supervisors/${userId}/monitors`),
  ownMonitors: () => get<SupervisorOwnMonitor[]>("/supervisors/getMonitors"),
  assignMonitor: (supervisorId: string, monitorId: string) =>
    patch<unknown>("/supervisors/assignMonitor", { id_supervisor: supervisorId, id_monitor: monitorId }),
  removeMonitor: (monitorId: string) => patch<unknown>("/supervisors/assignMonitor", { id_monitor: monitorId }),
  importFile: (file: File) => upload<unknown>(file.name.endsWith(".csv") ? "/supervisors/csv" : "/supervisors/json", file),
};

export interface CoordinatorPayload {
  email: string;
  dni: string;
  firstName: string;
  lastName: string;
  phone?: string;
  phonesAdditional: string[];
  personalEmail?: string;
  courseId?: number | null;
}

export const CoordinatorsApi = {
  list: (params: { page: number; limit: number }) => get<Paginated<Coordinator>>(`/coordinators${qs(params)}`),
  create: (data: CoordinatorPayload) => post<unknown>("/coordinators", data),
  update: (id: string, data: CoordinatorPayload) => put<unknown>(`/coordinators/${id}`, data),
  /** Eliminación lógica en bloque (todos o ninguno) */
  deactivate: (ids: string[]) => patch<DeactivateResult>("/coordinators/deactivate", { ids }),
};

export interface RuntimeConfigUpdate {
  expectedVersion: number;
  maintenance: { enabled: boolean; message: string; endsAt: string | null };
  schemaRouting: { adminSchema: string; userSchema: string };
  changeReason: string;
}

export const SystemApi = {
  status: () => get<SystemStatus>("/system/status"),
  config: () => get<RuntimeConfig>("/system/runtime-config"),
  updateConfig: (data: RuntimeConfigUpdate) => patch<RuntimeConfig>("/system/runtime-config", data),
  schemas: () => get<SchemaOption[]>("/system/schemas"),
  history: (limit = 20) => get<RuntimeConfig[]>(`/system/runtime-config/history${qs({ limit })}`),
  rollback: (version: number) => post<RuntimeConfig>(`/system/runtime-config/rollback/${version}`),
};
