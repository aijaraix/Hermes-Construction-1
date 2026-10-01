import type { AiProviderAdapter, AiProviderDescriptor } from './provider';

export class ProviderRegistry {
  private providers=new Map<string,AiProviderAdapter>();
  register(adapter:AiProviderAdapter):void {
    const d=adapter.descriptor;
    if(!d.providerId||!d.adapterId||!d.adapterVersion||this.providers.has(d.providerId)||!d.models.length)throw new Error('Invalid or duplicate provider registration');
    if(new Set(d.models.map(m=>m.modelId)).size!==d.models.length)throw new Error('Duplicate model registration');
    for(const m of d.models) {
      if(!m.modelId||!Number.isFinite(m.priority)||!m.capabilities.length)throw new Error('Invalid model descriptor');
      if(d.locality==='REMOTE'&&m.tier!=='TIER_3_REMOTE_FRONTIER'||d.locality==='LOCAL'&&m.tier==='TIER_3_REMOTE_FRONTIER')throw new Error('Provider locality/tier mismatch');
      for(const value of [m.contextTokens,m.estimatedLatencyMs,m.estimatedCostUsd])if(value!==undefined&&(!Number.isFinite(value)||value<0))throw new Error('Invalid model limit/cost metadata');
    }
    // Freeze declared policy inputs so an adapter cannot mutate them during selection/fallback.
    const descriptor=structuredClone(d);for(const m of descriptor.models){Object.freeze(m.capabilities);Object.freeze(m);}Object.freeze(descriptor.models);Object.freeze(descriptor.privacy);Object.freeze(descriptor.modalities);Object.freeze(descriptor);
    this.providers.set(d.providerId,{descriptor,health:()=>adapter.health(),execute:(r,m,c)=>adapter.execute(r,m,c)});
  }
  adapters():ReadonlyArray<AiProviderAdapter>{return [...this.providers.values()];}
  status():Array<{descriptor:AiProviderDescriptor;health:string}>{return this.adapters().map(a=>({descriptor:structuredClone(a.descriptor),health:a.health()}));}
}
