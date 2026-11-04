import type { Operation, OperationDraft, OperationalConfig, PartEditor, PartRecord, RecordDraft } from "./types.ts";
export const editorFields: Record<PartEditor, (keyof RecordDraft)[]> = { hours: ['actualStart', 'actualEnd'], state: ['classState', 'replacementEmail'], observations: ['structuredObservations'] };
export function editorDraft(base: PartRecord, draft: RecordDraft, editor: PartEditor) {
  const original = toDraft(base);
  return { ...original, ...Object.fromEntries(editorFields[editor].map(key => [key, draft[key]])), reason: draft.reason } as RecordDraft;
}

export const academicDate = (date: string) => date.slice(0, 10);
export const limaDate = (now = new Date()) => new Intl.DateTimeFormat("en-CA", { timeZone: "America/Lima", year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
export const limaTime = (instant: string | null) => instant ? new Intl.DateTimeFormat("en-GB", { timeZone: "America/Lima", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(new Date(instant)) : "";
export function limaInstant(date: string, time: string) {
  if (!time) return null;
  if (!/^\d{2}:\d{2}$/.test(time) || Number(time.slice(0, 2)) > 23 || Number(time.slice(3)) > 59) throw new Error("Hora inválida");
  return `${academicDate(date)}T${time}:00-05:00`;
}
export function toDraft(record: PartRecord): RecordDraft {
  return { structuredObservations: record.structuredObservations ?? [], classState: record.classState ?? '', actualStart: limaTime(record.actualStart), actualEnd: limaTime(record.actualEnd), teachingStatus: record.teachingStatus,
    titularOutcome: record.titularOutcome, effectiveTeacherId: record.effectiveTeacherId ?? "", effectiveMonitorId: record.effectiveMonitorId ?? "", replacementEmail: "", incidents: record.incidents ?? "", reason: "" };
}
/**
 * Solo envía la intención del editor. Una propuesta RN/RE es una operación propia:
 * correo + estado + clave idempotente, sin arrastrar horas o notas de la fila.
 * `requiresReason` cubre administración y habilitación excepcional de M/S.
 */
export function updatePayload(base: PartRecord, draft: RecordDraft, admin: boolean, requiresReason = admin, operationId?: string) {
  const email = draft.replacementEmail.trim().toLowerCase();
  const body: Record<string, unknown> = { expectedVersion: base.version };
  if (email) {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Ingresa un correo de docente válido.");
    if (draft.classState !== 'RN' && draft.classState !== 'RE') throw new Error("Selecciona RN o RE para proponer un reemplazo.");
    const original = toDraft(base);
    const extra = Object.keys(original).filter(key => !['reason', 'replacementEmail', 'classState'].includes(key) && JSON.stringify(original[key as keyof RecordDraft]) !== JSON.stringify(draft[key as keyof RecordDraft]));
    if (extra.length) throw new Error("Guarda horas, estado y notas por separado; la propuesta de reemplazo es una operación propia.");
    body.classState = draft.classState;
    body.replacementEmail = email;
    body.operationId = operationId ?? crypto.randomUUID();
    if (requiresReason) { requireReason(draft.reason); body.reason = draft.reason.trim(); }
    return body;
  }
  const original = toDraft(base);
  const changed = Object.keys(original).filter(key => key !== "reason" && key !== "replacementEmail" && JSON.stringify(original[key as keyof RecordDraft]) !== JSON.stringify(draft[key as keyof RecordDraft]));
  for (const key of changed as (keyof RecordDraft)[]) {
    if (key === 'structuredObservations') { body.structuredObservations = draft.structuredObservations.map(({id,target,description,firstName,lastName})=>({id,target,description,...(target==='STUDENT'?{firstName,lastName}:{})})); continue; }
    if (key === 'incidents' && !admin) continue;
    if (key === 'teachingStatus' || key === 'titularOutcome') continue;
    if (key === 'classState') { body.classState = draft.classState || null; if (draft.classState === 'SD') { body.actualStart = null; body.actualEnd = null; } continue; }
    if (!admin && key.startsWith('effective')) continue;
    body[key] = key === "actualStart" || key === "actualEnd" ? limaInstant(base.date, draft[key]) : key.startsWith("effective") ? draft[key] || null : draft[key];
  }
  if (requiresReason) { requireReason(draft.reason); body.reason = draft.reason.trim(); }
  return body;
}
export function requireReason(reason: string) {
  if (reason.trim().length < 3 || reason.length > 2000) throw new Error("El motivo debe tener entre 3 y 2000 caracteres.");
}
export function editStartsAt(record: PartRecord) {
  return record.editOpensAt ? Date.parse(record.editOpensAt) : Date.parse(record.scheduledStart) - (record.period === 1 ? 5 * 60_000 : 0);
}
export function ordinaryWritable(record: PartRecord, accountId: string, now: number) {
  return record.monitorAccountId === accountId && !record.deletedAt && now >= editStartsAt(record) && now < Date.parse(record.editDeadline);
}
export function validateRange(from: string, to: string) {
  const span = Date.parse(to) - Date.parse(from);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(from) || !/^\d{4}-\d{2}-\d{2}$/.test(to) || !Number.isFinite(span) || span < 0 || span > 93 * 86400000) throw new Error("El rango debe ser válido y no superar 93 días.");
}
export function operationDraft(action: Operation, record: PartRecord | null, config: OperationalConfig | null): OperationDraft {
  return { action, operationId: crypto.randomUUID(), reason: "", kind: "TEACHER", personId: "", mode: "EMERGENCY", coverageId: "", status: "AUTHORIZED", grantId: "", accountId: record?.monitorAccountId ?? "", expiresAt: "", date: "", classId: record?.classId ?? "", hourSessionId: record ? String(record.hourSessionId) : "",
    enabled: config?.enabled ?? false, startsOn: config?.startsOn ? academicDate(config.startsOn) : "", endsOn: config?.endsOn ? academicDate(config.endsOn) : "", latenessToleranceMinutes: config?.latenessToleranceMinutes?.toString() ?? "", replacementWaitMinutes: config?.replacementWaitMinutes?.toString() ?? "", alertThresholdMinutes: config?.alertThresholdMinutes?.toString() ?? "", continuityGapMinutes: config?.continuityGapMinutes?.toString() ?? "", escalationDelayMinutes: config?.escalationDelayMinutes?.toString() ?? '' };
}
export function configPayload(config: OperationalConfig, draft: OperationDraft) {
  requireReason(draft.reason);
  const body: Record<string, string | number | boolean | null> = { expectedVersion: config.version, reason: draft.reason.trim(), enabled: draft.enabled, startsOn: draft.startsOn || null, endsOn: draft.endsOn || null };
  for (const key of ["latenessToleranceMinutes", "replacementWaitMinutes", "alertThresholdMinutes", "continuityGapMinutes"] as const) {
    const raw = draft[key]; const value = raw === "" ? null : Number(raw);
    if (value !== null && (!Number.isInteger(value) || value < 0 || value > 1440)) throw new Error("Los parámetros deben ser minutos enteros entre 0 y 1440, o quedar pendientes.");
    body[key] = value;
  }
  if (draft.escalationDelayMinutes !== undefined) {
    const value = draft.escalationDelayMinutes === '' ? null : Number(draft.escalationDelayMinutes);
    if (value !== null && (!Number.isInteger(value) || value < 0 || value > 1440)) throw new Error('El escalado debe ser un número de minutos entre 0 y 1440, o quedar pendiente.');
    body.escalationDelayMinutes = value;
  }
  return body;
}
