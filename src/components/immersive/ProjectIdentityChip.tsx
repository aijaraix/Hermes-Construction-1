import React from 'react';
import { ChevronDown, Plus, FlaskConical } from 'lucide-react';
import { useHermesProject } from '../../context/HermesProjectContext';
export function ProjectIdentityChip({ open, setOpen, modeLabel }: { open: boolean; setOpen: (v: boolean) => void; modeLabel: string }) {
  const ctx = useHermesProject();
  const name = ctx.worldState?.projectName || ctx.activeProjectMeta.name || ctx.activeProjectId;
  return <div className="hx-identity">
    <button type="button" className="hx-identity-button" aria-expanded={open} aria-controls="hx-project-switcher" onClick={() => setOpen(!open)}>
      <span className={`hx-connection hx-connection-${ctx.connectionStatus.toLowerCase()}`} title={ctx.connectionStatus}/>
      <span className="hx-identity-name">{name}<small>{modeLabel} · {ctx.connectionStatus.toLowerCase()}</small></span><ChevronDown size={16}/>
    </button>
    {open && <div id="hx-project-switcher" className="hx-project-switcher">
      <label htmlFor="hx-project-choice">Live projects</label>
      <select id="hx-project-choice" value={ctx.activeProjectId} onChange={e => { ctx.setActiveProjectId(e.target.value); setOpen(false); }}>
        {!ctx.liveProjects.some(p => p.id === ctx.activeProjectId) && <option value={ctx.activeProjectId}>{name} — {modeLabel}</option>}
        {ctx.liveProjects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
      </select>
      <button type="button" onClick={() => { ctx.openNewProjectModal(); setOpen(false); }}><Plus size={16}/> New project</button>
      <button type="button" onClick={() => { ctx.openRegressionModal(); setOpen(false); }}><FlaskConical size={16}/> Test fixtures</button>
    </div>}
  </div>;
}
