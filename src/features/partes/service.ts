import { api, qs } from "@/api/client";
import type { Paginated } from "@/api/types";
import type { AuditEvent, JournalFilters, MonitorObservation, OperationalConfig, PartAlert, PartContext, PartFilters, PartJournal, PartRecord, PartWorkspace, Person, PersonKind, ReportRow, ReportSummary, Slot, ThumbnailResult, UploadedCapture } from "./types";

const records = "/class-session-records";
const files = "/class-session-files";
export const readPartContext = async (signal?: AbortSignal) => (await api.get<PartContext>(`${records}/context`, { signal })).data;
export const readPartWorkspace = async (signal?: AbortSignal) => (await api.get<PartWorkspace>(`${records}/workspace`, { signal })).data;
export function createPartsApi(process: string, accountId: string) {
 const headers = { "X-Class-Session-Context": process, "X-Class-Session-Account": accountId };
 async function read<T>(path: string, signal?: AbortSignal): Promise<T> { return (await api.get<T>(path, { signal, headers })).data; }
 return {
  agenda: (date: string, signal?: AbortSignal) => read<Paginated<PartRecord>>(`${records}/agenda${qs({ date })}`, signal),
  workspace: (params: { date?: string; classId?: string; shiftId?: number }, signal?: AbortSignal) => read<PartWorkspace>(`${records}/workspace${qs(params)}`, signal),
  thumbnails: (refs: { recordId: number; slot: Slot; fileId: string; generation: string }[], signal?: AbortSignal) => read<{ data: ThumbnailResult[] }>(`${files}/thumbnails${qs({ refs: JSON.stringify(refs) })}`, signal),
  detach: async (id: number, slot: Slot, expectedVersion: number, reason: string) => (await api.post<PartRecord>(`${files}/records/${id}/captures/${slot}/detach`, { expectedVersion, ...(reason ? { reason } : {}) }, { headers })).data,
  followup: (params: { date: string; classId: string; shiftId: number; monitorId: string; page?: number }, signal?: AbortSignal) => read<Paginated<MonitorObservation>>(`${records}/monitor-observations${qs(params)}`, signal),
  followupCreate: async (body: { date: string; classId: string; shiftId: number; monitorId: string; text: string }) => (await api.post<MonitorObservation>(`${records}/monitor-observations`, body, { headers })).data,
  followupUpdate: async (id: string, body: { date: string; classId: string; shiftId: number; monitorId: string; text: string; expectedVersion: number }) => (await api.patch<MonitorObservation>(`${records}/monitor-observations/${id}`, body, { headers })).data,
  followupWithdraw: async (id: string, body: { date: string; classId: string; shiftId: number; monitorId: string; expectedVersion: number; reason: string }) => (await api.post<MonitorObservation>(`${records}/monitor-observations/${id}/withdraw`, body, { headers })).data,
  list: (filters: PartFilters, signal?: AbortSignal) => read<Paginated<PartRecord>>(`${records}${qs({ ...filters })}`, signal),
  journals: (filters: JournalFilters, signal?: AbortSignal) => read<Paginated<PartJournal>>(`${records}/journals${qs(filters)}`, signal),
  journal: async (filters: PartFilters, signal?: AbortSignal) => {
    const first = await read<Paginated<PartRecord>>(`${records}${qs({ ...filters, page: 1, limit: 100 })}`, signal);
    const data = [...first.data];
    for (let page = 2; data.length < first.total; page++) {
      const next = await read<Paginated<PartRecord>>(`${records}${qs({ ...filters, page, limit: 100 })}`, signal);
      if (next.total !== first.total || !next.data.length) throw new Error('La jornada cambió durante la lectura. Actualiza para cargar todos sus bloques.');
      data.push(...next.data);
    }
    if (data.length !== first.total || new Set(data.map(row => row.id)).size !== first.total) throw new Error('La jornada cambió durante la lectura. Actualiza para cargar todos sus bloques.');
    return { ...first, data };
  },
  detail: (id: number, signal?: AbortSignal) => read<PartRecord>(`${records}/${id}`, signal),
  people: (id: number, kind: PersonKind, search: string, page: number, signal?: AbortSignal) => read<Paginated<Person>>(`${records}/${id}/people${qs({ kind, search, page, limit: 25 })}`, signal),
  history: (id: number, page: number, signal?: AbortSignal) => read<AuditEvent[]>(`${records}/${id}/history${qs({ page })}`, signal),
  alerts: (page: number, signal?: AbortSignal) => read<PartAlert[]>(`${records}/alerts${qs({ page })}`, signal),
  configuration: (signal?: AbortSignal) => read<OperationalConfig>(`${records}/configuration`, signal),
  report: (filters: PartFilters, signal?: AbortSignal) => read<Paginated<ReportRow>>(`${records}/reports/detail${qs({ ...filters })}`, signal),
  summary: (filters: PartFilters, signal?: AbortSignal) => read<ReportSummary>(`${records}/reports/summary${qs({ ...filters })}`, signal),
  update: async (id: number, body: object, administrative: boolean) => administrative ? (await api.post<PartRecord>(`${records}/${id}/corrections`, body, { headers })).data : (await api.patch<PartRecord>(`${records}/${id}`, body, { headers })).data,
  operation: async (path: string, body: object, method: "post" | "patch" = "post") => (await api[method](`${records}/${path}`, body, { headers })).data as unknown,
  upload: async (id: number, file: File, administrative: boolean, reason: string) => {
    const form = new FormData(); form.append("file", file); if (reason) form.append("reason", reason);
    return (await api.post<UploadedCapture>(`${files}/records/${id}${administrative ? "/corrections/upload" : ""}`, form, { headers: { ...headers, "Content-Type": "multipart/form-data" } })).data;
  },
  associate: async (id: number, slot: Slot, fileId: string, expectedVersion: number, administrative: boolean, reason: string) => (await api.post<PartRecord>(`${files}/records/${id}${administrative ? "/corrections" : ""}/captures/${slot}`, { fileId, expectedVersion, ...(reason ? { reason } : {}) }, { headers })).data,
  content: (id: string, signal?: AbortSignal) => api.get<Blob>(`${files}/${encodeURIComponent(id)}/content`, { responseType: "blob", signal, headers }).then(r => r.data),
 };
}
