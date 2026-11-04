import { useEffect } from 'react';
import { useBlocker } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth, ROLE_HOME } from '@/auth/AuthProvider';
import { SimpleLayout } from '@/components/layout/ModuleLayout';
import { ButtonLink } from '@/components/ui/Button';
import { api, apiErrorMessage } from '@/api/client';
import { readPartContext } from '../partes/service';
import { IncidencesPanel } from './IncidencesPanel';
import type { PartContext, PartRole } from '../partes/types';
import '@/components/layout/task-workspace.css';

function Workspace({ context, role }: { context: PartContext; role: PartRole }) {
  const draft = useQuery<{ dirty: boolean; busy: boolean }>({ queryKey: ['incidences', 'draft', context.accountId, context.process], queryFn: async () => ({ dirty: false, busy: false }), enabled: false });
  const blocker = useBlocker(Boolean(draft.data?.dirty || draft.data?.busy));
  useEffect(() => { if (blocker.state === 'blocked') { window.alert('Guarda o descarta el borrador de incidencia antes de salir.'); blocker.reset(); } }, [blocker]);
  return <IncidencesPanel context={context} role={role} />;
}
export function IncidencesPage() {
  const { user } = useAuth();
  const context = useQuery({ queryKey: ['parts-context', user?.id, user?.role], queryFn: ({ signal }) => readPartContext(signal), enabled: Boolean(user), retry: false, staleTime: 0, refetchInterval: 15000 });
  if (!user || !['administrador', 'supervisor'].includes(user.role)) return null;
  return <SimpleLayout crumbs={[{ label: 'Panel', to: ROLE_HOME[user.role] }, { label: 'Incidencias' }]}><main className="task-workspace mx-auto flex w-full max-w-[1600px] flex-col gap-4 p-4 sm:p-6"><div className="flex flex-wrap items-center justify-between gap-3"><h1 className="text-2xl font-bold text-marino-900">Incidencias e historial</h1><ButtonLink variant="ghost" to={ROLE_HOME[user.role]}>Volver al panel</ButtonLink></div>{context.isError ? <p role="alert">{apiErrorMessage(context.error)}</p> : context.data && context.data.accountId === user.id ? <Workspace key={`${context.data.accountId}:${context.data.process}`} context={context.data} role={user.role as PartRole} /> : <p>Verificando proceso…</p>}</main></SimpleLayout>;
}
export function IncidenceWarnings() {
  const { user } = useAuth();
  const warnings = useQuery({ queryKey: ['incidence-warnings', user?.id], queryFn: () => api.get<{ total: number; profesor: number; monitor: number; supervisor: number }>('/incidences/warnings').then(r => r.data), enabled: user?.role === 'administrador', refetchInterval: 60000, retry: false });
  return <section className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 p-5" aria-label="Avisos de incidencias"><div><h2 className="font-bold text-marino-900">⚠ Incidencias pendientes · {warnings.data?.total ?? '—'}</h2><p className="text-sm text-ink-500">{warnings.isError ? 'No se pudo consultar el historial. Revisa la conexión o las migraciones.' : `${warnings.data?.profesor ?? 0} de docentes · ${warnings.data?.monitor ?? 0} de monitores · ${warnings.data?.supervisor ?? 0} de supervisores · Todos los procesos`}</p></div><ButtonLink variant="secondary" to="/admin/incidencias">Ver incidencias e historial</ButtonLink></section>;
}
