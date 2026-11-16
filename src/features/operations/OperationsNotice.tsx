import {Link} from 'react-router-dom';
import {useAuth,ROLE_HOME} from '@/auth/AuthProvider';
import {useNotificationInbox} from './useNotificationInbox';
export function OperationsNotice(){const {notices}=useNotificationInbox();const {user}=useAuth();if(!user||!notices.data?.pending)return null;return <aside className="mx-auto my-3 flex max-w-6xl flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-5 py-3 text-sm text-marino-900" aria-label="Solicitudes pendientes"><span>Tienes <strong>{notices.data.pending}</strong> aviso(s) pendiente(s). Revisa la campana de notificaciones.</span>{user.role!=='coordinador'&&<Link className="font-semibold text-guinda-700 underline" to={`${ROLE_HOME[user.role]}/solicitudes`}>Revisar solicitudes</Link>}</aside>;}
