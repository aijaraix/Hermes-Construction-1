import React, { useState } from 'react';
import type { HumanTimelineEvent } from '../../lib/projectTimelineState';
import { finitePosition } from '../../lib/inspectorViewState';
export interface EventActions { replay: (eventId: string) => void; focusEntity: (id: string) => void; canFocusEntity: (id: string) => boolean; focusPosition: (position: [number,number,number]) => void }
export function TimelineEventList({ events, actions }: { events: HumanTimelineEvent[]; actions: EventActions }) {
  const [category,setCategory] = useState('ALL');
  const categories = [...new Set(events.map(event => event.category))];
  const filtered=events.filter(event => category === 'ALL' || event.category === category);
  return <div className="hx-event-list">
    <label>Event category <select value={category} onChange={e => setCategory(e.target.value)}><option value="ALL">All events</option>{categories.map(c => <option key={c}>{c}</option>)}</select></label>
    {!filtered.length && <p>No events recorded in this category.</p>}
    <ol>{filtered.map(event => <li key={`${event.eventId}-${event.sequence}`}>
      <div className="hx-eyebrow">{event.category} · #{event.sequence}{event.phaseLabel ? ` · ${event.phaseLabel}` : ''}</div><b>{event.title}</b><p>{event.detail || 'No additional message recorded.'}</p>
      <div className="hx-row-actions"><button onClick={() => actions.replay(event.eventId)}>Replay from here</button>
        {event.focusEntityIds.filter(actions.canFocusEntity).map(id => <button key={id} onClick={() => actions.focusEntity(id)}>Focus {id}</button>)}
        {finitePosition(event.workLocationXYZ) && <button onClick={() => actions.focusPosition(event.workLocationXYZ!)}>Go to work location</button>}
      </div>
      <details><summary>Event evidence</summary><p>ID: {event.eventId} · {event.timestamp || 'Time not recorded'}</p><p>Actor: {event.actorId || 'Not recorded'} · Task: {event.taskId || 'Not recorded'}</p><p>Affected records: {event.affectedEntityIds.join(', ') || 'Not recorded'}</p><p>Equipment: {event.equipmentIds.join(', ') || 'Not recorded'}</p><p>Materials: {event.materialIds.join(', ') || 'Not recorded'}</p><small>Related records are not a per-event creation or change set.</small></details>
    </li>)}</ol>
  </div>;
}
