import type { Operation, OperationDraft, OperationalConfig, PartRecord, RecordDraft } from "./types.ts";

export const academicDate = (date: string) => date.slice(0, 10);
export const limaDate = (now = new Date()) => new Intl.DateTimeFormat("en-CA", { timeZone: "America/Lima", year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
export const limaTime = (instant: string | null) => instant ? new Intl.DateTimeFormat("en-GB", { timeZone: "America/Lima", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(new Date(instant)) : "";
export function limaInstant(date: string, time: string) {
  if (!time) return null;
  if (!/^\d{2}:\d{2}$/.test(time) || Number(time.slice(0, 2)) > 23 || Number(time.slice(3)) > 59) throw new Error("Hora inválida");
  return `${academicDate(date)}T${time}:00-05:00`;
}
export function toDraft(record: PartRecord): RecordDraft {
  return { actualStart: limaTime(record.actualStart), actualEnd: limaTime(record.actualEnd), teachingStatus: record.teachingStatus,
    titularOutcome: record.titularOutcome, effectiveTeacherId: record.effectiveTeacherId ?? "", effectiveMonitorId: record.effectiveMonitorId ?? "", incidents: record.incidents ?? "", reason: "" };
}
export function updatePayload(base: PartRecord, draft: RecordDraft, admin: boolean) {
  const original = toDraft(base);
  const changed = Object.keys(original).filter(key => key !== "reason" && original[key as keyof RecordDraft] !== draft[key as keyof RecordDraft]);
  const body: Record<string, string | number | null> = { expectedVersion: base.version };
  for (const key of changed as (keyof RecordDraft)[]) {
    body[key] = key === "actualStart" || key === "actualEnd" ? limaInstant(base.date, draft[key]) : key.startsWith("effective") ? draft[key] || null : draft[key];
  }
  if (admin) { requireReason(draft.reason); body.reason = draft.reason.trim(); }
  return body;
}
export function requireReason(reason: string) {
  if (reason.trim().length < 3 || reason.length > 2000) throw new Error("El motivo debe tener entre 3 y 2000 caracteres.");
}
export function ordinaryWritable(record: PartRecord, accountId: string, now: number) {
  return !record.deletedAt && now >= Date.parse(record.scheduledStart) && (now < Date.parse(record.editDeadline) || (record.grants ?? []).some(g => g.accountId === accountId && !g.revokedAt && Date.parse(g.expiresAt) > now));
}
export function validateRange(from: string, to: string) {
  const span = Date.parse(to) - Date.parse(from);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(from) || !/^\d{4}-\d{2}-\d{2}$/.test(to) || !Number.isFinite(span) || span < 0 || span > 93 * 86400000) throw new Error("El rango debe ser válido y no superar 93 días.");
}
export function operationDraft(action: Operation, record: PartRecord | null, config: OperationalConfig | null): OperationDraft {
  return { action, reason: "", kind: "TEACHER", personId: "", mode: "EMERGENCY", coverageId: "", status: "AUTHORIZED", grantId: "", accountId: record?.monitorAccountId ?? "", expiresAt: "", date: "", classId: record?.classId ?? "", hourSessionId: record ? String(record.hourSessionId) : "",
    enabled: config?.enabled ?? false, startsOn: config?.startsOn ? academicDate(config.startsOn) : "", endsOn: config?.endsOn ? academicDate(config.endsOn) : "", latenessToleranceMinutes: config?.latenessToleranceMinutes?.toString() ?? "", replacementWaitMinutes: config?.replacementWaitMinutes?.toString() ?? "", alertThresholdMinutes: config?.alertThresholdMinutes?.toString() ?? "", continuityGapMinutes: config?.continuityGapMinutes?.toString() ?? "" };
}
export function configPayload(config: OperationalConfig, draft: OperationDraft) {
  requireReason(draft.reason);
  const body: Record<string, string | number | boolean | null> = { expectedVersion: config.version, reason: draft.reason.trim(), enabled: draft.enabled, startsOn: draft.startsOn || null, endsOn: draft.endsOn || null };
  for (const key of ["latenessToleranceMinutes", "replacementWaitMinutes", "alertThresholdMinutes", "continuityGapMinutes"] as const) {
    const raw = draft[key]; const value = raw === "" ? null : Number(raw);
    if (value !== null && (!Number.isInteger(value) || value < 0 || value > 1440)) throw new Error("Los parámetros deben ser minutos enteros entre 0 y 1440, o quedar pendientes.");
    body[key] = value;
  }
  return body;
}
