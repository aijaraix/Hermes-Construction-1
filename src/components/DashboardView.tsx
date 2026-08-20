import React from 'react';
import { DigitalTwinProject, PrimeHeartbeatState } from '../types/hermes';
import { Cpu, ShieldCheck, MapPin, Activity, AlertTriangle, CheckCircle, Flame, Wind, Droplets, Compass } from 'lucide-react';

interface DashboardViewProps {
  project: DigitalTwinProject;
  heartbeatState: PrimeHeartbeatState;
  onTriggerHeartbeat: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  project,
  heartbeatState,
  onTriggerHeartbeat,
}) => {
  const env = project.environment;
  const score = project.score;

  const swarms = [
    { name: 'KNOWLEDGE SWARM', status: 'ACTIVE', desc: 'Ingesting FBC 2023 & ACI 318 standards', color: 'text-cyan-400 border-cyan-500/30 bg-cyan-950/30' },
    { name: 'SITE & ENV SWARM', status: 'VERIFIED', desc: `${env.windSpeedMph} MPH wind & ${env.coastalProximityMiles}mi coastal risk profile`, color: 'text-blue-400 border-blue-500/30 bg-blue-950/30' },
    { name: 'DESIGN & GEOMETRY SWARM', status: 'ACTIVE', desc: 'BIM digital twin spatial layout modeling', color: 'text-emerald-400 border-emerald-500/30 bg-emerald-950/30' },
    { name: 'INSPECTOR SWARM', status: heartbeatState.inspectionFailuresCount > 0 ? 'ALERT' : 'PASSED', desc: `${heartbeatState.inspectionFailuresCount} open inspection failure tickets`, color: heartbeatState.inspectionFailuresCount > 0 ? 'text-red-400 border-red-500/30 bg-red-950/30' : 'text-emerald-400 border-emerald-500/30 bg-emerald-950/30' },
    { name: 'REPAIR SWARM', status: 'ACTIVE', desc: 'Auto-repairing slope & anchor depth issues', color: 'text-purple-400 border-purple-500/30 bg-purple-950/30' },
    { name: 'QUANTITY SWARM', status: 'CALCULATED', desc: `${project.bom.length} material items quantified from 3D geometry`, color: 'text-amber-400 border-amber-500/30 bg-amber-950/30' },
    { name: 'PROCUREMENT & COST SWARM', status: 'VERIFIED', desc: `${project.suppliers.length} local Tampa suppliers mapped with prices`, color: 'text-indigo-400 border-indigo-500/30 bg-indigo-950/30' },
    { name: 'CHANGE-ORDER RISK SWARM', status: 'MONITORING', desc: `${project.changeOrderRisks.filter((r) => !r.resolved).length} active preconstruction risks`, color: 'text-rose-400 border-rose-500/30 bg-rose-950/30' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner: Project Context & Location */}
      <div className="p-6 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 rounded-2xl border border-slate-800 shadow-2xl flex flex-wrap items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs uppercase tracking-widest font-bold text-cyan-400 bg-cyan-950/80 px-2.5 py-0.5 rounded-full border border-cyan-800">
              Active Project #{project.id}
            </span>
            <span className="text-xs text-slate-400 font-mono">Gym Level {project.gymLevel} • Iteration #{project.iterationNumber}</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-100">{project.name}</h2>
          <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-cyan-400" /> {env.locationName} • Jurisdiction: {env.jurisdiction}
          </p>
        </div>

        {/* Owner Pause / Resume Controls & Score */}
        <div className="flex flex-wrap items-center gap-4 bg-slate-950/90 px-5 py-3 rounded-xl border border-slate-800">
          <div>
            <span className="text-[10px] uppercase text-slate-400 block">System State</span>
            <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded border ${
              heartbeatState.statusMessage.includes('PAUSED')
                ? 'bg-amber-950 text-amber-400 border-amber-800'
                : 'bg-emerald-950 text-emerald-400 border-emerald-800'
            }`}>
              {heartbeatState.statusMessage.includes('PAUSED') ? 'PAUSED' : 'ACTIVE'}
            </span>
          </div>

          <div>
            <span className="text-[10px] uppercase text-slate-400 block">Overall Score</span>
            <span className="text-2xl font-black text-cyan-400">{score.overall} <span className="text-xs font-normal text-slate-500">/ 100</span></span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={async () => {
                const isPaused = heartbeatState.statusMessage.includes('PAUSED');
                await fetch('/api/system/pause', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ is_system_paused: !isPaused, pause_reason: isPaused ? '' : 'Owner Control Toggle' }),
                });
                onTriggerHeartbeat();
              }}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition border ${
                heartbeatState.statusMessage.includes('PAUSED')
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500'
                  : 'bg-amber-600/80 hover:bg-amber-500 text-white border-amber-500'
              }`}
            >
              {heartbeatState.statusMessage.includes('PAUSED') ? 'RESUME HERMES' : 'PAUSE HERMES'}
            </button>

            <button
              onClick={onTriggerHeartbeat}
              className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-semibold text-xs transition shadow"
            >
              Heartbeat Step
            </button>
          </div>
        </div>
      </div>

      {/* Project Environment Profile Card */}
      <div className="p-6 bg-slate-900 rounded-2xl border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
          <Compass className="w-4 h-4 text-cyan-400" /> Project Environment Profile (Location-First Intelligence)
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 text-xs">
          <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800/80">
            <span className="text-slate-400 block text-[10px] flex items-center gap-1"><Wind className="w-3 h-3 text-cyan-400" /> Wind Load</span>
            <span className="text-slate-100 font-bold">{env.windSpeedMph} MPH</span>
          </div>
          <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800/80">
            <span className="text-slate-400 block text-[10px] flex items-center gap-1"><Droplets className="w-3 h-3 text-blue-400" /> Salt Exposure</span>
            <span className="text-amber-400 font-bold">{env.saltExposureRisk} ({env.coastalProximityMiles} mi)</span>
          </div>
          <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800/80">
            <span className="text-slate-400 block text-[10px]">Flood Zone</span>
            <span className="text-slate-100 font-bold">{env.floodZone}</span>
          </div>
          <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800/80">
            <span className="text-slate-400 block text-[10px]">Climate Zone</span>
            <span className="text-slate-100 font-bold">{env.climateZone}</span>
          </div>
          <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800/80">
            <span className="text-slate-400 block text-[10px]">Soil Bearing</span>
            <span className="text-slate-100 font-bold">{env.soilBearingCapacityPsf} PSF</span>
          </div>
          <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800/80">
            <span className="text-slate-400 block text-[10px]">Building Code</span>
            <span className="text-cyan-300 font-bold truncate">{env.localCodeVersion}</span>
          </div>
        </div>
      </div>

      {/* Swarms Registry Grid */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
          <Cpu className="w-4 h-4 text-cyan-400" /> Active Autonomous Swarm Registry
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {swarms.map((s, idx) => (
            <div key={idx} className={`p-4 rounded-xl border ${s.color} space-y-2 relative overflow-hidden`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold tracking-tight">{s.name}</span>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-900/80 border border-slate-700">
                  {s.status}
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Two Column: Live Event Stream + Scorecard Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Live Event Stream */}
        <div className="p-5 bg-slate-900 rounded-2xl border border-slate-800 space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" /> HERMES Heartbeat Swarm Event Stream
          </h3>
          <div className="space-y-2 max-h-[320px] overflow-y-auto pr-2 font-mono text-xs">
            {heartbeatState.recentLogs.map((log) => (
              <div key={log.id} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 space-y-1">
                <div className="flex items-center justify-between text-[10px] text-slate-500">
                  <span className="font-bold text-cyan-400">{log.swarm}</span>
                  <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                </div>
                <p className="text-slate-300 leading-normal">{log.message}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Evidence Scorecard Breakdown */}
        <div className="p-5 bg-slate-900 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-cyan-400" /> Evidence-Based Construction Scorecard
          </h3>
          <div className="space-y-3">
            {[
              { label: 'Structural Validation & Load Path', value: score.structuralValidation },
              { label: 'Environmental Climate Appropriateness', value: score.environmentalAppropriateness },
              { label: 'MEP Connectivity & Hydraulic Slope', value: score.mepConnectivity },
              { label: 'Clash-Free Geometry Percentage', value: score.clashFreePercentage },
              { label: 'Independent Inspection Success Rate', value: score.inspectionSuccess },
              { label: 'Local Sourcing & Cost Confidence', value: score.costConfidence },
            ].map((sc, i) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between text-xs text-slate-300">
                  <span>{sc.label}</span>
                  <span className="font-bold text-cyan-400">{sc.value}%</span>
                </div>
                <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 rounded-full transition-all duration-500"
                    style={{ width: `${sc.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
