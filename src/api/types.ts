// Tipos de las respuestas reales del backend (horarios-cepre-back)

export type Role = "administrador" | "profesor" | "docente" | "monitor" | "supervisor" | "coordinador";

export type Weekday = "Lunes" | "Martes" | "Miercoles" | "Jueves" | "Viernes" | "Sabado";

export type JobStatus = "FullTime" | "PartTime" | "FreeTime";

export interface Paginated<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface CurrentUser {
  id: string;
  email: string;
  role: Role;
  rawRole: string;
  coordinatorCourseId: number | null;
  firstName?: string;
  lastName?: string;
}

export interface Admission {
  name: string;
  year: number;
  isCurrent?: boolean;
  started: string;
  finished: string;
  description: string | null;
}

export interface Shift {
  id: number;
  name: string;
  startTime: string;
  endTime: string;
}

export interface HourSession {
  id: number;
  shiftId: number;
  period: number;
  startTime: string;
  endTime: string;
  durationMinutes?: number;
  shift: Shift;
}

export interface Area {
  id: number;
  name: string;
  description?: string;
}

export interface Sede {
  id: number;
  name: string;
  description?: string;
  phone?: string | null;
}

export interface Course {
  id: number;
  name: string;
  color: string;
  description?: string;
}

export type ClassStatus = "COMPLETO" | "FALTAN_DOCENTES";

export interface Classroom {
  id: string;
  name: string;
  idSede: number;
  areaId: number;
  shiftId: number;
  monitorId: string | null;
  capacity: number;
  urlMeet: string | null;
  urlClassroom: string | null;
  area: Area;
  shift: Shift;
  sede?: Sede;
  status?: ClassStatus;
}

/** GET /classes/:id/schedules */
export interface ClassScheduleItem {
  id: number;
  weekDay: Weekday;
  startTime: string;
  endTime: string;
  courseName: string;
}

/** GET /classes/:id/teachers */
export interface ClassTeacher {
  teacherId: string;
  firstName: string;
  lastName: string;
  email: string;
  courseName: string;
  phone?: string;
}

export interface TeacherSummary {
  id: string;
  courseId: number;
  courseName: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  jobStatus: JobStatus;
  isCoordinator: boolean;
  maxHours: number | null;
  scheduledHours: number | null;
}

export interface TeacherDetail {
  teacherId: string;
  firstName: string;
  lastName: string;
  email: string;
  personalEmail: string | null;
  phone: string | null;
  courseId: number;
  courseName: string;
}

/** GET /teachers/:id/schedules */
export interface TeacherClassSchedule {
  classId: string;
  className: string;
  courseId: number;
  courseName: string;
  areaId: number;
  areaName: string;
  shiftId: number;
  shiftName: string;
  urlMeet: string | null;
  urlClassroom: string | null;
  schedules: { weekday: Weekday; hourSession: { startTime: string; endTime: string } }[];
}

/** POST /teachers/available */
export interface AvailableTeacher {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  jobStatus: JobStatus;
  isCoordinator: boolean;
}

/** GET /classes/getClassOfTeacher */
export interface TeacherOwnClass {
  name: string;
  shiftId: number;
  monitor: { user: { firstName: string; lastName: string } | null } | null;
  urlMeet: string | null;
  urlClassroom: string | null;
  schedules: { weekday: Weekday; hourSession: { startTime: string; endTime: string } }[];
}

export interface MonitorSummary {
  id: string;
  firstName: string;
  lastName: string;
  personalEmail: string;
  email: string;
  phone: string;
  className: string;
  shift: string;
}

/** GET /monitors/filtered y monitores_asignados */
export interface MonitorAssignment {
  monitorId: string;
  className: string;
  shiftId: number;
  shiftName: string;
  areaId: number;
  areaName: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface MonitorInformation {
  monitorId: string;
  salon: string;
  salon_id: string;
  urlMeet: string | null;
  urlClassroom: string | null;
  nombres?: string;
  apellidos?: string;
}

/** GET /monitors/cargar/horario */
export interface MonitorScheduleItem {
  weekday: Weekday;
  startTime: string;
  endTime: string;
  courseName: string;
  shiftId: number;
  hasTeacher: boolean;
}

export interface SupervisorSummary {
  id: string;
  shiftId: number | null;
  firstName: string;
  lastName: string;
  personalEmail: string | null;
  email: string | null;
  phone: string | null;
  dni?: string;
  phonesAdditional?: string[];
}

export interface SupervisorMonitors {
  firstName?: string;
  lastName?: string;
  email?: string;
  shift_id?: number;
  monitores_asignados: MonitorAssignment[];
}

/** GET /supervisors/getMonitors (supervisor autenticado) */
export interface SupervisorOwnMonitor {
  user_id: string;
  email: string;
  phone?: string | null;
  personalEmail?: string | null;
  classes?: { name: string; urlMeet: string | null; urlClassroom: string | null } | null;
  profile?: { firstName: string; lastName: string; phone?: string | null } | null;
}

export interface Coordinator {
  id: string;
  email: string;
  dni: string | null;
  firstName: string;
  lastName: string;
  phone: string | null;
  phonesAdditional: string[];
  personalEmail: string | null;
  courseId: number | null;
  courseName?: string | null;
  course?: { id: number; name: string } | null;
}

export interface RuntimeConfig {
  version: number;
  maintenance: { enabled: boolean; message: string; endsAt: string | null };
  schemaRouting: { adminSchema: string; userSchema: string };
  updatedAt: string | null;
  updatedBy: { id: string; email: string };
  changeReason: string;
}

export interface SystemStatus {
  maintenance: boolean;
  message: string;
  endsAt: string | null;
}

export interface SchemaOption {
  name: string;
  year: number;
}

/** GET /schedules/salones/disponibles: salón con los bloques del curso del docente */
export interface AvailableClassroom extends Omit<Classroom, "area" | "status"> {
  area?: Area;
  schedules: { weekday: Weekday; hourSession: { id: number; startTime: string; endTime: string } }[];
}

/** Bloque horario que espera el backend para disponibilidad */
export interface Slot {
  hourSessionId: number;
  weekday: Weekday;
}

/** Disponibilidad por tiempo real, compartida entre turnos. */
export interface AvailabilityInterval {
  weekday: Weekday;
  start: string;
  end: string;
}
