import { DeterministicProposalSimulator } from '../../reasoningProvider';
import { hashContent } from '../../persistence/integrity';
import type { AiProviderAdapter, AiProviderDescriptor, AiRequest, AiProviderOutput } from '../provider';

/** Registered only when the trusted caller explicitly requests simulation continuity. */
export class SimulationProviderAdapter implements AiProviderAdapter {
  readonly descriptor:AiProviderDescriptor={providerId:'DeterministicProposalSimulator',adapterId:'legacy-simulator',adapterVersion:'FND05-1',executionKind:'SIMULATOR',locality:'LOCAL',privacy:['PUBLIC','PROJECT_PRIVATE'],modalities:['TEXT'],structuredOutput:true,tools:false,streaming:false,models:[{modelId:'hermes-simulator-v1',version:'1',capabilities:['reasoning.standard'],tier:'TIER_1_LOCAL_SMALL',priority:10000,estimatedCostUsd:0}]};
  health(){return 'AVAILABLE' as const;}
  async execute(request:Readonly<AiRequest>):Promise<AiProviderOutput> {
    if(!request.reasoningContext)return {status:'FAILED',failureCode:'SIMULATION_CONTEXT_MISSING'};
    const legacy=DeterministicProposalSimulator.generateSimulationProposal(request.reasoningContext,hashContent(request.input),'Explicit simulation only; not genuine model execution');
    return {status:'SUCCEEDED',output:legacy.structuredProposal,citations:legacy.citations,legacy,usage:{source:'UNKNOWN',costUsd:0,costSource:'ESTIMATED'}};
  }
}
