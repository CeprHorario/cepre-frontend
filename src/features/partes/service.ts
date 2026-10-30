import { api, qs } from "@/api/client";
import type { Paginated } from "@/api/types";
import type { AuditEvent, OperationalConfig, PartAlert, PartContext, PartFilters, PartRecord, Person, PersonKind, ReportRow, ReportSummary, Slot, UploadedCapture } from "./types";

const records = "/class-session-records";
const files = "/class-session-files";
export const readPartContext = async (signal?: AbortSignal) => (await api.get<PartContext>(`${records}/context`, { signal })).data;
export function createPartsApi(process: string, accountId: string) {
 const headers = { "X-Class-Session-Context": process, "X-Class-Session-Account": accountId };
 async function read<T>(path: string, signal?: AbortSignal): Promise<T> { return (await api.get<T>(path, { signal, headers })).data; }
 return {
  agenda: (date: string, signal?: AbortSignal) => read<Paginated<PartRecord>>(`${records}/agenda${qs({ date })}`, signal),
  list: (filters: PartFilters, signal?: AbortSignal) => read<Paginated<PartRecord>>(`${records}${qs({ ...filters })}`, signal),
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
    const form = new FormData(); form.append("file", file); if (administrative) form.append("reason", reason);
    return (await api.post<UploadedCapture>(`${files}/records/${id}${administrative ? "/corrections/upload" : ""}`, form, { headers: { ...headers, "Content-Type": "multipart/form-data" } })).data;
  },
  associate: async (id: number, slot: Slot, fileId: string, expectedVersion: number, administrative: boolean, reason: string) => (await api.post<PartRecord>(`${files}/records/${id}${administrative ? "/corrections" : ""}/captures/${slot}`, { fileId, expectedVersion, ...(administrative ? { reason } : {}) }, { headers })).data,
  content: (id: string, signal?: AbortSignal) => api.get<Blob>(`${files}/${encodeURIComponent(id)}/content`, { responseType: "blob", signal, headers }).then(r => r.data),
 };
}
