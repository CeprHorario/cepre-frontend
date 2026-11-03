import { useQuery } from '@tanstack/react-query';
import { api, qs } from '@/api/client';
import { useAuth } from '@/auth/AuthProvider';
import { useCurrentAdmission } from '@/api/queries';
export interface OperationsContext { accountId:string;process:string;role:string;name:string }
export interface WorkBlock {hourSessionId:number;period:number;className:string;course:string;start:string;end:string}
export interface RequestRow {id:string;requester_user_id:string;replacement_user_id:string;subject_role:string;kind:string;status:string;version:number;reason:string;blocks:WorkBlock[];requester_email?:string;replacement_email?:string;date:string}
export interface Notification {id:string;title:string;message:string;resolved_at:string|null;request_id:string;created_at:string}
export interface Page<T>{data:T[];total:number;pending?:number}
export function useOperations(){
 const {user}=useAuth();const admission=useCurrentAdmission(user?.role==='administrador');
 const allowed=!!user&&['administrador','profesor','docente','monitor','supervisor'].includes(user.role);
 const context=useQuery({queryKey:['operations-context',user?.id,user?.role,admission.data?.name],queryFn:async({signal})=>(await api.get<OperationsContext>('/operations/context',{signal})).data,enabled:allowed&&!!admission.data,staleTime:60000});
 const scope=['operations',context.data?.accountId,context.data?.role,context.data?.process];
 const headers={'X-Class-Session-Context':context.data?.process,'X-Class-Session-Account':context.data?.accountId};
 async function read<T>(path:string,params:Record<string,string|number|undefined>={},signal?:AbortSignal){return (await api.get<T>('/operations/'+path+qs(params),{headers,signal})).data;}
 return {context:context.data,scope,headers,read,loading:context.isPending,error:context.error,allowed};
}
