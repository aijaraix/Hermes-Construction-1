import React from 'react';
import { Play, Pause } from 'lucide-react';
import type { HermesWorldState } from '../../types/hermes';
import { deriveHumanTimelineState } from '../../lib/projectTimelineState';
import { deriveHumanProjectStatus } from '../../lib/humanProjectStatus';
import { TimelineEventList, EventActions } from './TimelineEventList';
export function ConstructionTimeline({ state, index, count, isPlaying, speed, expanded, setExpanded, setPlaying, setIndex, setSpeed, actions, onWhatChanged }: {
  state: HermesWorldState | null; index: number; count: number; isPlaying: boolean; speed: number; expanded: boolean;
  setExpanded: (value:boolean) => void; setPlaying: (value:boolean) => void; setIndex: (value:number) => void; setSpeed: (value:number) => void;
  actions: EventActions; onWhatChanged: () => void;
}) {
  const timeline=state ? deriveHumanTimelineState(state) : null;
  const status=state ? deriveHumanProjectStatus(state) : null;
  return <section className="hx-construction-timeline" aria-label="Construction history replay">
    <div className="hx-replay-row">
      <button aria-label={isPlaying ? 'Pause replay' : 'Play replay'} disabled={!count} onClick={() => setPlaying(!isPlaying)}>{isPlaying ? <Pause size={14}/> : <Play size={14}/>}</button>
      <span>{count ? `Event ${Math.min(index + 1,count)} / ${count}` : 'No events'}</span>
      <input aria-label="Replay event" type="range" min={0} max={Math.max(0,count-1)} value={Math.min(index,Math.max(0,count-1))} disabled={!count} onChange={e => { setPlaying(false); setIndex(Number(e.target.value)); }}/>
      <select aria-label="Replay speed" value={speed} onChange={e => setSpeed(Number(e.target.value))}>{[0.5,1,2,5,10].map(v => <option key={v} value={v}>{v}×</option>)}</select>
      <button onClick={onWhatChanged}>What changed</button><button aria-expanded={expanded} onClick={() => setExpanded(!expanded)}>{expanded ? 'Collapse' : 'Timeline'}</button>
    </div>
    {expanded && <div className="hx-timeline-expanded">
      <p className="hx-record-scope">View-only history · {state?.mode || 'Mode unavailable'}. Recorded events do not establish physical completion.</p>
      {status && <p>Done: {status.done.latestCompletedLabel || 'None recorded'} · Now: {status.doing.label} · Next: {status.next.label}</p>}
      <p>{timeline?.schedule.availability === 'CALCULATED' ? `${timeline.schedule.activities.length} calculated schedule activities` : 'Detailed construction schedule has not been calculated yet.'}</p>
      <TimelineEventList events={timeline?.events || []} actions={actions}/>
    </div>}
  </section>;
}
