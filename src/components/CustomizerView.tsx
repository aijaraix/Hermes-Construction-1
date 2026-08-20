import React, { useState } from 'react';
import { ProposedRevision } from '../types/hermes';
import { Sparkles, DollarSign, Calendar, Wrench, ShieldCheck, ArrowRight, Check } from 'lucide-react';

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
  const [promptInput, setPromptInput] = useState<string>('');
  const [proposedRevision, setProposedRevision] = useState<ProposedRevision | null>(null);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [isApplying, setIsApplying] = useState<boolean>(false);
  const [appliedSuccess, setAppliedSuccess] = useState<boolean>(false);

  const presets = [
    '24-Ga Galvalume Standing Seam Metal Roof',
    'Full Modular Red Brick Veneer Facade',
    'Contemporary Architectural Facade Package',
    'Reconfigure Level 2 Wall Layout for Master Suite',
  ];

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
                Cost: {proposedRevision.costDelta >= 0 ? `+$${proposedRevision.costDelta.toLocaleString()}` : `-$${Math.abs(proposedRevision.costDelta).toLocaleString()}`}
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
