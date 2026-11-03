import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/auth/AuthProvider';
import { api } from '@/api/client';
import { readPartContext } from '../partes/service';

export interface DniIncidenceCount { dni: string; total: number; pending: number }
export function useDniIncidenceCounts(dnis: (string | null | undefined)[], enabled = true) {
  const { user } = useAuth();
  const context = useQuery({ queryKey: ['parts-context', user?.id, user?.role], queryFn: ({ signal }) => readPartContext(signal), enabled: enabled && user?.role === 'administrador', staleTime: 0, refetchInterval: 15000, retry: false });
  const selected = context.data?.accountId === user?.id ? context.data : undefined;
  const unique = [...new Set(dnis.filter((dni): dni is string => Boolean(dni && /^\d{8}$/.test(dni))))].sort();
  const counts = useQuery({
    queryKey: ['incidence-dni-counts', selected?.accountId, selected?.process, unique],
    queryFn: ({ signal }) => api.post<DniIncidenceCount[]>('/incidences/dni-summary', { dnis: unique }, { signal, headers: { 'X-Class-Session-Context': selected!.process, 'X-Class-Session-Account': selected!.accountId } }).then(r => r.data),
    enabled: enabled && Boolean(selected) && unique.length > 0, retry: false, staleTime: 0, refetchInterval: 60000,
  });
  return { context: selected, counts: new Map(counts.data?.map(row => [row.dni, row])), loading: enabled && unique.length > 0 && (context.isPending || counts.isPending), error: enabled ? context.error ?? counts.error : null };
}
