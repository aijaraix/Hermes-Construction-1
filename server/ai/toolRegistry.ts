import { randomUUID } from 'node:crypto';
import type { JsonValue } from '../persistence/contracts';
import { hashContent } from '../persistence/integrity';
import type { AiToolCall } from './aiRun';
import { assertPermittedAiOutput } from './aiRun';

const SAFE_TOOLS={'evidence.read':'evidence:read','entity.read':'entity:read','artifact.metadata':'artifact:read','quantity.calculate':'quantity:calculate','unit.convert':'unit:convert','schedule.calculate':'schedule:calculate'} as const;
type ToolName=keyof typeof SAFE_TOOLS;
export interface AiTool {name:ToolName;locality:'LOCAL'|'REMOTE';execute(input:JsonValue,signal:AbortSignal):Promise<{value:JsonValue;evidenceIds?:string[];artifactIds?:string[]}>;}
/** Only named read/calculation seams exist. No arbitrary shell/network/filesystem or actuator registration. */
export class AiToolRegistry {
  private tools=new Map<string,AiTool>();
  register(tool:AiTool) {
    if(!Object.hasOwn(SAFE_TOOLS,tool.name)||this.tools.has(tool.name))throw new Error('AI_TOOL_NOT_REGISTRABLE');
    this.tools.set(tool.name,{name:tool.name,locality:tool.locality,execute:(input,signal)=>tool.execute(input,signal)});
  }
  supports(name:string,localOnly:boolean){const t=this.tools.get(name);return Boolean(t&&(!localOnly||t.locality==='LOCAL'));}
  async call(name:string,input:JsonValue,context:{runId:string;allowedTools:string[];localOnly:boolean;signal:AbortSignal;record(call:AiToolCall):void}):Promise<{value:JsonValue;call:AiToolCall}> {
    const startedAt=new Date().toISOString();const base={toolCallId:`AI-TOOL-${randomUUID()}`,runId:context.runId,toolName:name,permissionScope:SAFE_TOOLS[name]??'NONE',inputHash:hashContent(input),startedAt,outputEvidenceIds:[],outputArtifactIds:[]};
    const tool=this.tools.get(name);
    if(context.signal.aborted||!context.allowedTools.includes(name)||!tool||context.localOnly&&tool.locality!=='LOCAL') {
      context.record({...base,completedAt:new Date().toISOString(),status:'DENIED',failureCode:'TOOL_POLICY_DENIED'});throw new Error('TOOL_POLICY_DENIED');
    }
    try {
      const result=await tool.execute(structuredClone(input),context.signal);assertPermittedAiOutput(result.value);
      if(context.signal.aborted)throw new Error('TOOL_ABORTED');
      const call:AiToolCall={...base,completedAt:new Date().toISOString(),status:'SUCCEEDED',outputEvidenceIds:result.evidenceIds??[],outputArtifactIds:result.artifactIds??[]};context.record(call);return {value:result.value,call};
    } catch {context.record({...base,completedAt:new Date().toISOString(),status:'FAILED',failureCode:'TOOL_EXECUTION_FAILED'});throw new Error('TOOL_EXECUTION_FAILED');}
  }
}
