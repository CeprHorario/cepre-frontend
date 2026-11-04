import { createServer } from 'node:http';
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root=fileURLToPath(new URL('../',import.meta.url));
const session='-s=cepr-parts-budget';
const run=(args,timeout=120000)=>execFileSync('playwright-cli',[session,...args],{cwd:root,encoding:'utf8',timeout,maxBuffer:1024*1024});
const output=new URL('../docs/partes-evidence/official-budget.json',import.meta.url);
let timeout;
let finished=false;
const server=createServer((request,response)=>{
  if(request.method!=='POST'||request.url!=='/result'){response.writeHead(404).end();return;}
  let body='';
  request.on('data',chunk=>{body+=chunk;if(body.length>1024*1024)request.destroy();});
  request.on('end',()=>{
    let result;
    try { result=JSON.parse(body); } catch { response.writeHead(400).end(); process.exitCode=1; return; }
    if(result.progress){console.log(JSON.stringify(result));response.writeHead(200).end();return;}
    if(finished){response.writeHead(409).end();return;}
    finished=true;
    writeFileSync(output,JSON.stringify(result,null,2)+'\n');
    response.writeHead(200).end();
    console.log(JSON.stringify(result));
    if(!result.ok)process.exitCode=1;
    clearTimeout(timeout);server.close();try{run(['close']);}catch{}
  });
});
await new Promise(resolve=>server.listen(5190,'127.0.0.1',resolve));
timeout=setTimeout(()=>{if(finished)return;console.error('El navegador no entregó el presupuesto completo');process.exitCode=1;server.close();try{run(['close']);}catch{};},1800000);
try {
  run(['open','http://127.0.0.1:5187']);
  const source=readFileSync(new URL('./partes-budget-browser.cjs',import.meta.url),'utf8');
  // El comando permanece abierto durante toda la medición; el callback local conserva el resultado.
  const wrapped=`async page => {const result=await (${source})(page);await page.request.post('http://127.0.0.1:5190/result',{data:result}).catch(()=>{});return result;}`;
  console.log(run(['--raw','run-code',wrapped],1800000).trim());
} catch(error) {clearTimeout(timeout);server.close();try{run(['close']);}catch{};throw error;}
