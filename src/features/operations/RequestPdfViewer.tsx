import {useEffect,useState} from 'react';
import axios from 'axios';
import {Dialog} from '@/components/ui/Overlay';
import {Button} from '@/components/ui/Button';
import {api} from '@/api/client';

export async function requestPdf(path:string,headers:Record<string,string|undefined>,data?:FormData){
  try{return (data?await api.post<Blob>(path,data,{headers:{...headers,'Content-Type':'multipart/form-data'},responseType:'blob'}):await api.get<Blob>(path,{headers,responseType:'blob'})).data;}
  catch(error){if(axios.isAxiosError(error)&&error.response?.data instanceof Blob){const body=await error.response.data.text();try{error.response.data=JSON.parse(body);}catch{/* Keep the original HTTP error if the body is not JSON. */}}throw error;}
}
export function RequestPdfViewer({blob,onClose,title='Expediente de reemplazo'}:{blob:Blob|null;onClose:()=>void;title?:string}){
  const [url,setUrl]=useState('');
  useEffect(()=>{if(!blob){setUrl('');return;}const value=URL.createObjectURL(blob);setUrl(value);return()=>URL.revokeObjectURL(value);},[blob]);
  return <Dialog open={!!blob} onClose={onClose} title={title} size="lg" footer={<><a className="inline-flex min-h-10 items-center justify-center rounded-[10px] border border-field bg-white px-4 text-sm font-semibold text-marino-900 focus-visible:outline-2 focus-visible:outline-guinda-600" href={url} download="Solicitud-reemplazo.pdf">Descargar PDF</a><Button onClick={onClose}>Cerrar visor</Button></>}><p className="mb-3 text-sm text-ink-500">Solicitud institucional y anexos del expediente.</p>{url&&<iframe title={title} src={url} className="h-[70vh] w-full rounded-lg border border-line bg-white"/>}</Dialog>;
}
