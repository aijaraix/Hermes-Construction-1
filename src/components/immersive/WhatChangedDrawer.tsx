import React from 'react';
import { X } from 'lucide-react';
import type { WhatChangedSummary } from '../../lib/projectTimelineState';
import { TimelineEventList, EventActions } from './TimelineEventList';
export function WhatChangedDrawer({ summary, actions, onClose, onMarkSeen, persistence }: {
  summary: WhatChangedSummary; actions: EventActions; onClose: () => void; onMarkSeen: () => void; persistence: string;
}) {
  return <section className="hx-what-changed" aria-label="What changed">
    <header className="hx-surface-header"><h2>What changed · {summary.unseenCount}</h2><button className="hx-icon-button" aria-label="Close what changed" onClick={onClose}><X size={18}/></button></header>
    <div className="hx-workspace-body hx-summary">
      <p>{summary.markerValid ? 'Since you last marked this attempt seen.' : 'No valid last-seen marker for this attempt. Showing available history.'}</p>
      <p>{Object.entries(summary.countsByCategory).map(([category,count]) => `${count} ${category.toLowerCase()} events`).join(' · ')}</p>
      {summary.unseenCount === 0 ? <p>Up to date with recorded events.</p> : <TimelineEventList events={summary.events} actions={actions}/>}
      <button className="hx-text-link" onClick={onMarkSeen}>Mark all seen</button><small className="block">{persistence}</small>
    </div>
  </section>;
}
