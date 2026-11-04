import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { FiBell, FiCheck } from 'react-icons/fi';
import { api, apiErrorMessage } from '@/api/client';
import { ROLE_HOME, useAuth } from '@/auth/AuthProvider';
import { useNotifications } from './useNotifications';

export function NotificationBell() {
  const { user } = useAuth();
  const op = useNotifications();
  const cache = useQueryClient();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState('');
  const { notices } = op;
  if (!op.allowed || !user) return null;
  async function resolve(id?: string) {
    if (!op.context) return;
    try {
      await api.post(`/operations/notifications/${id ? `${id}/resolve` : 'resolve-all'}`, {}, { headers: op.headers });
      // The committed change is delivered by the shared stream; no duplicate GET.
      cache.setQueryData(op.key, (previous: import('./useOperations').Page<import('./useOperations').Notification> | undefined) => previous ? { ...previous, pending: id ? Math.max(0, (previous.pending ?? 0) - 1) : 0, data: previous.data.map(notice => !id || notice.id === id ? { ...notice, resolved_at: new Date().toISOString() } : notice) } : previous);
    } catch (e) {
      setError(apiErrorMessage(e));
    }
  }
  const canOpenParts = ['monitor', 'supervisor', 'administrador'].includes(user.role);
  return <div className="relative">
    <button aria-label={`Notificaciones: ${notices.data?.pending ?? 0} pendientes`} aria-expanded={open} onClick={() => setOpen(!open)} className="relative rounded-full p-3 text-white hover:bg-white/10">
      <FiBell size={20} />{!!notices.data?.pending && <span className="absolute right-0 top-0 rounded-full bg-red-600 px-1 text-xs">{notices.data.pending}</span>}
    </button>
    {open && <section aria-label="Notificaciones" className="absolute right-0 z-50 mt-3 w-[min(25rem,90vw)] overflow-hidden rounded-2xl border bg-white text-ink-900 shadow-xl">
      <header className="flex items-center justify-between border-b p-4"><strong>Notificaciones</strong><button onClick={() => void resolve()} className="text-xs text-guinda-700">Resolver todas</button></header>
      {error && <p role="alert">{error}</p>}
      <div className="max-h-96 overflow-auto">
        {notices.data?.data.map(n => {
          const isPart = Boolean(n.kind?.startsWith('part.'));
          const target = isPart ? `${ROLE_HOME[user.role]}/partes` : `${ROLE_HOME[user.role]}/solicitudes`;
          return <article key={n.id} className={`border-b p-4 ${n.resolved_at ? 'opacity-60' : 'bg-amber-50/50'}`}>
            <div className="flex gap-3">
              <div className="min-w-0 flex-1">
                <strong className="text-sm">{n.title}</strong>
                 <p className="mt-1 text-xs leading-relaxed">{n.message}</p>
                 {n.obsolete && <p className="mt-1 text-xs">Obsoleto: el dato ya se completó o dejó de ser exigible. Se conserva el aviso.</p>}
                {(!isPart || canOpenParts) && <Link to={target} onClick={() => setOpen(false)} className="text-xs underline">{isPart ? 'Abrir Partes' : 'Ver solicitud'}</Link>}
              </div>
              <button title="Marcar como resuelta" aria-label="Resolver notificación" disabled={!!n.resolved_at} onClick={() => void resolve(n.id)}><FiCheck /></button>
            </div>
          </article>;
        })}
        {!notices.data?.data.length && <p className="p-5 text-sm">No hay notificaciones.</p>}
      </div>
      {user.role !== 'coordinador' && <Link className="block border-t p-3 text-sm font-semibold text-guinda-700" to={`${ROLE_HOME[user.role]}/solicitudes`} onClick={() => setOpen(false)}>Ver solicitudes y pedir reemplazo</Link>}
      <p className="p-3 text-xs text-muted">Resolver un aviso no aprueba la solicitud.</p>
    </section>}
  </div>;
}
