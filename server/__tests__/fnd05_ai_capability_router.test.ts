import { afterEach, describe, expect, it, vi } from 'vitest';
const sdk=vi.hoisted(()=>({generate:vi.fn()}));
vi.mock('@google/genai',()=>({GoogleGenAI:class {models={generateContent:sdk.generate};}}));
import { CapabilityRouter } from '../ai/capabilityRouter';
import { ProviderRegistry } from '../ai/providerRegistry';
import { AiToolRegistry } from '../ai/toolRegistry';
import { ScenarioAiRuntime } from '../ai/scenarioRuntime';
import { GeminiProviderAdapter } from '../ai/providers/geminiAdapter';
import { GeminiReasoningProvider } from '../reasoningProvider';
import { AgentExecutionService } from '../agentExecutionService';
import { QuotaIntegrityEngine } from '../quotaIntegrityEngine';
import { ManagerReviewService } from '../managerReviewService';
import { ReasoningBudgetManager } from '../reasoningBudgetManager';
import { aiRunToClaim, type AiRun } from '../ai/aiRun';
import { promoteClaim } from '../../src/lib/projectEvidence';
import type { AgentContract, CompetencyScenario, ValidationResult } from '../../src/types/hermes';
import type { AiProviderAdapter, AiProviderOutput, AiRequest, AiRoutingPolicy } from '../ai/provider';

const policy=():AiRoutingPolicy=>({version:'EXPLICIT-UNIT-TEST',allowModelExecution:false,allowRemote:true,allowPaidExecution:false,fallback:'ELIGIBLE',maxAttempts:4,capabilityTools:[],roleTools:[],projectTools:[]});
const request=():AiRequest=>({requestId:'TEST-1',roleId:'TEST-ROLE',capability:'reasoning.standard',input:{task:'Fixture'},promptVersion:'1',taskVersion:'1',schemaVersion:'1',outputSchema:{type:'object'},privacy:'PROJECT_PRIVATE',risk:'GENERAL',evidenceIds:['EV1'],sourceIds:['SOURCE1'],chunkIds:['CH1'],structuredOutput:true});
function fake(id='REMOTE',locality:'LOCAL'|'REMOTE'='REMOTE',execute?:AiProviderAdapter['execute']):AiProviderAdapter {
  return {descriptor:{providerId:id,adapterId:id,adapterVersion:'test-only',executionKind:'TEST_DOUBLE',locality,privacy:locality==='LOCAL'?['PUBLIC','PROJECT_PRIVATE','LOCAL_ONLY']:['PUBLIC','PROJECT_PRIVATE'],modalities:['TEXT'],structuredOutput:true,tools:true,streaming:false,models:[{modelId:`${id}-fixture`,capabilities:['reasoning.standard','local.private'],tier:locality==='LOCAL'?'TIER_1_LOCAL_SMALL':'TIER_3_REMOTE_FRONTIER',priority:0,estimatedCostUsd:0}]},health:()=> 'AVAILABLE',execute:execute??vi.fn(async():Promise<AiProviderOutput>=>({status:'SUCCEEDED',output:{proposal:id},usage:{source:'ESTIMATED',inputTokens:10,outputTokens:5,costSource:'UNKNOWN'}}))};
}
function router(adapters:AiProviderAdapter[],tools?:AiToolRegistry){const registry=new ProviderRegistry();adapters.forEach(a=>registry.register(a));return new CapabilityRouter(registry,tools);}
const role:AgentContract={roleId:'TEST-ROLE',roleName:'Synthetic test role',discipline:'Architecture',managerRoleId:'MANAGER',responsibilities:[],inputs:[],outputs:[],tools:[],knowledgeDomains:[],canConsult:[],cannotDo:[],validationRequirements:[],escalationRules:[],knowledgeCurriculum:[],readinessStatus:'UNTESTED' as any,competencyScore:0,knowledgeCoveragePct:0,isCoreHouse1Role:false};
const scenario={scenarioId:'SCENARIO-TEST',agentRoleId:role.roleId,discipline:'Architecture',difficulty:'PRACTITIONER',scenarioTitle:'Owned synthetic fixture',scenarioDescription:'No live inference',location:'Fixture',jurisdiction:'Fixture',roomId:'ROOM',buildingType:'Synthetic fixture',inputs:{x:1},constraints:{},availableEvidence:[],hiddenValidationRules:{mustNotReachProvider:true},expectedOutputSchema:{proposal:'string'},version:'1',createdAt:'2026-09-30T00:00:00Z',knowledgePackId:'PACK'} as CompetencyScenario;
const params=()=>({agentRole:role,scenario,knowledgePack:{packId:'PACK',versionTag:'1'} as any,retrievedChunks:[]});
afterEach(()=>{AgentExecutionService.configureAiRuntime(new ScenarioAiRuntime());QuotaIntegrityEngine.setMockQuotaExhausted(false);vi.unstubAllEnvs();sdk.generate.mockReset();});

