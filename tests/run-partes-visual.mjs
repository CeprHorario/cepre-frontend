import {execFileSync} from 'node:child_process';
import {writeFileSync} from 'node:fs';
const run=args=>execFileSync('playwright-cli',['-s=cepr-parts-visual',...args],{encoding:'utf8',timeout:240000,maxBuffer:1024*1024});
try{
  run(['open','http://127.0.0.1:5188']);
  const result=JSON.parse(run(['--raw','run-code','--filename=tests/partes-visual-browser.cjs']).trim());
  writeFileSync(new URL('../docs/partes-evidence/official-visual.json',import.meta.url),JSON.stringify(result,null,2)+'\n');
  console.log(JSON.stringify({ok:result.ok,comparisons:result.results.length,maxRowDelta:Math.max(...result.results.map(item=>item.rowDelta))}));
}finally{run(['close']);}
