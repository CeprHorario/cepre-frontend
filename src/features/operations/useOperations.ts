import { useEffect, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { api, qs } from '@/api/client';
import { useAuth } from '@/auth/AuthProvider';
export interface OperationsContext { accountId:string;process:string;role:string;name:string }
export interface WorkBlock {hourSessionId:number;period:number;className:string;course:string;start:string;end:string}
export interface RequestRow {id:string;requester_user_id:string;replacement_user_id:string;subject_role:string;kind:string;status:string;version:number;reason:string;blocks:WorkBlock[];requester_email?:string;replacement_email?:string;date:string}
export interface Notification {id:string;kind?:string;title:string;message:string;resolved_at:string|null;request_id:string|null;created_at:string;obsolete?:boolean}
export interface Page<T>{data:T[];total:number;pending?:number}
export function useOperations(){
 const {user,status}=useAuth();const cache=useQueryClient();
 const allowed=!!user&&['administrador','profesor','docente','monitor','supervisor'].includes(user.role);
 const enabled=allowed&&(!status?.maintenance||user?.role==='administrador');
 const context=useQuery({queryKey:['operations-context',user?.id,user?.role],queryFn:async({signal})=>{
   const {data}=await api.get<OperationsContext>('/operations/context',{signal});
   if(data.accountId!==user?.id||data.role!==(user.role==='docente'?'profesor':user.role)){
     void cache.invalidateQueries({queryKey:['me']});
     throw new Error('La cuenta o el rol cambió. Verifica tu sesión.');
   }
   return data;
 },enabled,retry:false,staleTime:0,refetchInterval:15000});
 const current=enabled&&!context.isError?context.data:undefined;
 const accountId=current?.accountId,role=current?.role,process=current?.process;
 const scope=['operations',accountId,role,process];
 const previous=useRef<readonly unknown[]|null>(null);
 useEffect(()=>{
   const next=accountId?['operations',accountId,role,process]:null;
   const old=previous.current;
   if(old&&JSON.stringify(old)!==JSON.stringify(next)){
     void cache.cancelQueries({queryKey:old});
     cache.removeQueries({queryKey:old});
   }
   previous.current=next;
 },[cache,accountId,role,process]);
 const headers={'X-Class-Session-Context':current?.process,'X-Class-Session-Account':current?.accountId};
 async function read<T>(path:string,params:Record<string,string|number|undefined>={},signal?:AbortSignal){
   if(!current)throw new Error('Verifica primero la cuenta y el proceso autorizado.');
   try{return (await api.get<T>('/operations/'+path+qs(params),{headers,signal})).data;}
   catch(error){
     if(axios.isAxiosError(error)&&error.response?.data?.code==='CLASS_SESSION_CONTEXT_CHANGED')void cache.invalidateQueries({queryKey:['operations-context']});
     throw error;
   }
 }
 return {context:current,scope,headers,read,loading:enabled&&context.isPending,error:context.error,allowed};
}
