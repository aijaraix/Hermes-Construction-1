import { fork } from 'node:child_process';
import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { createRequire } from 'node:module';
import { IfcNormalizationError, type IfcNormalizer, type NormalizedIfcModel } from './IfcNormalizer';

/** Trusted service configuration, never populated from upload JSON. */
export interface IfcWorkerLimits { maxBytes?: number; timeoutMs?: number; workerFile?: string; }
export class WebIfcServerNormalizer implements IfcNormalizer {
  readonly parser: { implementation: 'web-ifc'; version: string };
  private maxBytes: number; private timeoutMs: number; private workerFile: string;
  constructor(limits: IfcWorkerLimits={}) {
    const require=createRequire(path.resolve('package.json'));
    const entry=require.resolve('web-ifc');
    this.parser={implementation:'web-ifc',version:require(path.join(path.dirname(entry),'package.json')).version};
    this.maxBytes=limits.maxBytes??64*1024*1024; this.timeoutMs=limits.timeoutMs??30000;
    this.workerFile=limits.workerFile??path.resolve(existsSync('server/bim/ifcWorker.cjs')?'server/bim/ifcWorker.cjs':'dist/ifcWorker.cjs');
    if(!Number.isSafeInteger(this.maxBytes)||this.maxBytes<=0||this.maxBytes>64*1024*1024||!Number.isSafeInteger(this.timeoutMs)||this.timeoutMs<=0||this.timeoutMs>120000)throw new Error('Invalid IFC worker bounds');
  }
  async normalize(bytes: Uint8Array): Promise<NormalizedIfcModel> {
    if(!bytes.length)throw new IfcNormalizationError('EMPTY','IFC source is empty');
    if(bytes.length>this.maxBytes)throw new IfcNormalizationError('SIZE_LIMIT','IFC source exceeds configured size limit');
    const directory=await fs.mkdtemp(path.join(os.tmpdir(),'hermes-ifc-'));
    try {
      await fs.chmod(directory,0o700);
      const input=path.join(directory,'source.ifc'),output=path.join(directory,'normalized.json');
      await fs.writeFile(input,bytes,{flag:'wx',mode:0o600});
      await new Promise<void>((resolve,reject)=>{
        const child=fork(this.workerFile,[input,output],{cwd:directory,execArgv:['--max-old-space-size=256'],env:{NODE_ENV:'production'},stdio:['ignore','ignore','ignore','ipc']});
        let detail='web-ifc could not normalize this source';let timedOut=false;
        const timer=setTimeout(()=>{timedOut=true;child.kill('SIGKILL');},this.timeoutMs);
        child.on('message',(message:unknown)=>{if(message&&typeof message==='object'&&'error' in message)detail=String(message.error).slice(0,500);});
        child.once('error',error=>{clearTimeout(timer);reject(new IfcNormalizationError('WORKER_UNAVAILABLE',error.message));});
        child.once('exit',code=>{clearTimeout(timer);if(timedOut)reject(new IfcNormalizationError('TIMEOUT','IFC parser deadline exceeded; child terminated'));else if(code!==0)reject(new IfcNormalizationError('PARSE_FAILED',detail));else resolve();});
      });
      if((await fs.stat(output)).size>32*1024*1024)throw new IfcNormalizationError('OUTPUT_LIMIT','Normalized output exceeds limit');
      return JSON.parse(await fs.readFile(output,'utf8')) as NormalizedIfcModel;
    } finally {await fs.rm(directory,{recursive:true,force:true});}
  }
}
