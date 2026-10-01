import React, { useEffect, useState } from 'react';
import { X, Crosshair, EyeOff, Focus } from 'lucide-react';
import type { HermesWorldState } from '../../types/hermes';
import { defaultInspectorTab, inspectorViewState, InspectorTab } from '../../lib/inspectorViewState';
import { resolveInspectableEntity } from '../../lib/inspectableEntity';

export interface InspectorActions { canFocus: boolean; canIsolate: boolean; canHide: boolean; focus: () => void; isolate: () => void; hide: () => void; select: (id: string) => void }
export function UniversalInspector({ state, selectedId, actions, onClose }: { state: HermesWorldState; selectedId: string | null; actions: InspectorActions; onClose: () => void }) {
  const view = inspectorViewState(state,selectedId);
  const [tab, setTab] = useState<InspectorTab>(defaultInspectorTab(view.entity));
  useEffect(() => setTab(defaultInspectorTab(view.entity)), [state.projectId,state.attemptId,selectedId]);
  const tabs = (Object.keys(view.fields) as InspectorTab[]).filter(t => t === 'Overview' || t === 'Quality' || t === 'Provenance' || t === 'Construction' && ['ACTOR','EQUIPMENT'].includes(view.entity.kind) || view.fields[t].length > 0);
  return <aside className="hx-universal-inspector" aria-label={`${view.entity.kind.toLowerCase()} inspector`}>
    <header className="hx-surface-header"><div><small>{view.entity.kind}</small><h2>{view.entity.name}</h2></div><button className="hx-icon-button" aria-label="Close inspector" onClick={onClose}><X size={18}/></button></header>
    <div className="hx-inspector-actions">
      <button disabled={!actions.canFocus} onClick={actions.focus}><Crosshair size={14}/> Focus</button>
      <button disabled={!actions.canIsolate} onClick={actions.isolate}><Focus size={14}/> Isolate</button>
      <button disabled={!actions.canHide} onClick={actions.hide}><EyeOff size={14}/> Hide</button>
    </div>
    <nav className="hx-tabs" aria-label="Inspector sections">{tabs.map(t => <button key={t} aria-pressed={tab === t} onClick={() => setTab(t)}>{t}</button>)}</nav>
    <div className="hx-inspector-body">
      <p className="hx-record-scope">Current project record · {state.mode}. Replay changes the visible history, not this record.</p>
      {view.entity.kind === 'UNKNOWN' && <p>No canonical record was found for this selection. Rendered proxy metadata does not establish project facts.</p>}
      <dl>{view.fields[tab].map((field,index) => <React.Fragment key={`${field.label}-${index}`}><dt>{field.label}</dt><dd>{String(field.value)} {field.unit}</dd></React.Fragment>)}</dl>
      {!view.fields[tab].length && <p>{tab === 'Quality' ? 'No inspection results recorded for this entity.' : 'Not recorded for this entity.'}</p>}
      {tab === 'Quality' && <p>Internal HERMES validation and legacy verification labels do not establish licensed professional, AHJ or physical approval. Missing approval evidence is not approval.</p>}
      {tab === 'Spatial' && !actions.canFocus && <p>Focus unavailable: no supported current world position is recorded.</p>}
      {(tab === 'Overview' || tab === 'Construction') && view.entity.relationships.length > 0 && <section><h3>Related records</h3>{view.entity.relationships.map((relation,index) => {
        const resolved = resolveInspectableEntity(state,relation.targetId);
        return <div key={index}><span>{relation.label} · </span><button className="hx-text-link" disabled={!resolved || resolved.kind === 'UNKNOWN'} onClick={() => actions.select(relation.targetId!)}>{relation.targetId}</button></div>;
      })}</section>}
      {tab === 'Provenance' && <><h3>Related event evidence · {view.relatedEvents.length}</h3><p>Related entities are not necessarily created or modified by each event.</p>{view.relatedEvents.map((event,index) => <details key={event.eventId || index}><summary>{event.eventType} · {event.eventId || 'ID not recorded'}</summary><p>{event.payload?.message || event.summary || event.message || 'Detail not recorded'}</p><small>Sequence {event.sequence ?? 'not recorded'} · {event.timestamp || 'Time not recorded'}</small></details>)}</>}
    </div>
  </aside>;
}