describe('FND-05 provider-neutral routing — test doubles only, no live-provider acceptance',()=>{
  it('ROUTE-01/02 swaps registered providers without changing construction-domain caller',async()=>{
    const calls:AiRequest[]=[];const first=fake('A','REMOTE',async r=>{calls.push(r);return {status:'SUCCEEDED',output:{proposal:'A'}};});
    AgentExecutionService.configureAiRuntime(new ScenarioAiRuntime(router([first]),policy()));
    const a=await AgentExecutionService.executeAgentScenario(params());
    AgentExecutionService.configureAiRuntime(new ScenarioAiRuntime(router([fake('B')]),policy()));
    const b=await AgentExecutionService.executeAgentScenario(params());
    expect(a.executionRecord.modelProvider).toBe('A');expect(b.executionRecord.modelProvider).toBe('B');expect(calls[0].capability).toBe('reasoning.standard');
    expect(calls[0]).not.toHaveProperty('modelId');expect(calls[0].reasoningContext?.scenario.hiddenValidationRules).toEqual({});expect(a.executionRecord.aiRunId).toBe(a.aiRun?.runId);
    expect(a.executionRecord.executionMode).toBe('DETERMINISTIC_SIMULATION');expect(a.validation.passed).toBe(false); // test double cannot certify
  });
  it('ROUTE-03 unknown and unregistered capabilities fail explicitly',async()=>{
    const r=router([fake()]);expect((await r.execute({...request(),capability:'speech.realtime'},policy())).status).toBe('NO_ELIGIBLE_PROVIDER');
    expect((await r.execute({...request(),capability:'made.up' as any},policy())).run?.failureCode).toBe('UNSUPPORTED_CAPABILITY');
  });
  it('LOCAL-01 filters remote providers before selection and every fallback attempt',async()=>{
    const remote=fake('A'),local=fake('Z','LOCAL');const result=await router([remote,local]).execute({...request(),localOnly:true},policy());
    expect(result.run?.providerId).toBe('Z');expect(remote.execute).not.toHaveBeenCalled();expect(result.run?.locality).toBe('LOCAL');
    const failed=fake('L','LOCAL',async()=>({status:'FAILED'}));const none=await router([remote,failed]).execute({...request(),privacy:'LOCAL_ONLY'},policy());expect(none.status).toBe('FAILED');expect(remote.execute).not.toHaveBeenCalled();
  });
  it('LOCAL-02 no real local adapter is explicit unavailable and never a remote substitution',async()=>{
    expect((await router([fake()]).execute({...request(),localOnly:true},policy())).status).toBe('LOCAL_ONLY_UNAVAILABLE');
    const runtime=new ScenarioAiRuntime();expect((await runtime.execute({...params(),allowSimulationFallback:true},{localOnly:true})).status).toBe('LOCAL_ONLY_UNAVAILABLE');
  });
  it('TIER0-01 deterministic execution bypasses provider selection and does not manufacture AiRun',async()=>{
    const adapter=fake();const result=await router([adapter]).execute(request(),policy(),async()=>({metres:3.048}));
    expect(result.status).toBe('DETERMINISTIC_BYPASS');expect(result.run).toBeUndefined();expect(result.deterministic?.executionKind).toBe('DETERMINISTIC');expect(adapter.execute).not.toHaveBeenCalled();
    expect(ReasoningBudgetManager.routingHints('UNIT_CONVERSION').modelReasoningNeeded).toBe(false);
  });
  it('FALLBACK-01/02 only policy-authorized eligible fallback executes',async()=>{
    const first=fake('A','REMOTE',vi.fn(async():Promise<AiProviderOutput>=>({status:'FAILED'})));const second=fake('B');
    const success=await router([second,first]).execute(request(),policy());expect(success.status).toBe('FALLBACK_SELECTED');expect(success.run?.fallbackPath.map(p=>p.providerId)).toEqual(['A','B']);
    const blocked=fake('B');expect((await router([first,blocked]).execute(request(),{...policy(),fallback:'NONE'})).status).toBe('FAILED');expect(blocked.execute).not.toHaveBeenCalled();
  });
  it('cost and context limits fail closed; fallback cannot reserve more than the total budget',async()=>{
    const a=fake('A','REMOTE',async()=>({status:'FAILED'}));const b=fake('B');a.descriptor.models[0].estimatedCostUsd=0.06;b.descriptor.models[0].estimatedCostUsd=0.06;
    const r=await router([a,b]).execute({...request(),maxCostUsd:0.1},policy());expect(r.run?.failureCode).toBe('TOTAL_BUDGET_EXHAUSTED');expect(b.execute).not.toHaveBeenCalled();
    expect((await router([b]).execute({...request(),estimatedInputTokens:1000},policy())).status).toBe('NO_ELIGIBLE_PROVIDER');
  });
  it('Owner-deferred execution and no-spend policy exclude model adapters independently of key availability',async()=>{
    const model=fake();model.descriptor.executionKind='MODEL';const r=await router([model]).execute(request(),policy());expect(r.status).toBe('NO_ELIGIBLE_PROVIDER');expect(model.execute).not.toHaveBeenCalled();
    model.descriptor.models[0].estimatedCostUsd=undefined;expect((await router([model]).execute(request(),{...policy(),allowModelExecution:true})).status).toBe('NO_ELIGIBLE_PROVIDER');
  });
  it('SIM-01 explicit simulator stays visibly simulation and non-certifying',async()=>{
    const result=await AgentExecutionService.executeAgentScenario({...params(),forceSimulationMode:true});
    expect(result.executionRecord.executionMode).toBe('DETERMINISTIC_SIMULATION');expect(result.aiRun?.executionKind).toBe('SIMULATOR');expect(result.aiRun?.executionStatus).toBe('SIMULATED');expect(result.validation.passed).toBe(false);expect(result.proposedClaims).toEqual([]);
  });
  it('forceSimulationMode cannot execute even a separately injected eligible model adapter',async()=>{
    const model=fake();model.descriptor.executionKind='MODEL';
    AgentExecutionService.configureAiRuntime(new ScenarioAiRuntime(router([model]),{...policy(),allowModelExecution:true}));
    const result=await AgentExecutionService.executeAgentScenario({...params(),forceSimulationMode:true});
    expect(result.aiRun?.executionKind).toBe('SIMULATOR');expect(model.execute).not.toHaveBeenCalled();expect(result.validation.passed).toBe(false);
  });
  it('RUN-01/02 records refs, schema/task/prompt hashes and truthful usage provenance',async()=>{
    const r=await router([fake()]).execute({...request(),projectId:'P',projectRevisionId:'R1'},policy());const run=r.run!;
    expect(run).toMatchObject({projectId:'P',projectRevisionId:'R1',roleId:'TEST-ROLE',capability:'reasoning.standard',adapterVersion:'test-only',locality:'REMOTE',executionKind:'TEST_DOUBLE',executionStatus:'SIMULATED',inputEvidenceIds:['EV1'],inputSourceIds:['SOURCE1'],inputChunkIds:['CH1'],policyVersion:'EXPLICIT-UNIT-TEST',approvalStatus:'PROPOSAL_ONLY',validation:{status:'NOT_RUN'}});
    for(const hash of [run.taskHash,run.promptHash,run.schemaHash])expect(hash).toMatch(/^[a-f0-9]{64}$/);expect(run.usage.source).toBe('ESTIMATED');expect(run.usage.costUsd).toBeUndefined();expect(run).not.toHaveProperty('input');
    const providerReported=fake('REPORT','REMOTE',async()=>({status:'SUCCEEDED',output:{ok:true},usage:{source:'PROVIDER_REPORTED',totalTokens:7}}));expect((await router([providerReported]).execute(request(),policy())).run?.usage.source).toBe('PROVIDER_REPORTED');
  });
  it('rejects hidden scratchpad/credential fields instead of storing them in AiRun',async()=>{
    const adapter=fake('BAD','REMOTE',async()=>({status:'SUCCEEDED',output:{scratchpad:'private internal scratch'}}));const r=await router([adapter]).execute(request(),policy());
    expect(r.status).toBe('FAILED');expect(r.run?.output).toBeUndefined();expect(JSON.stringify(r.run)).not.toContain('private internal scratch');
  });
  it('TOOL-01 audits allowlisted tools with hashes and refs rather than raw inputs',async()=>{
    const tools=new AiToolRegistry();tools.register({name:'evidence.read',locality:'LOCAL',execute:async()=>({value:{fact:3},evidenceIds:['EVIDENCE']})});
    const provider=fake('TOOLS','LOCAL',async(_r,_m,c)=>({status:'SUCCEEDED',output:(await c.callTool('evidence.read',{id:'private-input'})).value}));
    const p={...policy(),capabilityTools:['evidence.read'],roleTools:['evidence.read'],projectTools:['evidence.read']};
    const run=(await router([provider],tools).execute({...request(),requiredTools:['evidence.read']},p)).run!;
    expect(run.toolCalls[0]).toMatchObject({runId:run.runId,toolName:'evidence.read',permissionScope:'evidence:read',status:'SUCCEEDED',outputEvidenceIds:['EVIDENCE']});expect(run.toolCalls[0].inputHash).toMatch(/^[a-f0-9]{64}$/);expect(JSON.stringify(run.toolCalls)).not.toContain('private-input');
  });
  it('TOOL-02 permission intersection, unknown tools and remote tools under localOnly fail closed',async()=>{
    const tools=new AiToolRegistry();tools.register({name:'evidence.read',locality:'REMOTE',execute:vi.fn()});
    const r=router([fake()],tools);expect((await r.execute({...request(),requiredTools:['evidence.read']},{...policy(),capabilityTools:['evidence.read'],roleTools:['evidence.read']})).status).toBe('POLICY_DENIED');
    const rogue=fake('ROGUE','LOCAL',async(_r,_m,c)=>{await c.callTool('not.registered',{});return {status:'SUCCEEDED',output:{}};});
    const denied=await router([rogue],tools).execute(request(),policy());expect(denied.run?.toolCalls[0].status).toBe('DENIED');
    expect((await r.execute({...request(),localOnly:true,requiredTools:['evidence.read']},{...policy(),capabilityTools:['evidence.read'],roleTools:['evidence.read'],projectTools:['evidence.read']})).status).toBe('POLICY_DENIED');
  });
  it('SAFETY-01 no actuator/shell/network tool can be registered or invoked, including deterministic bypass',async()=>{
    const tools=new AiToolRegistry();for(const name of ['motor.command','actuator','can.send','hydraulic.control','ros2.publish','equipment.move','shell.exec','network.fetch'])expect(()=>tools.register({name,locality:'LOCAL',execute:vi.fn()} as any)).toThrow(/NOT_REGISTRABLE/);
    const solver=vi.fn(async()=>({moved:true}));const result=await router([fake()],tools).execute({...request(),risk:'DIRECT_ACTUATION'},policy(),solver);expect(result.status).toBe('POLICY_DENIED');expect(solver).not.toHaveBeenCalled();
  });
  it('CLAIM-01/02 executed model output becomes only a MODEL_INFERENCE PROPOSED claim, never Verified',async()=>{
    const run=(await router([fake()]).execute({...request(),projectId:'P',projectRevisionId:'R1'},policy())).run!;
    expect(()=>aiRunToClaim(run,'P','REGRESSION_FIXTURE')).toThrow(); // a test double is not model evidence
    // Synthetic MODEL-labelled record exercises policy only; it is not a provider execution.
    const synthetic:AiRun={...run,executionKind:'MODEL',executionStatus:'SUCCEEDED',output:{status:'VERIFIED',answer:42}};
    const claim=aiRunToClaim(synthetic,'P','REGRESSION_FIXTURE');expect(claim.derivationMethod).toBe('MODEL_INFERENCE');expect(claim.status).toBe('PROPOSED');
    expect(()=>promoteClaim(claim,{sources:[],evidence:[],reviewerId:'TEST',reason:'mock',at:new Date().toISOString()},'NO')).toThrow();expect(synthetic.approvalStatus).toBe('PROPOSAL_ONLY');
  });
  it('REVIEW-01 stronger models cannot remove configured professional review or deterministic vetoes',async()=>{
    const run=(await router([fake()]).execute({...request(),risk:'PROFESSIONAL_APPROVAL'},policy())).run!;expect(run.policyDecision).toBe('REQUIRES_PROFESSIONAL_REVIEW');expect(run.approvalStatus).toBe('PROFESSIONAL_REVIEW_REQUIRED');
    const execution={...(await AgentExecutionService.executeAgentScenario({...params(),forceSimulationMode:true})).executionRecord,executionMode:'LLM_REASONED' as const};
    const validation={passed:true,criticalFailure:false,overallScorePct:99,unsupportedCitations:[],violations:[]} as ValidationResult;
    const args={managerRoleId:'MANAGER',agentRoleId:'TEST',scenario:{...scenario,difficulty:'HARD_BOUNDARY' as const},execution,validation,curriculumCoveragePct:100,studiedSourceIds:[],knowledgePackVersion:'1'};
    expect(ManagerReviewService.conductReview(args).decision).toBe('PROFESSIONAL_REVIEW_REQUIRED');expect(ManagerReviewService.conductReview({...args,validation:{...validation,criticalFailure:true}}).decision).toBe('RETRAINING_REQUIRED');
  });
  it('bounds runtime and aborts before returning; no overlapping fallback after timeout',async()=>{
    let signal:AbortSignal;const slow=fake('A','REMOTE',async(_r,_m,c)=>{signal=c.signal;return new Promise(()=>{});});const second=fake('B');
    const result=await router([slow,second]).execute({...request(),maxLatencyMs:10},policy());expect(result.run?.failureCode).toBe('TIMEOUT');expect(signal!.aborted).toBe(true);expect(second.execute).not.toHaveBeenCalled();
  });
  it('COMPAT-01 Gemini adapter makes one selected-model call, preserves legacy output and labels estimated usage (SDK MOCK)',async()=>{
    vi.stubEnv('GEMINI_API_KEY','unit-test-placeholder-not-a-credential');sdk.generate.mockResolvedValue({text:'{"proposal":"mocked"}'});
    const adapter=new GeminiProviderAdapter();const req={...request(),reasoningContext:params()};
    const output=await adapter.execute(req,adapter.descriptor.models[0],{signal:new AbortController().signal,callTool:vi.fn()});
    expect(output.status).toBe('SUCCEEDED');expect(output.legacy?.executionMode).toBe('LLM_REASONED');expect(output.usage?.source).toBe('ESTIMATED');expect(output.promptHash).toMatch(/^[a-f0-9]{64}$/);expect(sdk.generate).toHaveBeenCalledOnce();
    sdk.generate.mockReset();sdk.generate.mockRejectedValue({code:503,message:'mock unavailable'});
    const failed=await adapter.execute(req,adapter.descriptor.models[0],{signal:new AbortController().signal,callTool:vi.fn()});expect(failed.status).toBe('RATE_LIMITED_DEFERRED');expect(sdk.generate).toHaveBeenCalledOnce();
    expect(new GeminiReasoningProvider()).toHaveProperty('generateReasoning');
  });
});
