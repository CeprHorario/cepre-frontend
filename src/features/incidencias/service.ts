import { api, qs } from '@/api/client';
import type { Paginated } from '@/api/types';
export type SubjectRole = 'profesor' | 'monitor' | 'supervisor' | 'coordinador' | 'administrador';
export interface Incidence { id: string; subject_dni: string; subject_role: SubjectRole; subject_name: string; process_schema: string; title: string; description: string; occurred_at: string; created_at: string; status: 'OPEN' | 'RESOLVED'; version: number }
export interface IncidencePerson { id: string; name: string; dni: string | null; role: SubjectRole }
export interface IncidencePayload { operationId: string; subjectAccountId: string; subjectRole: SubjectRole; recordId?: number; title: string; description: string; occurredAt: string }
export function incidenceApi(process: string, accountId: string) {
  const headers = { 'X-Class-Session-Context': process, 'X-Class-Session-Account': accountId };
  return {
    list: (params: { page: number; dni?: string; status?: string }) => api.get<Paginated<Incidence>>(`/incidences${qs(params)}`, { headers }).then(r => r.data),
    people: (params: { subjectRole: SubjectRole; recordId?: number; search: string; page: number }) => api.get<Paginated<IncidencePerson>>(`/incidences/people${qs(params)}`, { headers }).then(r => r.data),
    create: (data: IncidencePayload) => api.post<Incidence>('/incidences', data, { headers }).then(r => r.data),
    resolve: (row: Incidence, reason: string) => api.patch(`/incidences/${row.id}`, { expectedVersion: row.version, status: row.status === 'OPEN' ? 'RESOLVED' : 'OPEN', reason }, { headers }),
    history: (id: string) => api.get<{ id: number; action: string; reason: string | null; created_at: string }[]>(`/incidences/${id}/history`, { headers }).then(r => r.data),
  };
}
