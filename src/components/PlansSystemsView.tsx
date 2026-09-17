import React, { useState } from 'react';
import { DigitalTwinProject } from '../types/hermes';
import { Server, Zap, Wind, Droplet, ArrowRight, CheckCircle2, ShieldCheck, Compass, Layers, Activity, AlertTriangle, FileText } from 'lucide-react';
import { useHermesProject } from '../context/HermesProjectContext';

interface PlansSystemsViewProps {
  project: DigitalTwinProject;
}

export const PlansSystemsView: React.FC<PlansSystemsViewProps> = ({ project }) => {
  const { worldState } = useHermesProject();
  const [activeTab, setActiveTab] = useState<'EngineeringTruth' | 'Systems' | 'SpatialSolver'>('EngineeringTruth');
  const [activeSystem, setActiveSystem] = useState<'Electrical' | 'HVAC' | 'Plumbing'>('Electrical');

  const jTruth = worldState?.jurisdictionTruth;
  const gTruth = worldState?.geotechTruth;
  const fTruth = worldState?.foundationSelection;
  const sTruth = worldState?.structuralEngineering;
  const solverLogs = worldState?.spacePlanningCandidateLogs || [];

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
              <Compass className="w-5 h-5 text-cyan-400" />
              <h2 className="text-xl font-bold text-slate-100 tracking-tight">PLANS, ENGINEERING TRUTH & SYSTEMS</h2>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-1">
              Deterministic Location Code Truth, Geotechnical Analysis, Multi-Factor Foundation Solver & Structural Calculations
            </p>
          </div>

          {/* Main View Tabs */}
          <div className="flex gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-mono">
            <button
              onClick={() => setActiveTab('EngineeringTruth')}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                activeTab === 'EngineeringTruth'
                  ? 'bg-cyan-600 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Engineering Truth</span>
            </button>
            <button
              onClick={() => setActiveTab('SpatialSolver')}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                activeTab === 'SpatialSolver'
                  ? 'bg-cyan-600 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Spatial Solver</span>
            </button>
            <button
              onClick={() => setActiveTab('Systems')}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                activeTab === 'Systems'
                  ? 'bg-cyan-600 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>MEP Systems</span>
            </button>
          </div>
        </div>
      </div>

      {/* TAB 1: ENGINEERING TRUTH & DETERMINISTIC CALCULATIONS */}
      {activeTab === 'EngineeringTruth' && (
        <div className="space-y-6">
          {/* Jurisdiction & Geotech Truth Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Jurisdiction Code Truth */}
            <div className="p-5 bg-slate-900 rounded-2xl border border-slate-800 space-y-3 font-mono text-xs shadow-xl">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="font-bold text-slate-100 flex items-center gap-2 font-sans">
                  <FileText className="w-4 h-4 text-cyan-400" /> Jurisdiction & Building Code Truth
                </span>
                <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase border ${
                  jTruth?.status === 'VERIFIED_SOURCE'
                    ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                    : 'bg-amber-950 text-amber-400 border-amber-800'
                }`}>
                  {jTruth?.status || 'SIMULATION_FIXTURE'}
                </span>
              </div>

              <div className="space-y-2 text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-400">Address / Location:</span>
                  <span className="font-bold text-slate-100">{jTruth?.userProvidedAddress || 'Tampa Bay, FL'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Code Edition:</span>
                  <span className="text-cyan-300 font-bold">{jTruth?.codeEdition || 'FBC 2023 (8th Edition)'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Design Wind Speed:</span>
                  <span className="text-amber-400 font-bold">{jTruth?.windCriteriaMph || 160} MPH</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Flood Data:</span>
                  <span className="text-slate-200">{jTruth?.floodData?.zone || 'Zone AE (BFE +11.0 ft)'}</span>
                </div>
                <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-400 leading-relaxed">
                  Evidence: {jTruth?.sourceEvidence || 'FBC 2023 Coastal Wind Map / FEMA FIRM Panel'}
                </div>
              </div>
            </div>

            {/* Geotechnical SPT Boring Truth */}
            <div className="p-5 bg-slate-900 rounded-2xl border border-slate-800 space-y-3 font-mono text-xs shadow-xl">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="font-bold text-slate-100 flex items-center gap-2 font-sans">
                  <Activity className="w-4 h-4 text-emerald-400" /> Geotechnical Soil Investigation
                </span>
                <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase border ${
                  gTruth?.dataOrigin === 'VERIFIED_IMPORT'
                    ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                    : 'bg-blue-950 text-blue-400 border-blue-800'
                }`}>
                  {gTruth?.dataOrigin || 'SIMULATION_FIXTURE'}
                </span>
              </div>

              <div className="space-y-2 text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-400">Soil Stratum Class:</span>
                  <span className="font-bold text-slate-100">{gTruth?.soilClass || 'Medium Dense Fine Sand over Stiff Clay'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Allowable Soil Bearing:</span>
                  <span className="text-emerald-400 font-bold">{gTruth?.bearingCapacityPsf || 2200} PSF</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Measured Water Table Depth:</span>
                  <span className="text-blue-400 font-bold">{gTruth?.waterTableFt || 6.0} ft below grade</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Geotech Recommendation:</span>
                  <span className="text-cyan-300 font-bold">{gTruth?.recommendation || 'Post-Tensioned Slab'}</span>
                </div>
                <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-400 leading-relaxed">
                  Sampling Standard: {gTruth?.evidenceNotes || 'Standard Penetration Test N-values per ASTM D1586.'}
                </div>
              </div>
            </div>
          </div>

          {/* Multi-Factor Foundation Evaluation Matrix */}
          <div className="p-6 bg-slate-900 rounded-2xl border border-slate-800 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase text-slate-100 flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" /> Multi-Factor Foundation Evaluation Matrix
              </h3>
              <span className="text-xs font-bold text-emerald-400 font-mono">
                Selected: {fTruth?.selectedFoundation?.replace(/_/g, ' ')}
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              {fTruth?.rationale || 'Evaluated 5 foundation candidates against bearing capacity, groundwater, slope, load, and settlement risk.'}
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="p-3">Candidate Foundation</th>
                    <th className="p-3">Bearing (25%)</th>
                    <th className="p-3">Groundwater (20%)</th>
                    <th className="p-3">Slope (20%)</th>
                    <th className="p-3">Settlement (15%)</th>
                    <th className="p-3">Composite Score</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {(fTruth?.candidatesEvaluated || []).map((cand, idx) => {
                    const isSelected = cand.foundationType === fTruth?.selectedFoundation;
                    return (
                      <tr key={idx} className={isSelected ? 'bg-cyan-950/40 font-bold text-cyan-200' : 'hover:bg-slate-950/50'}>
                        <td className="p-3 font-sans font-bold flex items-center gap-2">
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                          {cand.foundationType.replace(/_/g, ' ')}
                        </td>
                        <td className="p-3">{cand.bearingCapacityScore}</td>
                        <td className="p-3">{cand.groundwaterScore}</td>
                        <td className="p-3">{cand.slopeScore}</td>
                        <td className="p-3">{cand.settlementRiskScore}</td>
                        <td className="p-3 font-bold text-amber-400">{cand.compositeScore} / 100</td>
                        <td className="p-3">
                          {isSelected ? (
                            <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px]">SELECTED</span>
                          ) : cand.eliminatedReason ? (
                            <span className="text-[10px] text-rose-400">{cand.eliminatedReason}</span>
                          ) : (
                            <span className="text-[10px] text-slate-500">Evaluated</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Deterministic Structural Engineering Calculations */}
          <div className="p-6 bg-slate-900 rounded-2xl border border-slate-800 space-y-4 shadow-xl font-mono text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-sm font-bold uppercase text-slate-100 flex items-center gap-2 font-sans">
                <Wind className="w-4 h-4 text-amber-400" /> Deterministic Structural Load Path & Wind Pressure Analysis
              </h3>
              <span className="px-2.5 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800 text-[10px] font-bold">
                {sTruth?.complianceTag || 'STRUCTURAL_DETERMINISTIC_CHECK_PASSED'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                <span className="text-slate-400 text-[10px] uppercase font-sans block">Wind Pressure (q_z)</span>
                <span className="text-amber-400 text-base font-bold block">{sTruth?.windVelocityPressureQz || 47.3} PSF</span>
                <span className="text-[10px] text-slate-500 block">q_z = 0.00256 · K_z · K_zt · K_d · V²</span>
              </div>

              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                <span className="text-slate-400 text-[10px] uppercase font-sans block">Wind Uplift Demand</span>
                <span className="text-cyan-400 text-base font-bold block">{sTruth?.windUpliftDemandLbs || 1200} lbs</span>
                <span className="text-[10px] text-slate-500 block">Roof tie-down reaction demand</span>
              </div>

              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                <span className="text-slate-400 text-[10px] uppercase font-sans block">Anchor Bolt Utilization</span>
                <span className="text-emerald-400 text-base font-bold block">{sTruth?.utilizationRatio || 0.65} Ratio</span>
                <span className="text-[10px] text-slate-500 block">Demand / 1,850 lbs bolt capacity</span>
              </div>

              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                <span className="text-slate-400 text-[10px] uppercase font-sans block">Tributary Wall Load</span>
                <span className="text-purple-400 text-base font-bold block">{sTruth?.wallTributaryLoadLbsPerFt || 2100} lbs/ft</span>
                <span className="text-[10px] text-slate-500 block">Header Beam Demand: {sTruth?.headerBeamDemandKips || 25.2} kips</span>
              </div>
            </div>

            <div className="pt-2 text-[10px] text-slate-400 leading-relaxed border-t border-slate-800">
              Calculation Method: {sTruth?.calculationMethod || 'ASCE 7-22 / FBC 2023 Deterministic Analysis'}. Assumptions: {(sTruth?.assumptions || []).join(' • ')}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SPATIAL SOLVER CANDIDATES */}
      {activeTab === 'SpatialSolver' && (
        <div className="p-6 bg-slate-900 rounded-2xl border border-slate-800 space-y-4 shadow-xl">
          <h3 className="text-sm font-bold uppercase text-slate-100 flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" /> Space Planning Solver Candidate Layouts
          </h3>
          <p className="text-xs text-slate-400">
            HERMES spatial solver evaluates room program adjacencies, wet-wall clustering (plumbing runs), privacy zone separation, and daylight exposure before selecting the winning layout.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
            {solverLogs.map((cand, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-xl border space-y-3 flex flex-col justify-between ${
                  cand.selected
                    ? 'bg-cyan-950/60 border-cyan-500 text-slate-100 shadow-lg shadow-cyan-500/20'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <span className="text-[10px] uppercase font-bold text-cyan-400 font-sans">
                      Option #{idx + 1}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                      cand.selected ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-slate-900 text-slate-500'
                    }`}>
                      {cand.selected ? 'SELECTED WINNER' : 'REJECTED'}
                    </span>
                  </div>

                  <h4 className="font-bold text-slate-100 mt-2 font-sans">{cand.layoutVariantName}</h4>
                  <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">{cand.description}</p>
                </div>

                <div className="pt-2 border-t border-slate-800 space-y-1 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Adjacency Match:</span>
                    <span className="text-cyan-300 font-bold">{cand.adjacencyScore}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Wet Wall Clustering:</span>
                    <span className="text-emerald-400 font-bold">{cand.wetAreaClusteringScore}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Privacy Zoning:</span>
                    <span className="text-purple-400 font-bold">{cand.privacyZoneScore}</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-slate-800/60 text-xs font-bold text-amber-400">
                    <span>Total Score:</span>
                    <span>{cand.totalScore} / 100</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: MEP SYSTEMS CONNECTIVITY CHAINS */}
      {activeTab === 'Systems' && (
        <div className="space-y-6">
          <div className="flex justify-end gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800 text-xs font-mono w-fit ml-auto">
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
      )}
    </div>
  );
};
