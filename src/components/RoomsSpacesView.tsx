import React, { useState } from 'react';
import { DigitalTwinProject, BIMComponent } from '../types/hermes';
import {
  Box,
  Layers,
  Zap,
  Wind,
  Droplet,
  ShieldAlert,
  CheckCircle2,
  RefreshCw,
  Building,
  Info,
} from 'lucide-react';

interface RoomsSpacesViewProps {
  project: DigitalTwinProject;
  onSelectComponent: (comp: BIMComponent) => void;
}

export const RoomsSpacesView: React.FC<RoomsSpacesViewProps> = ({ project, onSelectComponent }) => {
  const components = project.components || [];
  const floors: number[] = Array.from(new Set(components.map((c) => Number(c.floor) || 1))).map(Number).sort((a: number, b: number) => a - b);

  const roomsByFloor: Record<number, string[]> = {};
  floors.forEach((fl: number) => {
    roomsByFloor[fl] = Array.from(
      new Set(components.filter((c) => (Number(c.floor) || 1) === fl).map((c) => c.room).filter(Boolean))
    );
  });

  const [selectedFloor, setSelectedFloor] = useState<number>(floors[0] || 1);
  const availableRooms = roomsByFloor[selectedFloor] || [];
  const [selectedRoom, setSelectedRoom] = useState<string>(
    availableRooms.find((r) => r.includes('204')) || availableRooms[0] || 'Room 204'
  );

  const [coordinationResult, setCoordinationResult] = useState<any>(null);
  const [isCoordinating, setIsCoordinating] = useState(false);

  const roomComponents = components.filter((c) => c.room === selectedRoom || c.room?.includes(selectedRoom));

  const runRoomCoordination = async () => {
    setIsCoordinating(true);
    try {
      const res = await fetch('/api/room/coordinate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId: selectedRoom.toUpperCase().replace(/\s+/g, '-') }),
      });
      const data = await res.json();
      setCoordinationResult(data);
    } catch (e) {
      console.error('Error coordinating room:', e);
    } finally {
      setIsCoordinating(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="p-6 bg-slate-900 rounded-2xl border border-slate-800 space-y-4 shadow-2xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Box className="w-5 h-5 text-cyan-400" />
              <h2 className="text-xl font-bold text-slate-100 tracking-tight">ROOMS & SPACES WORKSPACE</h2>
              <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                {project.name}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-1">
              Hierarchical Spatial Architecture: Building → Floor → Room / Space → Systems & Devices
            </p>
          </div>

          {/* Floor & Room Selectors */}
          <div className="flex items-center gap-3 font-mono text-xs">
            <div>
              <span className="text-[9px] uppercase text-slate-500 block font-sans">Select Floor</span>
              <div className="flex gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                {floors.map((fl) => (
                  <button
                    key={fl}
                    onClick={() => {
                      setSelectedFloor(fl);
                      const rooms = roomsByFloor[fl] || [];
                      if (rooms.length > 0) setSelectedRoom(rooms[0]);
                    }}
                    className={`px-3 py-1 rounded-lg transition font-bold ${
                      selectedFloor === fl
                        ? 'bg-cyan-600 text-slate-950 shadow-md'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Floor {fl}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span className="text-[9px] uppercase text-slate-500 block font-sans">Select Space</span>
              <select
                value={selectedRoom}
                onChange={(e) => setSelectedRoom(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-slate-200 px-3 py-1.5 rounded-xl text-xs font-bold font-mono focus:border-cyan-500 outline-none"
              >
                {availableRooms.map((rm) => (
                  <option key={rm} value={rm}>
                    {rm}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Room Detail Overview */}
      <div className="p-6 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-4 shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <span className="text-cyan-400 font-mono">{selectedRoom}</span> • Space Specification
            </h3>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Floor {selectedFloor} • {roomComponents.length} BIM Components Assigned
            </p>
          </div>

          <button
            onClick={runRoomCoordination}
            disabled={isCoordinating}
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs rounded-xl transition flex items-center gap-2 shadow-lg shadow-cyan-500/20"
          >
            <RefreshCw className={`w-4 h-4 ${isCoordinating ? 'animate-spin' : ''}`} />
            <span>{isCoordinating ? 'Coordinating Trade Swarms...' : 'Execute Room Coordination Cycle'}</span>
          </button>
        </div>

        {/* Components in Room Table */}
        <div className="space-y-3">
          <div className="text-xs font-bold text-slate-300 uppercase tracking-wider font-sans">
            Assigned Building & System Components
          </div>

          {roomComponents.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500 font-mono">
              No components isolated for this space. Select another room or view Digital Twin.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {roomComponents.map((comp) => (
                <div
                  key={comp.id}
                  onClick={() => onSelectComponent(comp)}
                  className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 hover:border-cyan-700/60 cursor-pointer transition space-y-2 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-[10px] text-cyan-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                      {comp.id}
                    </span>
                    <span className="text-[10px] font-bold uppercase text-slate-400 font-mono">
                      {comp.system}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-slate-200 group-hover:text-cyan-300 transition truncate">
                    {comp.assembly}
                  </h4>

                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                    <span>Qty: {comp.quantity.value} {comp.quantity.unit}</span>
                    <span className="text-emerald-400 font-bold">${comp.totalCost.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Room Coordination Cycle Results */}
        {coordinationResult && (
          <div className="p-4 bg-slate-950 rounded-xl border border-cyan-800/60 space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-cyan-400 font-sans uppercase text-[11px]">
                Coordination Cycle Report for {selectedRoom}
              </span>
              <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold text-[10px]">
                {coordinationResult.overallStatus || 'PASSED'}
              </span>
            </div>

            <p className="text-slate-300 font-sans leading-relaxed text-xs">
              Autonomous Trade Managers (Architecture, Structure, Electrical, Mechanical) analyzed spatial clearances, neck velocities, rebar cover, and code compliance.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
