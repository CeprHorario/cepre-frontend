import {useEffect,useState} from 'react';
import axios from 'axios';
import {Dialog} from '@/components/ui/Overlay';
import {Button} from '@/components/ui/Button';
import {api} from '@/api/client';

export async function requestPdf(path:string,headers:Record<string,string|undefined>,data?:FormData){
  try{return (data?await api.post<Blob>(path,data,{headers,responseType:'blob'}):await api.get<Blob>(path,{headers,responseType:'blob'})).data;}
  catch(error){if(axios.isAxiosError(error)&&error.response?.data instanceof Blob){const body=await error.response.data.text();try{const result=JSON.parse(body);throw new Error(Array.isArray(result.message)?result.message.join('; '):result.message??'No se pudo generar el PDF');}catch(parsed){if(parsed instanceof SyntaxError)throw error;throw parsed;}}throw error;}
}
export function RequestPdfViewer({blob,onClose,title='Expediente de reemplazo'}:{blob:Blob|null;onClose:()=>void;title?:string}){
  const [url,setUrl]=useState('');
  useEffect(()=>{if(!blob){setUrl('');return;}const value=URL.createObjectURL(blob);setUrl(value);return()=>URL.revokeObjectURL(value);},[blob]);
  return <Dialog open={!!blob} onClose={onClose} title={title} size="lg" footer={<><a className="text-sm underline" href={url} download="Solicitud-reemplazo.pdf">Descargar PDF</a><Button onClick={onClose}>Cerrar visor</Button></>}><p className="mb-3 text-sm text-ink-500">Solicitud institucional y anexos del expediente.</p>{url&&<iframe title={title} src={url} className="h-[70vh] w-full rounded-lg border border-line bg-white"/>}</Dialog>;
}
