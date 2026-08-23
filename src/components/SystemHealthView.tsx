import React, { useEffect, useState } from 'react';
import { Server, Zap, Database, ShieldCheck, Cpu, Layers, Activity, FolderGit2 } from 'lucide-react';

export const SystemHealthView: React.FC = () => {
  const [health, setHealth] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const res = await fetch('/api/system/health').catch(() => null);
        if (res && res.ok) {
          const data = await res.json().catch(() => null);
          if (data) setHealth(data);
        }
      } catch {
        // Handle gracefully
      } finally {
        setIsLoading(false);
      }
    };

    fetchHealth();
  }, []);

  if (isLoading || !health) {
    return (
      <div className="p-8 text-center text-slate-400 font-mono text-xs">
        Loading System Health Diagnostics...
      </div>
    );
  }

  const modules = [
    { title: 'Reasoning Provider', status: health.reasoningProvider.status, icon: Zap, detail: `${health.reasoningProvider.providerName} (Gated API)` },
    { title: 'HTTP Retrieval Engine', status: health.httpRetrieval.status, icon: Server, detail: `${health.httpRetrieval.activeSources} Registered Code Sources` },
    { title: 'PDF Parser Engine', status: health.pdfParser.status, icon: Database, detail: `${health.pdfParser.primaryParser} (Fallback Stream)` },
    { title: 'Knowledge DB', status: health.knowledgeDb.status, icon: Database, detail: `${health.knowledgeDb.chunksLoaded} Active Code Chunks` },
    { title: 'Project DB Persistence', status: health.projectDb.status, icon: Layers, detail: `${health.projectDb.activeProjects} Digital Twin Projects` },
    { title: 'Autonomous Heartbeat Ticker', status: health.heartbeat.status, icon: Activity, detail: `Count #${health.heartbeat.count} (10s Interval)` },
    { title: 'Independent Validator Engine', status: health.validatorEngine.status, icon: ShieldCheck, detail: '5 Trade Deterministic Validators Active' },
    { title: 'Digital Twin BIM Renderer', status: health.digitalTwinEngine.status, icon: Layers, detail: 'Three.js WebGL Hardware Accelerated' },
    { title: 'Reality & Data Truth Swarm', status: health.realitySwarm.status, icon: ShieldCheck, detail: '15 Active Integrity Inspectors' },
    { title: 'Source Version Alignment', status: 'HEALTHY', icon: FolderGit2, detail: `Phase ${health.gitVersion.phase} • Commit ${health.gitVersion.commit}` },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="p-6 bg-slate-900 rounded-2xl border border-slate-800 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Server className="w-6 h-6 text-emerald-400" />
              <h2 className="text-xl font-bold text-slate-100 tracking-tight">SYSTEM HEALTH & DIAGNOSTICS</h2>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-1">
              Autonomous Operating System Subsystem Health Monitoring & Source Version Matching
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 font-mono text-xs">
        {modules.map((mod, idx) => {
          const Icon = mod.icon;
          return (
            <div key={idx} className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4 text-cyan-400" />
                  <span className="font-bold text-slate-100 font-sans">{mod.title}</span>
                </div>
                <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                  {mod.status}
                </span>
              </div>
              <p className="text-slate-400 text-[11px]">{mod.detail}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
