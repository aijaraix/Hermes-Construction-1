import React, { useState } from 'react';
import { DigitalTwinProject, LearnedLesson } from '../types/hermes';
import { Activity, Trophy, Play, CheckCircle2, History, ArrowRight } from 'lucide-react';

interface GymViewProps {
  projects: DigitalTwinProject[];
  lessons: LearnedLesson[];
  onSelectProject: (id: string) => void;
  onCreateGymProject: (level: number, prompt: string) => void;
}

export const GymView: React.FC<GymViewProps> = ({
  projects,
  lessons,
  onSelectProject,
  onCreateGymProject,
}) => {
  const [selectedLevel, setSelectedLevel] = useState<number>(3);
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [comparingIds, setComparingIds] = useState<[string, string]>(['HOTEL-FL-00127', 'TOWN-IN-00201']);

  const levels = [
    { level: 1, name: 'Level 1: Utility Structures', desc: 'Simple equipment shelters & storage shed foundations' },
    { level: 2, name: 'Level 2: Small Residential Wood Frame', desc: 'Single-story wood frame homes in standard climate' },
    { level: 3, name: 'Level 3: Florida Coastal Single-Family', desc: '150 MPH hurricane wind, salt air, flood zone AE' },
    { level: 4, name: 'Level 4: Townhouses', desc: 'Multi-family party walls, Indiana freeze-thaw cycles' },
    { level: 5, name: 'Level 5: Small Multifamily', desc: '3-story wood/masonry hybrid residential' },
    { level: 6, name: 'Level 6: Concrete Multifamily', desc: 'Post-tensioned elevated decks & elevator core' },
    { level: 7, name: 'Level 7: Small Hotels', desc: 'Commercial MEP riser shafts, fire sprinkler zoning' },
  ];

  const handleLaunch = () => {
    onCreateGymProject(selectedLevel, customPrompt || `Gym Exercise Level ${selectedLevel}`);
    setCustomPrompt('');
  };

  const p1 = projects.find((p) => p.id === comparingIds[0]);
  const p2 = projects.find((p) => p.id === comparingIds[1]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl space-y-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs uppercase tracking-widest font-bold text-cyan-400 bg-cyan-950 px-2.5 py-0.5 rounded-full border border-cyan-800">
              PERSISTENT AUTONOMOUS GYM
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Activity className="w-5 h-5 text-cyan-400" /> HERMES Construction Gym & Learning Memory
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            When HERMES is not processing a user request, Prime trains on progressively harder construction challenges to eliminate weaknesses.
          </p>
        </div>

        {/* Launch Gym Exercise */}
        <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
          <span className="text-xs font-bold uppercase text-slate-300 block">Launch Autonomous Training Gym Exercise</span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(Number(e.target.value))}
              className="bg-slate-900 border border-slate-800 text-xs text-slate-200 rounded-xl p-2.5 outline-none font-semibold"
            >
              {levels.map((l) => (
                <option key={l.level} value={l.level}>
                  {l.name}
                </option>
              ))}
            </select>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Optional exercise objective (e.g. Coastal drainage)..."
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                className="bg-slate-900 border border-slate-800 text-xs text-slate-200 rounded-xl p-2.5 outline-none w-full"
              />
              <button
                onClick={handleLaunch}
                className="px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs rounded-xl transition shadow flex items-center gap-1.5 whitespace-nowrap"
              >
                <Play className="w-4 h-4" /> Start Gym Project
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Historical Lab Comparison */}
      <div className="p-6 bg-slate-900 rounded-2xl border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
          <History className="w-4 h-4 text-cyan-400" /> HERMES Construction Lab (Compare Training Iterations)
        </h3>

        {p1 && p2 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
              <div className="flex justify-between font-sans font-bold text-slate-200">
                <span>{p1.name}</span>
                <span className="text-cyan-400">Score: {p1.score.overall}</span>
              </div>
              <p className="text-slate-400 font-sans text-[11px]">{p1.environment.locationName}</p>
              <div className="pt-2 text-[11px] text-slate-300 space-y-1">
                <div>Completeness: {p1.score.completeness}%</div>
                <div>Structural Validation: {p1.score.structuralValidation}%</div>
                <div>Inspection Success: {p1.score.inspectionSuccess}%</div>
                <div>Open Failures: {p1.inspectionTickets.filter((t) => t.status !== 'verified_closed').length}</div>
              </div>
            </div>

            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
              <div className="flex justify-between font-sans font-bold text-slate-200">
                <span>{p2.name}</span>
                <span className="text-emerald-400">Score: {p2.score.overall}</span>
              </div>
              <p className="text-slate-400 font-sans text-[11px]">{p2.environment.locationName}</p>
              <div className="pt-2 text-[11px] text-slate-300 space-y-1">
                <div>Completeness: {p2.score.completeness}%</div>
                <div>Structural Validation: {p2.score.structuralValidation}%</div>
                <div>Inspection Success: {p2.score.inspectionSuccess}%</div>
                <div>Open Failures: {p2.inspectionTickets.filter((t) => t.status !== 'verified_closed').length}</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Postmortems & Reusable Learned Assemblies */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
          <Trophy className="w-4 h-4 text-amber-400" /> Postmortems & Learned Assemblies Library
        </h3>
        <div className="space-y-3">
          {lessons.map((les) => (
            <div key={les.id} className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-2 text-xs">
              <div className="flex items-center justify-between font-bold text-slate-200">
                <span>{les.projectName}</span>
                <span className="text-cyan-400 font-mono">{les.reusableAssembly}</span>
              </div>
              <p className="text-slate-300"><strong className="text-emerald-400">Worked:</strong> {les.whatWorked}</p>
              <p className="text-slate-300"><strong className="text-red-400">Failed & Repaired:</strong> {les.whatFailed} → {les.whatRequiredRepair}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
