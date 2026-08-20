import React, { useEffect, useState } from 'react';
import { RoomScope, AgentMessage } from '../types/hermes';
import { Box, Zap, Wind, Layers, ShieldCheck, RefreshCw, CheckCircle2, ArrowRight } from 'lucide-react';

export const RoomCoordinationView: React.FC = () => {
  const [room, setRoom] = useState<RoomScope | null>(null);
  const [lastConsultation, setLastConsultation] = useState<AgentMessage | null>(null);
  const [resolutionNote, setResolutionNote] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [isCoordinating, setIsCoordinating] = useState<boolean>(false);

  useEffect(() => {
    fetchRoomScope();
  }, []);

  const fetchRoomScope = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/room/scope?roomId=ROOM-204');
      const data = await res.json();
      setRoom(data);
    } catch (e) {
      console.error('Failed to load Room Scope:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleTriggerCoordination = async () => {
    try {
      setIsCoordinating(true);
      const res = await fetch('/api/room/coordinate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId: 'ROOM-204' })
      });
      const data = await res.json();
      setRoom(data.room);
      setLastConsultation(data.consultationMessage);
      setResolutionNote(data.resolutionReason);
    } catch (e) {
      console.error('Coordination cycle error:', e);
    } finally {
      setIsCoordinating(false);
    }
  };

  if (loading || !room) {
    return (
      <div className="p-8 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
        <span>Connecting to Room 204 Spatial Coordination Engine...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex flex-wrap items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-cyan-950 border border-cyan-800 rounded-xl text-cyan-400">
                <Box className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-extrabold text-white tracking-tight">Room-Level Spatial Coordination — Room 204</h2>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl">
              Second Floor Office (Bedroom 204) spatial coordination managed by Room Construction Manager Room 204. Resolving multi-trade clashes, device ergonomics, and ceiling cavity clearances.
            </p>
          </div>

          <button
            onClick={handleTriggerCoordination}
            disabled={isCoordinating}
            className="px-4 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center gap-2 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isCoordinating ? 'animate-spin' : ''}`} />
            <span>{isCoordinating ? 'Coordinating Trades...' : 'Run Room 204 Coordination Cycle'}</span>
          </button>
        </div>

        {/* Room Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-4 border-t border-slate-800/80">
          <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
            <div className="text-[10px] uppercase font-semibold text-slate-400">Room Name</div>
            <div className="text-sm font-black text-white">{room.name}</div>
          </div>
          <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
            <div className="text-[10px] uppercase font-semibold text-slate-400">Floor Area & Height</div>
            <div className="text-sm font-black text-cyan-400">{room.areaSqFt} SQFT • {room.ceilingHeightFt} FT Ceiling</div>
          </div>
          <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
            <div className="text-[10px] uppercase font-semibold text-slate-400">Assigned Components</div>
            <div className="text-sm font-black text-purple-400">{room.componentsAssigned.length} Devices/Elements</div>
          </div>
          <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
            <div className="text-[10px] uppercase font-semibold text-slate-400">Required Trades</div>
            <div className="text-xs font-bold text-emerald-400">{room.requiredTrades.join(', ')}</div>
          </div>
        </div>
      </div>

      {/* Connectivity Chains Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Electrical Systemic Connectivity Chain */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-950 border border-amber-800 rounded-xl text-amber-400">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">Electrical Systemic Connectivity Chain</h3>
              <p className="text-[11px] text-slate-400">Device to Utility Service Traced Path</p>
            </div>
          </div>

          <div className="space-y-2 bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs font-mono">
            <div className="flex items-center justify-between text-slate-300">
              <span className="text-slate-400">Receptacles:</span>
              <span className="text-amber-300 font-bold">{room.electricalChain.receptacleIds.join(', ')}</span>
            </div>
            <div className="flex justify-center text-slate-500"><ArrowRight className="w-4 h-4 rotate-90" /></div>
            <div className="flex items-center justify-between text-slate-300">
              <span className="text-slate-400">Branch Circuit:</span>
              <span className="text-cyan-300 font-bold">{room.electricalChain.circuitId}</span>
            </div>
            <div className="flex justify-center text-slate-500"><ArrowRight className="w-4 h-4 rotate-90" /></div>
            <div className="flex items-center justify-between text-slate-300">
              <span className="text-slate-400">Sub-Panel:</span>
              <span className="text-blue-300 font-bold">{room.electricalChain.panelId}</span>
            </div>
            <div className="flex justify-center text-slate-500"><ArrowRight className="w-4 h-4 rotate-90" /></div>
            <div className="flex items-center justify-between text-slate-300">
              <span className="text-slate-400">Main Feeder:</span>
              <span className="text-purple-300 font-bold">{room.electricalChain.feederId}</span>
            </div>
            <div className="flex justify-center text-slate-500"><ArrowRight className="w-4 h-4 rotate-90" /></div>
            <div className="flex items-center justify-between text-slate-300">
              <span className="text-slate-400">Utility Service:</span>
              <span className="text-emerald-300 font-bold">{room.electricalChain.serviceId}</span>
            </div>
          </div>
        </div>

        {/* HVAC Systemic Connectivity Chain */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-cyan-950 border border-cyan-800 rounded-xl text-cyan-400">
              <Wind className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">HVAC Air Distribution Chain</h3>
              <p className="text-[11px] text-slate-400">Diffuser to Air Handler Unit Traced Path</p>
            </div>
          </div>

          <div className="space-y-2 bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs font-mono">
            <div className="flex items-center justify-between text-slate-300">
              <span className="text-slate-400">Diffusers / Grilles:</span>
              <span className="text-cyan-300 font-bold">{room.hvacChain.diffuserIds.join(' | ')}</span>
            </div>
            <div className="flex justify-center text-slate-500"><ArrowRight className="w-4 h-4 rotate-90" /></div>
            <div className="flex items-center justify-between text-slate-300">
              <span className="text-slate-400">Branch Duct:</span>
              <span className="text-blue-300 font-bold">{room.hvacChain.branchDuctId}</span>
            </div>
            <div className="flex justify-center text-slate-500"><ArrowRight className="w-4 h-4 rotate-90" /></div>
            <div className="flex items-center justify-between text-slate-300">
              <span className="text-slate-400">Main Trunk Duct:</span>
              <span className="text-purple-300 font-bold">{room.hvacChain.trunkDuctId}</span>
            </div>
            <div className="flex justify-center text-slate-500"><ArrowRight className="w-4 h-4 rotate-90" /></div>
            <div className="flex items-center justify-between text-slate-300">
              <span className="text-slate-400">Mechanical Unit:</span>
              <span className="text-emerald-300 font-bold">{room.hvacChain.equipmentId}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Active Consultation & Clash Resolution Result */}
      {resolutionNote && (
        <div className="bg-emerald-950/40 border border-emerald-900/80 rounded-2xl p-6 shadow-xl space-y-3">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
            <CheckCircle2 className="w-5 h-5" />
            <span>Room 204 Coordination Cycle Result</span>
          </div>
          <div className="text-xs text-emerald-200 leading-relaxed font-mono bg-slate-950 p-4 rounded-xl border border-slate-800">
            {resolutionNote}
          </div>
        </div>
      )}
    </div>
  );
};
