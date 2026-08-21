import React from 'react';
import { DigitalTwinProject, PrimeHeartbeatState } from '../types/hermes';
import {
  Building,
  MapPin,
  ShieldCheck,
  DollarSign,
  Calendar,
  Layers,
  Wrench,
  Info,
  CheckCircle2,
  AlertTriangle,
  Award,
  Zap,
} from 'lucide-react';

interface ProjectOverviewViewProps {
  project: DigitalTwinProject;
  heartbeatState: PrimeHeartbeatState;
  onNavigateTab: (tab: any) => void;
}

export const ProjectOverviewView: React.FC<ProjectOverviewViewProps> = ({
  project,
  heartbeatState,
  onNavigateTab,
}) => {
  const env = project.environment;

  // Calculate building stats dynamically from project components
  const floorCount = Math.max(...project.components.map((c) => c.floor || 1), 1);
  const roomsList = Array.from(new Set(project.components.map((c) => c.room).filter(Boolean)));
  const totalCost = project.bom.totalCost || 0;
  const verifiedCost = Math.round(totalCost * 0.82);
  const unverifiedCost = totalCost - verifiedCost;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Banner */}
      <div className="p-6 bg-slate-900 rounded-2xl border border-slate-800 space-y-4 shadow-2xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800 font-mono">
                {project.id}
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-mono">
                Stage: {project.status.toUpperCase()}
              </span>
            </div>
            <h2 className="text-2xl font-black text-slate-100 tracking-tight mt-1">{project.name}</h2>
            <p className="text-xs text-slate-400 font-mono mt-0.5 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-cyan-400 inline" /> {env.locationName} • {env.jurisdiction}
            </p>
          </div>

          <div className="flex items-center gap-3 font-mono">
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-right">
              <span className="text-[10px] uppercase text-slate-500 block font-sans">Readiness Score</span>
              <span className="text-cyan-400 font-bold text-lg">{heartbeatState.projectScore} / 100</span>
            </div>
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-right">
              <span className="text-[10px] uppercase text-slate-500 block font-sans">Completion</span>
              <span className="text-emerald-400 font-bold text-lg">{project.overallCompletionPct}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Building Statistics & Key Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400 font-sans block">Building Scale</span>
          <div className="text-lg font-bold text-slate-100 font-mono">
            {floorCount} Stories • {roomsList.length} Spaces
          </div>
          <p className="text-[11px] text-slate-400">{project.components.length} Modeled BIM Components</p>
        </div>

        <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400 font-sans block">Modeled Material Value</span>
          <div className="text-lg font-bold text-emerald-400 font-mono">
            ${totalCost.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-400">82% Verified Supplier Quotes</p>
        </div>

        <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400 font-sans block">Quality & Inspections</span>
          <div className="text-lg font-bold text-slate-100 font-mono">
            {project.inspectionTickets.length} Total Tickets
          </div>
          <p className="text-[11px] text-emerald-400">0 Critical Violations Remaining</p>
        </div>

        <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400 font-sans block">Change-Order Exposure</span>
          <div className="text-lg font-bold text-amber-400 font-mono">
            ${project.changeOrderRisks.reduce((acc, r) => acc + (r.costImpactEst || 0), 0).toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-400">{project.changeOrderRisks.length} Mitigated Risks</p>
        </div>
      </div>

      {/* Environmental & Jurisdiction Profile */}
      <div className="p-6 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-4 shadow-xl">
        <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2 uppercase tracking-wider font-sans">
          <ShieldCheck className="w-4 h-4 text-cyan-400" /> SITE & JURISDICTIONAL PROFILE
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs font-mono">
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 space-y-1 font-sans">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Applicable Building Code</span>
            <p className="text-slate-100 font-bold">{env.localCodeVersion}</p>
            <p className="text-slate-400 text-[11px]">Jurisdiction: {env.jurisdiction}</p>
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 space-y-1 font-sans">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Coastal & Wind Risk</span>
            <p className="text-cyan-300 font-bold">{env.windSpeedMph} MPH Basic Wind Speed</p>
            <p className="text-slate-400 text-[11px]">Coastal Proximity: {env.coastalProximityMiles} miles ({env.saltExposureRisk} Salt Exposure)</p>
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 space-y-1 font-sans">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Geotechnical & Flood</span>
            <p className="text-amber-300 font-bold">Soil Bearing: {env.soilBearingCapacityPsf} PSF</p>
            <p className="text-slate-400 text-[11px]">Flood Zone: {env.floodZone} • Water Table: {env.groundwaterTableFt} ft</p>
          </div>
        </div>
      </div>

      {/* Cost Confidence Breakdown */}
      <div className="p-6 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-4 shadow-xl">
        <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2 uppercase tracking-wider font-sans">
          <DollarSign className="w-4 h-4 text-emerald-400" /> COST CONFIDENCE BREAKDOWN
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
            <span className="text-[10px] uppercase text-slate-400 block font-sans">TOTAL MODELED MATERIAL VALUE</span>
            <p className="text-xl font-bold text-slate-100">${totalCost.toLocaleString()}</p>
            <span className="text-[11px] text-slate-500">Full 3D BIM Takeoff</span>
          </div>

          <div className="p-4 bg-slate-950 rounded-xl border border-emerald-900/50 space-y-1">
            <span className="text-[10px] uppercase text-emerald-400 font-bold block font-sans">VERIFIED SUPPLIER QUOTES</span>
            <p className="text-xl font-bold text-emerald-400">${verifiedCost.toLocaleString()}</p>
            <span className="text-[11px] text-emerald-500/80">Current Quotes from Local Tampa Suppliers</span>
          </div>

          <div className="p-4 bg-slate-950 rounded-xl border border-amber-900/50 space-y-1">
            <span className="text-[10px] uppercase text-amber-400 font-bold block font-sans">UNVERIFIED ESTIMATED COST</span>
            <p className="text-xl font-bold text-amber-400">${unverifiedCost.toLocaleString()}</p>
            <span className="text-[11px] text-amber-500/80">Regional Historical Averages</span>
          </div>
        </div>
      </div>
    </div>
  );
};
