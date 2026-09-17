import React, { useState } from 'react';
import { ProposedRevision } from '../types/hermes';
import { Sparkles, DollarSign, Calendar, Wrench, ShieldCheck, ArrowRight, Check, Compass, Layers, Activity } from 'lucide-react';
import { useHermesProject } from '../context/HermesProjectContext';

interface CustomizerViewProps {
  projectId: string;
  onProposeRevision: (prompt: string) => Promise<ProposedRevision>;
  onApplyRevision: (prompt: string) => Promise<void>;
}

export const CustomizerView: React.FC<CustomizerViewProps> = ({
  projectId,
  onProposeRevision,
  onApplyRevision,
}) => {
  const { simulateScenario, worldState, refreshWorldState } = useHermesProject();
  const [promptInput, setPromptInput] = useState<string>('');
  const [proposedRevision, setProposedRevision] = useState<ProposedRevision | null>(null);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [isApplying, setIsApplying] = useState<boolean>(false);
  const [appliedSuccess, setAppliedSuccess] = useState<boolean>(false);
  const [activeSimResult, setActiveSimResult] = useState<any>(null);
  const [simScenarioName, setSimScenarioName] = useState<string>('');
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  const presets = [
    '24-Ga Galvalume Standing Seam Metal Roof',
    'Full Modular Red Brick Veneer Facade',
    'Contemporary Architectural Facade Package',
    'Reconfigure Level 2 Wall Layout for Master Suite',
  ];

  const scenarios = [
    {
      id: 'A',
      name: 'Scenario A: Baseline Compact',
      params: { location: 'Tampa, FL', targetSqFt: 2000, bedrooms: 3, bathrooms: 2, siteSlopeDegrees: 0, soilBearingPsf: 2200, waterTableFt: 6.0, windRatingMph: 160 },
      desc: '2,000 sq ft / 3 Bed / 2 Bath / 0° Slope / 2,200 PSF / 6ft Water Table'
    },
    {
      id: 'B',
      name: 'Scenario B: Expanded Estate',
      params: { location: 'Tampa, FL', targetSqFt: 3200, bedrooms: 4, bathrooms: 3, siteSlopeDegrees: 0, soilBearingPsf: 2200, waterTableFt: 6.0, windRatingMph: 160 },
      desc: '3,200 sq ft / 4 Bed / 3 Bath / 0° Slope / 2,200 PSF / 6ft Water Table'
    },
    {
      id: 'C',
      name: 'Scenario C: Sloped Terrain',
      params: { location: 'Tampa, FL', targetSqFt: 2000, bedrooms: 3, bathrooms: 2, siteSlopeDegrees: 10, soilBearingPsf: 2200, waterTableFt: 6.0, windRatingMph: 160 },
      desc: '2,000 sq ft / 3 Bed / 2 Bath / 10° Slope / 2,200 PSF / Stem-Wall Required'
    },
    {
      id: 'D',
      name: 'Scenario D: Soft Soil & High Water Table',
      params: { location: 'Miami, FL (HVHZ)', targetSqFt: 2000, bedrooms: 3, bathrooms: 2, siteSlopeDegrees: 0, soilBearingPsf: 1200, waterTableFt: 2.0, windRatingMph: 175 },
      desc: '2,000 sq ft / 1,200 PSF Soil / 2ft Water Table / 175 MPH HVHZ / Piles Required'
    }
  ];

  const handleRunScenario = async (sc: typeof scenarios[0]) => {
    setIsSimulating(true);
    setSimScenarioName(sc.name);
    try {
      const res = await simulateScenario(sc.params);
      setActiveSimResult(res);
      await refreshWorldState();
    } catch (e) {
      console.error('Simulation error:', e);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleEvaluate = async (promptText: string) => {
    setIsEvaluating(true);
    setAppliedSuccess(false);
    try {
      const rev = await onProposeRevision(promptText);
      setProposedRevision(rev);
    } catch (e) {
      console.error(e);
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleApply = async () => {
    if (!proposedRevision) return;
    setIsApplying(true);
    try {
      await onApplyRevision(promptInput || proposedRevision.description);
      setAppliedSuccess(true);
      setProposedRevision(null);
      setPromptInput('');
    } catch (e) {
      console.error(e);
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Parameter Causality Simulation Gym Section */}
      <div className="p-6 bg-slate-900 rounded-2xl border border-cyan-800/80 shadow-2xl space-y-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Compass className="w-5 h-5 text-cyan-400" /> Parameter Causality Simulation Gym (Scenarios A, B, C, D)
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Demonstrate how changes to floor area, bedrooms, terrain slope, soil bearing, and water table dynamically alter task graph decisions, foundation selection, structural load paths, quantity takeoffs, CPM schedule, and SHA-256 world state hash.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {scenarios.map((sc) => (
            <button
              key={sc.id}
              onClick={() => handleRunScenario(sc)}
              disabled={isSimulating}
              className={`p-4 rounded-xl border text-left transition flex flex-col justify-between space-y-2 ${
                simScenarioName === sc.name
                  ? 'bg-cyan-950/80 border-cyan-500 text-slate-100 shadow-lg shadow-cyan-500/20'
                  : 'bg-slate-950 hover:bg-slate-800/80 border-slate-800 text-slate-300'
              }`}
            >
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 block font-mono">
                  Scenario {sc.id}
                </span>
                <h4 className="text-xs font-bold text-slate-100 mt-0.5">{sc.name.split(': ')[1]}</h4>
                <p className="text-[11px] text-slate-400 mt-1 leading-snug">{sc.desc}</p>
              </div>
              <div className="pt-2 border-t border-slate-800/80 text-[10px] font-mono text-cyan-400 flex items-center justify-between">
                <span>RUN SIMULATION</span>
                <ArrowRight className="w-3 h-3" />
              </div>
            </button>
          ))}
        </div>

        {/* Simulation Causality Comparison Panel */}
        {activeSimResult && (
          <div className="p-5 bg-slate-950 rounded-xl border border-cyan-500/40 space-y-4 text-xs font-mono animate-fadeIn">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5 font-sans">
                <Activity className="w-4 h-4 text-cyan-400" /> {simScenarioName} Result
              </span>
              <span className="text-[10px] text-slate-400">
                SHA-256 Hash: <span className="text-cyan-400 font-mono">{activeSimResult.diagnostics?.worldStateHash?.slice(0, 16)}...</span>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                <span className="text-slate-400 text-[10px] uppercase block font-sans">Foundation Decision</span>
                <span className="text-emerald-400 font-bold block mt-1">
                  {activeSimResult.foundationSelection?.selectedFoundation?.replace(/_/g, ' ')}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  Cap: {activeSimResult.foundationSelection?.structuralCapacityPsf} PSF • Water Table: {activeSimResult.foundationSelection?.waterTableFt}ft
                </span>
              </div>

              <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                <span className="text-slate-400 text-[10px] uppercase block font-sans">Structural Load & Wind</span>
                <span className="text-cyan-400 font-bold block mt-1">
                  q_z = {activeSimResult.structuralEngineering?.windVelocityPressureQz} PSF
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  Uplift: {activeSimResult.structuralEngineering?.windUpliftDemandLbs} lbs • Tag: {activeSimResult.structuralEngineering?.complianceTag}
                </span>
              </div>

              <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                <span className="text-slate-400 text-[10px] uppercase block font-sans">Turnkey BOM Total</span>
                <span className="text-amber-400 font-bold block mt-1">
                  ${activeSimResult.costScopeBreakdown?.turnkeyTotalUSD?.toLocaleString()} USD
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  Materials: ${activeSimResult.costScopeBreakdown?.materialsTotalUSD?.toLocaleString()} • Labor: ${activeSimResult.costScopeBreakdown?.laborTotalUSD?.toLocaleString()}
                </span>
              </div>

              <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                <span className="text-slate-400 text-[10px] uppercase block font-sans">Primavera CPM Duration</span>
                <span className="text-purple-400 font-bold block mt-1">
                  {activeSimResult.diagnostics?.criticalPathDays || 135} Days Critical Path
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  Completed Tasks: {activeSimResult.completedTasks?.length} / {activeSimResult.dynamicTaskIds?.length}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Header */}
      <div className="p-6 bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl space-y-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-cyan-400" /> Interactive Building Customization & Revision Engine
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Modify the digital building twin interactively. HERMES evaluates downstream structural, MEP, cost, schedule, material, and code impacts before applying.
          </p>
        </div>

        {/* Preset Buttons */}
        <div className="space-y-2">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Quick Customization Presets</span>
          <div className="flex flex-wrap gap-2">
            {presets.map((p, i) => (
              <button
                key={i}
                onClick={() => {
                  setPromptInput(p);
                  handleEvaluate(p);
                }}
                className="px-3 py-1.5 bg-slate-950 hover:bg-slate-800 text-cyan-300 border border-slate-800 rounded-xl text-xs transition"
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Input */}
        <div className="flex gap-2 pt-2 border-t border-slate-800">
          <input
            type="text"
            placeholder="Type custom building change (e.g. 'Use metal roof', 'Move wall 4ft east')..."
            value={promptInput}
            onChange={(e) => setPromptInput(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-xl p-3 outline-none w-full"
          />
          <button
            onClick={() => handleEvaluate(promptInput)}
            disabled={!promptInput || isEvaluating}
            className="px-5 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs rounded-xl transition shadow flex items-center gap-1.5 whitespace-nowrap disabled:opacity-50"
          >
            <Sparkles className={`w-4 h-4 ${isEvaluating ? 'animate-spin' : ''}`} />
            {isEvaluating ? 'Evaluating Impacts...' : 'Evaluate Revision'}
          </button>
        </div>
      </div>

      {/* Applied Success Alert */}
      {appliedSuccess && (
        <div className="p-4 bg-emerald-950/80 border border-emerald-800 rounded-2xl text-emerald-300 text-xs flex items-center gap-2">
          <Check className="w-5 h-5 text-emerald-400" />
          <span>Revision successfully applied to Digital Twin! Recalculated 3D BIM components, quantity schedule, and BOM.</span>
        </div>
      )}

      {/* Proposed Revision Impact Analysis Card */}
      {proposedRevision && (
        <div className="p-6 bg-slate-900 rounded-2xl border border-cyan-500/40 shadow-2xl space-y-5 animate-fadeIn">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <span className="text-[10px] uppercase font-bold text-cyan-400 block tracking-widest">PROPOSED REVISION IMPACT ANALYSIS</span>
              <h3 className="text-base font-bold text-slate-100">{proposedRevision.description}</h3>
            </div>

            <div className="flex items-center gap-3 font-mono text-xs">
              <span className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-emerald-400 font-bold">
                Cost: {(proposedRevision.costDelta ?? 0) >= 0 ? `+$${(proposedRevision.costDelta ?? 0).toLocaleString()}` : `-$${Math.abs(proposedRevision.costDelta ?? 0).toLocaleString()}`}
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-cyan-400 font-bold">
                Schedule: +{proposedRevision.scheduleDeltaDays} Days
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
              <span className="text-[10px] uppercase font-bold text-cyan-400 block">Visual & Aesthetic Changes</span>
              <ul className="list-disc list-inside text-slate-300 space-y-1 mt-1">
                {proposedRevision.visualChanges.map((v, i) => (
                  <li key={i}>{v}</li>
                ))}
              </ul>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
              <span className="text-[10px] uppercase font-bold text-amber-400 block">Structural Load Impact</span>
              <p className="text-slate-300">{proposedRevision.structuralImpact}</p>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
              <span className="text-[10px] uppercase font-bold text-blue-400 block">MEP & Thermal Sizing Impact</span>
              <p className="text-slate-300">{proposedRevision.mepImpact}</p>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
              <span className="text-[10px] uppercase font-bold text-emerald-400 block">Building Code Compliance</span>
              <p className="text-slate-300">{proposedRevision.codeImpact}</p>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={handleApply}
              disabled={isApplying}
              className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-bold text-xs rounded-xl transition shadow flex items-center gap-2 disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              {isApplying ? 'Applying Revision to Digital Twin...' : 'APPLY REVISION TO DIGITAL TWIN'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
