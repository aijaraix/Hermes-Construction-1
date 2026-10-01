import React from 'react';
import { HumanProjectStatus } from '../../lib/humanProjectStatus';
export function ProjectStatusHUD({ status, attentionCount, onOpen }: { status?: HumanProjectStatus; attentionCount: number; onOpen: () => void }) {
  return <button type="button" className="hx-status" onClick={onOpen} aria-label="Open project overview">
    {status ? <><strong>{status.phaseLabel} · {status.completionPct === undefined ? 'Completion unavailable' : `${status.completionPct}%`}</strong>
      <span>Now · {status.doing.label}</span><span className="hx-status-next">Next · {status.next.label}</span>
      {attentionCount > 0 && <small>{attentionCount} need attention</small>}</> : <span>Awaiting project state</span>}
  </button>;
}
