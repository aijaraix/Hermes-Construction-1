import React from 'react';
import { AlertTriangle } from 'lucide-react';
import type { ProjectAttentionState } from '../../lib/projectAttentionState';
export function AttentionChip({ attention, onOpen }: { attention: ProjectAttentionState; onOpen: () => void }) {
  return <button className="hx-attention-chip" onClick={onOpen} aria-label={`Needs attention: ${attention.activeCount}, ${attention.blockingCount} blocking, ${attention.ownerActionCount} owner actions`}>
    <AlertTriangle size={14}/><span>Attention · {attention.activeCount}</span>
    {attention.blockingCount > 0 && <small>{attention.blockingCount} blocking</small>}
  </button>;
}
