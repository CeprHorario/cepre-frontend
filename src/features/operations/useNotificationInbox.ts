import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/auth/AuthProvider';
import type { Notification, OperationsContext, Page } from './useOperations';

/** Read-only subscribers share the header's single stream and the same account/process cache. */
export function useNotificationInbox() {
  const { user, status } = useAuth();
  const allowed = !!user && ['administrador','profesor','docente','monitor','supervisor','coordinador'].includes(user.role);
  const enabled = allowed && (!status?.maintenance || user?.role === 'administrador');
  const account = user?.id, role = user?.role;
  const cached = useQuery<OperationsContext>({ queryKey:['notification-context',account,role], enabled:false });
  const context = enabled && cached.data?.accountId === account ? cached.data : undefined;
  const key = ['notifications',account,role,context?.process];
  const notices = useQuery<Page<Notification>>({ queryKey:key, enabled:false });
  return {context,notices,allowed,enabled,account,role,key,headers:{'X-Class-Session-Context':context?.process,'X-Class-Session-Account':account}};
}
