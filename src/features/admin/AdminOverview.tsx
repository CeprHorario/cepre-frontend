import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { FiArrowUpRight, FiCheckCircle, FiUsers, FiClock, FiFlag } from 'react-icons/fi';
import type { ReactNode } from 'react';
import { api } from '@/api/client';
import { useAuth } from '@/auth/AuthProvider';
import { useOperations } from '@/features/operations/useOperations';
import { OperationsNotice } from '@/features/operations/OperationsNotice';

export function AdminOverview({classCount,complete,teachers,children}:{classCount?:number;complete?:number;teachers?:number;children?:ReactNode}) {
  const {user}=useAuth(),op=useOperations();
  const warnings=useQuery({queryKey:['incidence-warnings',user?.id],queryFn:({signal})=>api.get<{total:number}>('/incidences/warnings',{signal}).then(response=>response.data),enabled:user?.role==='administrador',retry:false,refetchInterval:60000});
  const approvals=useQuery({queryKey:[...op.scope,'requests', 'dashboard','ADMIN_PENDING'],queryFn:({signal})=>op.read<{total:number}>('requests',{status:'ADMIN_PENDING',page:1,limit:1},signal),enabled:!!op.context,retry:false,staleTime:30000,refetchInterval:60000});
  return <section className="admin-overview" aria-label="Resumen navegable del administrador">
    <div className="admin-overview-heading"><div><span className="admin-eyebrow">VISTA GENERAL</span><h2>Resumen del proceso</h2></div><span>Selecciona un indicador para abrir su módulo</span></div>
    <div className="admin-metrics">
      <Metric to="/admin/gestionar/salones" icon={<FiCheckCircle/>} tone="green" label="Salones completos" value={complete!==undefined&&classCount!==undefined?`${complete} / ${classCount}`:undefined} detail="Con todos sus docentes asignados" progress={complete!==undefined&&classCount?Math.round(complete/classCount*100):undefined}/>
      <Metric to="/admin/gestionar/docentes" icon={<FiUsers/>} tone="blue" label="Docentes registrados" value={teachers} detail="Personal del proceso actual"/>
      <Metric to="/admin/solicitudes?estado=ADMIN_PENDING" icon={<FiClock/>} tone="gold" label="Permisos por aprobar" value={approvals.isError||op.error?undefined:approvals.data?.total} detail={approvals.isError||op.error?'No se pudo consultar · abre solicitudes':'Solicitudes en etapa administrativa'}/>
      <Metric to="/admin/incidencias" icon={<FiFlag/>} tone="red" label="Incidencias pendientes" value={warnings.isError?undefined:warnings.data?.total} detail={warnings.isError?'No se pudo consultar · abre incidencias':'Historial de todos los procesos'}/>
    </div>
    <OperationsNotice compact/>
    {children}
  </section>;
}
function Metric({to,icon,tone,label,value,detail,progress}:{to:string;icon:ReactNode;tone:string;label:string;value?:string|number;detail:string;progress?:number}){
  return <Link to={to} className="admin-metric" data-tone={tone}><div className="admin-metric-top"><span className="admin-metric-icon">{icon}</span><FiArrowUpRight aria-hidden="true"/></div><span className="admin-metric-label">{label}</span><strong className="admin-metric-value">{value??'—'}</strong>{progress!==undefined&&<div className="admin-metric-track" role="progressbar" aria-label="Salones completos" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}><span style={{width:`${progress}%`}}/></div>}<span className="admin-metric-detail">{detail}</span></Link>;
}
