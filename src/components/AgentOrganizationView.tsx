import React, { useEffect, useState } from 'react';
import { AgentContract, AgentMessage } from '../types/hermes';
import { Users, ShieldCheck, CheckCircle2, AlertTriangle, FileCode, Search, Filter, Cpu, ArrowUpRight } from 'lucide-react';

export const AgentOrganizationView: React.FC = () => {
  const [contracts, setContracts] = useState<AgentContract[]>([]);
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [selectedRole, setSelectedRole] = useState<AgentContract | null>(null);
  const [filterDiscipline, setFilterDiscipline] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [contractsRes, messagesRes] = await Promise.all([
        fetch('/api/organization/contracts').catch(() => null),
        fetch('/api/organization/messages').catch(() => null)
      ]);

      let contractsData: any[] = [];
      let messagesData: any[] = [];

      if (contractsRes && contractsRes.ok) {
        contractsData = (await contractsRes.json().catch(() => [])) || [];
      }
      if (messagesRes && messagesRes.ok) {
        messagesData = (await messagesRes.json().catch(() => [])) || [];
      }

      setContracts(contractsData);
      setMessages(messagesData);
      if (contractsData.length > 0) {
        setSelectedRole(contractsData[0]);
      }
    } catch {
      // Handle gracefully
    } finally {
      setLoading(false);
    }
  };

  const filteredContracts = contracts.filter(c => {
    const matchesDisc = filterDiscipline === 'ALL' || c.discipline === filterDiscipline;
    const matchesSearch = c.roleName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          c.roleId.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDisc && matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'READY_FOR_CONSTRUCTION_WORK':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> CERTIFIED FOR CONSTRUCTION</span>;
      case 'READY_FOR_SHADOW_WORK':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-950 text-cyan-400 border border-cyan-800 flex items-center gap-1"><Cpu className="w-3 h-3"/> SHADOW MODE ACTIVE</span>;
      case 'COMPETENCY_TESTING':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-950 text-purple-400 border border-purple-800 flex items-center gap-1"><ShieldCheck className="w-3 h-3"/> COMPETENCY TESTING</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-950 text-amber-400 border border-amber-800 flex items-center gap-1"><AlertTriangle className="w-3 h-3"/> INGESTING / RESEARCHING</span>;
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
        <span>Loading HERMES Construction Organization Roster (132 Agent Roles)...</span>
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
                <Users className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-extrabold text-white tracking-tight">HERMES Construction Agent Roster & Contracts</h2>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl">
              132 Logical Specialist Roles across 16 Core Discipline Managers, Floor & Room Managers, Superintendents, and Independent Inspection Swarms. Operating under explicit Agent Contracts and machine-readable boundaries.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-slate-950/80 px-4 py-3 rounded-xl border border-slate-800">
            <div>
              <div className="text-[10px] uppercase font-semibold text-slate-400">Total Defined Roles</div>
              <div className="text-xl font-black text-cyan-400">{contracts.length} Roles</div>
            </div>
            <div className="h-8 w-px bg-slate-800"></div>
            <div>
              <div className="text-[10px] uppercase font-semibold text-slate-400">Certified Core Roles</div>
              <div className="text-xl font-black text-emerald-400">
                {contracts.filter(c => c.readinessStatus === 'READY_FOR_CONSTRUCTION_WORK' && c.isCoreHouse1Role).length} / {contracts.filter(c => c.isCoreHouse1Role).length}
              </div>
            </div>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-semibold text-slate-300">Filter Discipline:</span>
            <select
              value={filterDiscipline}
              onChange={(e) => setFilterDiscipline(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="ALL">All Disciplines (132 Roles)</option>
              <option value="Management">Management & Leadership</option>
              <option value="Structure">Structural Engineering</option>
              <option value="Site">Site & Civil</option>
              <option value="Envelope">Building Envelope</option>
              <option value="Plumbing">Plumbing</option>
              <option value="Electrical">Electrical</option>
              <option value="HVAC">HVAC / Mechanical</option>
              <option value="Fire Protection">Fire Protection</option>
              <option value="Architecture">Architecture & Spatial</option>
              <option value="Quality">Quality & Inspection</option>
              <option value="Procurement">Procurement & Sourcing</option>
            </select>
          </div>

          <div className="relative min-w-[280px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search role name or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>
      </div>

      {/* Main Grid: Roster List (Left) + Contract Inspector (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Role List */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-2 max-h-[700px] overflow-y-auto scrollbar-thin">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 px-2 flex justify-between">
            <span>Role Roster ({filteredContracts.length})</span>
            <span>Competency</span>
          </div>

          {filteredContracts.map((role) => {
            const isSelected = selectedRole?.roleId === role.roleId;
            return (
              <button
                key={role.roleId}
                onClick={() => setSelectedRole(role)}
                className={`w-full text-left p-3 rounded-xl transition border flex items-start justify-between gap-3 ${
                  isSelected
                    ? 'bg-cyan-950/40 border-cyan-600/80 shadow-md shadow-cyan-950/50'
                    : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-800/40'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-100">{role.roleName}</span>
                    {role.isCoreHouse1Role && (
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-cyan-950 text-cyan-400 border border-cyan-800">
                        CORE
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] font-mono text-slate-400">{role.roleId}</div>
                  <div className="pt-1">{getStatusBadge(role.readinessStatus)}</div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-mono font-bold text-cyan-400">{role.competencyScore.toFixed(1)}%</div>
                  <div className="text-[9px] text-slate-400">Coverage: {role.knowledgeCoveragePct.toFixed(1)}%</div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Role Contract Detail Panel */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          {selectedRole ? (
            <div className="space-y-6">
              {/* Role Header */}
              <div className="border-b border-slate-800 pb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black text-white">{selectedRole.roleName}</h3>
                    {getStatusBadge(selectedRole.readinessStatus)}
                  </div>
                  <div className="text-xs font-mono text-cyan-400 mt-1">
                    Role ID: {selectedRole.roleId} • Manager: <span className="text-slate-300">{selectedRole.managerRoleId}</span>
                  </div>
                </div>

                <div className="bg-slate-950 px-4 py-2 rounded-xl border border-slate-800 text-right">
                  <div className="text-[10px] uppercase text-slate-400">Tested Competency Score</div>
                  <div className="text-xl font-black text-emerald-400">{selectedRole.competencyScore.toFixed(1)}%</div>
                </div>
              </div>

              {/* Responsibilities */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-cyan-400" /> Bounded Responsibilities
                </h4>
                <ul className="space-y-1.5 pl-2">
                  {selectedRole.responsibilities.map((resp, idx) => (
                    <li key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                      <span className="text-cyan-500 font-bold">•</span>
                      <span>{resp}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Negative Constraints (Cannot Do) */}
              <div className="bg-rose-950/30 border border-rose-900/60 p-4 rounded-xl">
                <h4 className="text-xs font-bold uppercase tracking-wider text-rose-400 mb-2 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-400" /> Negative Constraints (Strictly Forbidden)
                </h4>
                <ul className="space-y-1 pl-2">
                  {selectedRole.cannotDo.map((item, idx) => (
                    <li key={idx} className="text-xs text-rose-200/90 flex items-start gap-2">
                      <span className="text-rose-500 font-bold">✕</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Inputs, Outputs & Permitted Tools */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 space-y-2">
                  <div className="text-xs font-bold text-slate-300">Required Inputs & Tools</div>
                  <div className="text-xs text-slate-400">
                    <span className="font-semibold text-slate-300">Inputs:</span> {selectedRole.inputs.join(', ')}
                  </div>
                  <div className="text-xs text-slate-400">
                    <span className="font-semibold text-slate-300">Permitted Tools:</span> {selectedRole.tools.map(t => `\`${t}\``).join(', ')}
                  </div>
                </div>

                <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 space-y-2">
                  <div className="text-xs font-bold text-slate-300">Assigned Curricula & Knowledge</div>
                  <div className="text-xs text-slate-400">
                    <span className="font-semibold text-slate-300">Curricula:</span> {selectedRole.knowledgeCurriculum.join(', ')}
                  </div>
                  <div className="text-xs text-slate-400">
                    <span className="font-semibold text-slate-300">Knowledge Coverage:</span> {selectedRole.knowledgeCoveragePct.toFixed(1)}%
                  </div>
                </div>
              </div>

              {/* Inter-Agent Consultation Log */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                  <FileCode className="w-4 h-4 text-cyan-400" /> Active Consultation Log ({messages.filter(m => m.senderRoleId === selectedRole.roleId || m.receiverRoleId === selectedRole.roleId).length})
                </h4>
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 space-y-2 max-h-48 overflow-y-auto">
                  {messages.filter(m => m.senderRoleId === selectedRole.roleId || m.receiverRoleId === selectedRole.roleId).length === 0 ? (
                    <div className="text-xs text-slate-400 italic">No open consultation requests for this role.</div>
                  ) : (
                    messages.filter(m => m.senderRoleId === selectedRole.roleId || m.receiverRoleId === selectedRole.roleId).map(msg => (
                      <div key={msg.messageId} className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 text-xs space-y-1">
                        <div className="flex items-center justify-between font-mono text-[10px] text-cyan-400">
                          <span>{msg.messageType} • {msg.scope}</span>
                          <span className="text-emerald-400">{msg.status}</span>
                        </div>
                        <div className="text-slate-300">{msg.reasoning}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-slate-400">Select an agent role from the left roster to inspect its contract.</div>
          )}
        </div>
      </div>
    </div>
  );
};
