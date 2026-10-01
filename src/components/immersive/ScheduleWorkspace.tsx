import React, { useState } from 'react';
import type { HermesWorldState } from '../../types/hermes';
import { deriveHumanTimelineState, HumanScheduleState } from '../../lib/projectTimelineState';
import { OperationsActions, OperationsRecordLinks, recordedValue } from './OperationsRecordLinks';

export function ScheduleDetails({ schedule, state, actions }: { schedule: HumanScheduleState; state: HermesWorldState; actions: OperationsActions }) {
  const [filter,setFilter] = useState('ALL');
  const activities = schedule.activities.filter(activity => filter === 'ALL' || (filter === 'CRITICAL' ? activity.isCriticalPath === true : activity.status === filter));
  return <section>
    <h3>{schedule.availability === 'NOT_CALCULATED' ? 'Detailed schedule not calculated' : 'Calculated schedule records'}</h3>
    <p>Recorded schedule horizon: {recordedValue(schedule.criticalPathDurationDays,' days')}</p>
    {schedule.availability === 'NOT_CALCULATED' && <p>There is no calculated CPM schedule for this project. Legacy activity lists do not establish a calculated critical path.</p>}
    <label className="hx-search">Activities<select value={filter} onChange={event => setFilter(event.target.value)}>
      <option value="ALL">All activities</option><option value="CRITICAL">Recorded critical path</option><option value="IN_PROGRESS">In progress</option><option value="PLANNED">Planned</option><option value="COMPLETED">Completed</option>
    </select></label>
    <ul className="hx-operation-list">{activities.map(activity => <li key={activity.id}>
      <h4>{activity.name}</h4><p>{activity.id} · {activity.status.replace(/_/g,' ')}</p>
      <p>Critical path: {activity.isCriticalPath === undefined ? 'Not recorded' : activity.isCriticalPath ? 'Recorded critical activity' : 'Recorded noncritical activity'}</p>
      <dl><dt>Duration</dt><dd>{recordedValue(activity.durationDays,' days')}</dd>
        <dt>Early start / finish</dt><dd>{recordedValue(activity.earlyStart)} / {recordedValue(activity.earlyFinish)}</dd>
        <dt>Late start / finish</dt><dd>{recordedValue(activity.lateStart)} / {recordedValue(activity.lateFinish)}</dd>
        <dt>Total float</dt><dd>{recordedValue(activity.totalFloatDays,' days')}</dd>
        <dt>Trade</dt><dd>{activity.trade || 'Not recorded'}</dd>
        <dt>Predecessors</dt><dd>{activity.predecessorIds.join(', ') || 'None recorded'}</dd>
        <dt>Successors</dt><dd>{activity.successorIds.join(', ') || 'None recorded'}</dd>
        <dt>Recorded inspection status</dt><dd>{activity.inspectionStatus || 'Not recorded'}</dd>
      </dl>
      <details><summary>Equipment & component links</summary>
        <p>Required equipment: {activity.equipmentIds.join(', ') || 'Not recorded'}</p>
        <OperationsRecordLinks state={state} ids={activity.equipmentIds} actions={actions}/>
        <p>Components: {activity.componentIds.length ? `${activity.componentIds.length} recorded links` : 'Not recorded'}</p>
        <OperationsRecordLinks state={state} ids={activity.componentIds} actions={actions}/>
      </details>
    </li>)}</ul>
    {!activities.length && <p className="hx-empty">No matching activity records.</p>}
  </section>;
}

export function ScheduleWorkspace({ state, actions }: { state: HermesWorldState; actions: OperationsActions }) {
  return <div className="hx-summary hx-operations"><p className="hx-record-scope">Current project schedule · {state.mode}. Durations use the recorded schedule day basis.</p>
    <ScheduleDetails schedule={deriveHumanTimelineState(state).schedule} state={state} actions={actions}/>
    <p className="hx-record-scope">Recorded inspection status does not grant professional or municipal approval. Replay controls remain in the bottom timeline.</p>
  </div>;
}
