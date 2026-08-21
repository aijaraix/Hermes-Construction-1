import React, { useState } from 'react';
import { DigitalTwinProject } from '../types/hermes';
import { Server, Zap, Wind, Droplet, ArrowRight, CheckCircle2, ShieldCheck } from 'lucide-react';

interface PlansSystemsViewProps {
  project: DigitalTwinProject;
}

export const PlansSystemsView: React.FC<PlansSystemsViewProps> = ({ project }) => {
  const [activeSystem, setActiveSystem] = useState<'Electrical' | 'HVAC' | 'Plumbing'>('Electrical');

  const connectivityChains = {
    Electrical: [
      {
        chainTitle: 'Level 1 Receptacle Branch Circuit Chain',
        nodes: [
          { name: 'Duplex Receptacle (OUTLET-101)', spec: '20A NEMA 5-20R GFCI', status: 'VERIFIED' },
          { name: 'Branch Wiring (#12 THHN Cu)', spec: '12/2 MC Cable in Drywall', status: 'VERIFIED' },
          { name: 'Sub-Panel B1 (PANEL-L1)', spec: '125A 120/240V 1-Phase Loadcenter', status: 'VERIFIED' },
          { name: 'Feeder Conductor (2/0 Cu)', spec: '2" PVC Conduit Underground', status: 'VERIFIED' },
          { name: 'Main Service Panel (MAIN-200A)', spec: '200A Main Breaker / Meter Combo', status: 'VERIFIED' },
          { name: 'Utility Service Drop', spec: 'Tampa Electric Co. Underground Feed', status: 'VERIFIED' },
        ],
      },
    ],
    HVAC: [
      {
        chainTitle: 'Level 2 Mechanical Room Diffuser & Ductwork Chain',
        nodes: [
          { name: 'Supply Diffuser (DIFFUSER-204-1)', spec: '8" Neck Steel Ceiling Diffuser (400 CFM)', status: 'VERIFIED' },
          { name: 'Flexible Duct Branch', spec: '8" R-6.0 Insulated Flex Duct', status: 'VERIFIED' },
          { name: 'Main Duct Trunk', spec: '24x12 Galvanized Sheet Metal Trunk', status: 'VERIFIED' },
          { name: 'Air Handling Unit (AHU-L2)', spec: '3.5 Ton Variable Speed Heat Pump', status: 'VERIFIED' },
          { name: 'Refrigerant Line Set', spec: '3/8" x 7/8" Pre-insulated Copper', status: 'VERIFIED' },
          { name: 'Exterior Condensing Unit', spec: '16 SEER2 High Efficiency Heat Pump', status: 'VERIFIED' },
        ],
      },
    ],
    Plumbing: [
      {
        chainTitle: 'Sanitary Waste & Vent Drainage Chain',
        nodes: [
          { name: 'Master Bath Lavatory Fixture', spec: '1.2 GPM WaterSense Basin', status: 'VERIFIED' },
          { name: '1-1/2" Branch Waste Pipe', spec: 'Schedule 40 PVC DWV Pipe', status: 'VERIFIED' },
          { name: '3" Soil & Waste Stack', spec: '3" Schedule 40 PVC Vertical Stack', status: 'VERIFIED' },
          { name: '4" Building Drain', spec: '4" Schedule 40 PVC Underground Drain', status: 'VERIFIED' },
          { name: 'Building Sewer Connection', spec: '4" SDR-35 PVC Lateral Pipe', status: 'VERIFIED' },
          { name: 'Municipal Sanitary Main', spec: 'City of Tampa Public Sewer Utility', status: 'VERIFIED' },
        ],
      },
    ],
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="p-6 bg-slate-900 rounded-2xl border border-slate-800 space-y-4 shadow-2xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Server className="w-5 h-5 text-cyan-400" />
              <h2 className="text-xl font-bold text-slate-100 tracking-tight">PLANS & SYSTEM CONNECTIVITY CHAINS</h2>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-1">
              Deterministic End-to-End System Continuity & Routing Verification Engine
            </p>
          </div>

          {/* System Tabs */}
          <div className="flex gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-mono">
            {[
              { id: 'Electrical', label: 'Electrical', icon: Zap },
              { id: 'HVAC', label: 'HVAC Ductwork', icon: Wind },
              { id: 'Plumbing', label: 'Plumbing DWV', icon: Droplet },
            ].map((sys) => {
              const Icon = sys.icon;
              return (
                <button
                  key={sys.id}
                  onClick={() => setActiveSystem(sys.id as any)}
                  className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                    activeSystem === sys.id
                      ? 'bg-cyan-600 text-slate-950 shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{sys.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Connectivity Chain Visualizer */}
      <div className="p-6 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-6 shadow-xl">
        {connectivityChains[activeSystem].map((chain, cIdx) => (
          <div key={cIdx} className="space-y-4">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2 font-sans">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> {chain.chainTitle}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {chain.nodes.map((node, nIdx) => (
                <div
                  key={nIdx}
                  className="p-4 bg-slate-950 rounded-xl border border-slate-800/80 space-y-2 relative font-mono text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase text-cyan-400 font-bold font-sans">
                      Node #{nIdx + 1}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                      {node.status}
                    </span>
                  </div>

                  <h4 className="font-bold text-slate-100">{node.name}</h4>
                  <p className="text-[11px] text-slate-400">{node.spec}</p>

                  {nIdx < chain.nodes.length - 1 && (
                    <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-10 p-1 bg-slate-900 rounded-full border border-slate-700 text-cyan-400">
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
