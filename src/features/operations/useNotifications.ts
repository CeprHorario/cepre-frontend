import { useEffect, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/client';
import { useAuth } from '@/auth/AuthProvider';
import type { PartWorkspace } from '@/features/partes/types';
import type { Notification, OperationsContext, Page } from './useOperations';

/** One stream in the application header; the bell and Partes consume its cache. */
export function useNotifications() {
  const { user, status } = useAuth();
  const cache = useQueryClient();
  const [context, setContext] = useState<OperationsContext>();
  const current = useRef<OperationsContext | undefined>(undefined);
  const allowed = !!user && ['administrador', 'profesor', 'docente', 'monitor', 'supervisor', 'coordinador'].includes(user.role);
  const enabled = allowed && (!status?.maintenance || user?.role === 'administrador');
  const account = user?.id, role = user?.role;
  const key = ['notifications', account, role, context?.process];
  const notices = useQuery<Page<Notification>>({ queryKey: key, queryFn: async () => { throw new Error('La bandeja se sincroniza por el stream'); }, enabled: false });
  useEffect(() => {
    if (!enabled || !account || !role) return;
    let active = true, healthy = false, attempt = 0, pending = false, synchronized = false;
    let stream: EventSource | undefined;
    let reconnect: ReturnType<typeof setTimeout> | undefined;
    let polling: ReturnType<typeof setTimeout> | undefined;
    const controller = new AbortController();
    const valid = (ctx: OperationsContext) => ctx.accountId === account && ctx.role === (role === 'docente' ? 'profesor' : role);
    const put = (ctx: OperationsContext, data: Page<Notification>) => {
      if (!active || !valid(ctx)) return;
      const old = current.current;
      if (old && old.process !== ctx.process) {
        cache.removeQueries({ queryKey: ['notifications', account, role, old.process] });
        void cache.invalidateQueries({ queryKey: ['parts-context'] });
        void cache.invalidateQueries({ queryKey: ['operations-context'] });
      }
      current.current = ctx; setContext(ctx);
      cache.setQueryData(['notifications', account, role, ctx.process], data);
    };
    const refreshParts = (process: string, records: { id: number; version: number; force?: boolean }[], resync: boolean) => {
      const sheets = cache.getQueriesData<PartWorkspace>({ queryKey: ['parts', account, process, 'sheet'] });
      for (const [queryKey, data] of sheets) {
        if (!data || (!resync && !records.some(record => data.rows.some(row => row.id === record.id && (record.force || row.version < record.version))))) continue;
        void cache.invalidateQueries({ queryKey, exact: true });
      }
    };
    const fallback = async () => {
      if (!active || healthy) return;
      if (document.visibilityState === 'visible' && navigator.onLine) {
        try {
          const ctx = (await api.get<OperationsContext>('/operations/notifications/context', { signal: controller.signal })).data;
          if (!valid(ctx)) { void cache.invalidateQueries({ queryKey: ['me'] }); return; }
          const data = (await api.get<Page<Notification>>('/operations/notifications', { signal: controller.signal, headers: { 'X-Class-Session-Context': ctx.process, 'X-Class-Session-Account': account } })).data;
          if (!healthy) { put(ctx, data); refreshParts(ctx.process, [], true); }
        } catch { /* The existing auth/status queries own session and maintenance errors. */ }
      }
      if (active && !healthy) polling = setTimeout(() => void fallback(), Math.min(300_000, 60_000 * 2 ** Math.min(attempt, 2)));
    };
    const connect = () => {
      if (!active || !navigator.onLine) return;
      clearTimeout(reconnect);stream?.close();
      stream = new EventSource(`${import.meta.env.VITE_API_BACK_URL}/api/operations/notifications/stream`, { withCredentials: true });
      stream.addEventListener('notifications', (event) => {
        if (!active) return;
        try {
          const data = JSON.parse((event as MessageEvent<string>).data) as Page<Notification> & { context: OperationsContext };
          if (!valid(data.context)) return;
          const reconnecting=!healthy&&synchronized;
          healthy = true; synchronized=true; attempt = 0; clearTimeout(polling); polling = undefined;
          put(data.context, data);
          if(reconnecting)refreshParts(data.context.process,[],true);
        } catch { stream?.close(); }
      });
      stream.addEventListener('parts-changed', (event) => {
        if (!active) return;
        try {
          const data = JSON.parse((event as MessageEvent<string>).data) as { accountId: string; process: string; records: { id: number; version: number }[]; resync: boolean };
          if (data.accountId !== account || data.process !== current.current?.process) return;
          if (document.visibilityState !== 'visible') { pending = true; return; }
          refreshParts(data.process, data.records, data.resync);
        } catch { /* Ignore malformed signals; persisted state is the source of truth. */ }
      });
      stream.addEventListener('context-changed', () => {
        if (!active) return;
        stream?.close(); healthy = false;
        void cache.invalidateQueries({ queryKey: ['me'] });
        void cache.invalidateQueries({ queryKey: ['parts-context'] });
        void cache.invalidateQueries({ queryKey: ['operations-context'] });
        disconnected();
      });
      stream.onerror = disconnected;
      stream.addEventListener('stream-unavailable', disconnected);
    };
    const disconnected = () => {
      if (!active) return;
      stream?.close(); healthy = false;
      if (!polling) polling = setTimeout(() => void fallback(), 60_000);
      clearTimeout(reconnect);
      reconnect = setTimeout(connect, Math.min(60_000, 1000 * 2 ** Math.min(attempt++, 6)) + Math.random() * 500);
    };
    const visible = () => {
      if (document.visibilityState === 'visible' && current.current && pending) { pending = false; refreshParts(current.current.process, [], true); }
      if (navigator.onLine && !healthy) { clearTimeout(reconnect); connect(); }
    };
    connect();
    document.addEventListener('visibilitychange', visible);
    window.addEventListener('online', visible);
    return () => { active = false; controller.abort(); stream?.close(); clearTimeout(reconnect); clearTimeout(polling); document.removeEventListener('visibilitychange', visible); window.removeEventListener('online', visible); current.current = undefined; };
  }, [account, role, enabled, cache]);
  return { context, notices, allowed, key, headers: { 'X-Class-Session-Context': context?.process, 'X-Class-Session-Account': account } };
}
