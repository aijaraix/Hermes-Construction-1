import React, { useState } from 'react';
import type { HermesWorldState } from '../../types/hermes';
import type { ProjectAttentionState } from '../../lib/projectAttentionState';
import { resolveInspectableEntity } from '../../lib/inspectableEntity';
import { finitePosition } from '../../lib/inspectorViewState';

export function AttentionDrawer({ state, attention, onSelect, onFocus }: {
  state: HermesWorldState; attention: ProjectAttentionState; onSelect: (id: string) => void; onFocus: (id: string) => void;
}) {
  const [filter,setFilter] = useState('ALL');
  const filters = ['ALL','BLOCKING','OWNER_DECISION','INSPECTION','CLASH','PROFESSIONAL_REVIEW','AHJ'];
  const items = attention.items.filter(item => filter === 'ALL' || filter === 'BLOCKING' && item.blocking || item.category === filter || filter === 'INSPECTION' && item.category === 'QUALITY');
  return <div className="hx-summary hx-attention-content">
    <p>{attention.activeCount} active records · {attention.blockingCount} blocking · {attention.ownerActionCount} owner actions</p>
    <nav className="hx-tabs" aria-label="Attention filters">{filters.map(value => <button key={value} aria-pressed={filter === value} onClick={() => setFilter(value)}>{value.replace(/_/g,' ')}</button>)}</nav>
    {!items.length && <p>No active issues recorded in this category.</p>}
    {items.map(item => <section key={`${item.source}-${item.category}-${item.id}`}>
      <p className="hx-eyebrow">{item.category.replace(/_/g,' ')} · {item.severity}{item.blocking ? ' · BLOCKING' : ''}</p>
      <h3>{item.title}</h3><p>{item.detail || 'No further detail recorded.'}</p>
      {item.category === 'OWNER_DECISION' && <p>Requested fields: {state.pendingQuestion?.missingFields?.join(', ') || 'See recorded question'}. No response is submitted from this read-only view.</p>}
      {item.recommendedNextAction && <p>{item.recommendedNextAction}</p>}
      {item.relatedEntityIds.map(id => {
        const entity=resolveInspectableEntity(state,id); const known = entity && entity.kind !== 'UNKNOWN';
        return <div key={id} className="hx-row-actions"><button disabled={!known} onClick={() => onSelect(id)}>Open {entity?.name || id}</button><button disabled={!known || !finitePosition(entity.spatial?.position)} onClick={() => onFocus(id)}>Focus</button></div>;
      })}
      <details><summary>Evidence</summary><p>Source: {item.source} · Status: {item.status || 'Not recorded'}</p><p>ID: {item.id}</p>{item.taskId && <p>Task: {item.taskId}</p>}</details>
    </section>)}
    <section><h4>Inspection / external review records</h4>
      {!state.inspectionTickets?.length && <p>No inspection results recorded yet.</p>}
      {(state.inspectionTickets || []).map((ticket,index) => <div className="hx-fact" key={ticket.ticketId || index}>
        <b>{ticket.ticketId || 'Inspection record'} · {ticket.discipline || 'Discipline not recorded'}</b>
        <p>HERMES check: {ticket.status || 'Not recorded'}</p><p>Professional review: {ticket.licensedProfessionalApproval || 'Not recorded'}</p>
        <p>AHJ: {ticket.AHJInspection || 'Not recorded'}</p><p>Occupancy: {ticket.certificateOfOccupancyStatus || 'Not recorded'}</p><small>{ticket.notes}</small>
      </div>)}
      <p>These are recorded states. HERMES checks do not grant professional, municipal or physical approval.</p>
    </section>
    <details><summary>Resolved coordination records</summary>{(state.clashes || []).filter(c => ['RESOLVED','RESOLVED_REROUTED'].includes(String(c.status).toUpperCase())).map((clash,index) => <p key={clash.clashId || index}>{clash.description || clash.clashId} · {clash.status}</p>)}</details>
  </div>;
}
