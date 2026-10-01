import React from 'react';
import { ProjectOverviewState } from '../../lib/projectOverviewState';
import { ImmersiveWorkspaceId } from '../../lib/immersiveWorkspaceRegistry';
export const money = (value?: number) => typeof value !== 'number' || !Number.isFinite(value) ? 'Not calculated' : new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(value);
export function ProjectOverviewWorkspace({ overview: o, onOpen, onWhatChanged }: { overview: ProjectOverviewState; onOpen: (id: ImmersiveWorkspaceId) => void; onWhatChanged?: () => void }) {
  return <div className="hx-summary">
    <section><p className="hx-eyebrow">{o.project.modeLabel}</p><h3>{o.project.name}</h3>
      <p>{o.status.phaseLabel} · {o.status.statusLabel}</p><p>{o.status.completionPct === undefined ? 'Completion unavailable' : `${o.status.completionPct}% recorded completion`}</p>
      <small>Project records describe this {o.project.modeLabel.toLowerCase()}; they do not establish physical acceptance.</small></section>
    <section className="hx-three-columns">{[
      ['Done', o.status.done.latestCompletedLabel || 'No completed work recorded'], ['Doing', o.status.doing.label], ['Next', o.status.next.label],
    ].map(([label, value]) => <div key={label}><h4>{label}</h4><p>{value}</p></div>)}</section>
    <section><button className="hx-text-link" onClick={() => onOpen('QUALITY')}>Needs attention · {o.attention.activeCount}</button>
      <p>{o.attention.blockingCount} blocking · {o.attention.ownerActionCount} owner actions</p>
      {o.attention.items.slice(0, 3).map(i => <p key={i.id}>{i.title}{i.detail ? ` — ${i.detail}` : ''}</p>)}
      {!o.attention.items.length && <p>No active attention records.</p>}</section>
    <section><button className="hx-text-link" onClick={onWhatChanged}>What changed · {o.timeline.whatChanged.unseenCount}</button><small>Events recorded{!o.timeline.whatChanged.markerValid ? '; no prior view marker' : ' since last view'}.</small>
      {o.timeline.whatChanged.events.slice(-3).reverse().map(e => <p key={e.eventId}>{e.title}</p>)}</section>
    <section><button className="hx-text-link" onClick={() => onOpen('MATERIALS')}>Materials</button>
      <p>{o.materials.summary.requirementLineCount} requirement lines · {o.materials.summary.physicalBatchCount} batch records</p>
      <p>{o.materials.summary.onSiteBatchCount} on-site records · {o.materials.summary.installedBatchCount} installed records · {o.materials.summary.exceptionCount} exceptions</p></section>
    <section><button className="hx-text-link" onClick={() => onOpen('SCHEDULE')}>Schedule</button>
      <p>{o.timeline.schedule.availability === 'NOT_CALCULATED' ? 'Detailed schedule not calculated' : `${o.timeline.schedule.activities.length} calculated activities`}</p>
      {o.timeline.schedule.criticalPathDurationDays !== undefined && <p>Recorded schedule horizon: {o.timeline.schedule.criticalPathDurationDays} days</p>}</section>
    <section><h4>Cost estimates</h4><dl><dt>Materials estimate</dt><dd>{money(o.cost.materialsCostUSD)}</dd><dt>Turnkey estimate</dt><dd>{money(o.cost.turnkeyCostUSD)}</dd>
      <dt>BOM scoped total</dt><dd>{money(o.cost.bomScopedCostUSD)}</dd></dl><small>Recorded estimates. Supplier quote verification is not established here.</small></section>
    <section><h4>Quality & approvals</h4><p>{o.quality.summaryLabel}</p>
      <p>HERMES records: {o.quality.inspectionResultCount} inspections · {o.quality.activeInspectionFailureCount} failures · {o.quality.activeClashCount} active clashes</p>
      <p>Professional review: {o.quality.professionalReviewPendingCount} pending records</p><p>AHJ / municipal: {o.quality.ahjPendingCount} pending records</p>
      <p>Occupancy: {o.quality.certificateOfOccupancyPendingCount} pending records</p><small>Missing approval records mean not recorded. HERMES checks do not grant professional, municipal or occupancy approval.</small></section>
    <section><h4>Site & jurisdiction</h4><p>{o.site.location || 'Location not recorded'}</p><p>{o.site.jurisdiction || 'Jurisdiction not recorded'}</p>
      {o.site.facts.map(f => <div key={f.key} className="hx-fact"><b>{f.label}</b><span>{f.value} {f.unit}</span><small>Recorded origin: {f.truthStatus || 'Not recorded'} · {f.source}</small></div>)}
      <small>Imported and fixture labels do not establish a field survey, geotechnical test or professional approval.</small></section>
    <footer><h4>Evidence</h4><p>Checkpoint {o.evidence.checkpoint ?? 'unavailable'} · {o.evidence.eventCount} events · {o.evidence.componentCount} components · {o.evidence.materialBatchCount} batches · {o.evidence.inspectionCount} inspections</p>
      <small className="hx-hash">World hash: {o.evidence.worldStateHash || 'Not recorded'}</small></footer>
  </div>;
}
