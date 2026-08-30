import React from 'react';
import { useHermesProject } from '../context/HermesProjectContext';
import { X, ShieldAlert, Play, RefreshCw, Layers } from 'lucide-react';

export const RegressionFixturesModal: React.FC = () => {
  const {
    isRegressionModalOpen,
    closeRegressionModal,
    regressionFixtures,
    activeProjectId,
    setActiveProjectId,
  } = useHermesProject();

  if (!isRegressionModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 space-y-5 animate-in fade-in zoom-in duration-150">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center font-bold">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">Developer Tools → Regression Fixtures</h2>
              <p className="text-xs text-slate-500 font-medium">Historical validation suites and isolated test harnesses</p>
            </div>
          </div>
          <button
            onClick={closeRegressionModal}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
          {regressionFixtures.map((fixture) => {
            const isSelected = activeProjectId === fixture.id;
            return (
              <div
                key={fixture.id}
                className={`p-4 rounded-2xl border transition flex items-center justify-between gap-4 ${
                  isSelected
                    ? 'bg-blue-50/80 border-blue-300 shadow-sm'
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100/80'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-900">{fixture.name}</span>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 border border-amber-200 font-mono">
                      Test Harness
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-mono">ID: {fixture.id} • {fixture.location}</p>
                </div>

                <button
                  onClick={() => {
                    setActiveProjectId(fixture.id);
                    closeRegressionModal();
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-extrabold font-mono transition flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                      : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-300 shadow-xs'
                  }`}
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>{isSelected ? 'Active Test' : 'Run Fixture'}</span>
                </button>
              </div>
            );
          })}
        </div>

        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 text-xs text-slate-600 font-medium leading-relaxed">
          <strong className="text-slate-900 font-bold">Isolated Test Harness Guarantee:</strong> Historical validation fixtures remain fully functional for automated assertions but are isolated from live customer project selection and normal operator workflows.
        </div>
      </div>
    </div>
  );
};
