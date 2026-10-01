import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { ImmersiveWorkspaceId, WORKSPACE_BY_ID } from '../../lib/immersiveWorkspaceRegistry';

export function InternalWorkspaceSurface({ workspaceId, onClose, children }: {
  workspaceId: ImmersiveWorkspaceId; onClose: () => void; children: React.ReactNode;
}) {
  const definition = WORKSPACE_BY_ID[workspaceId];
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => { heading.current?.focus(); }, [workspaceId]);
  return <section className="hx-workspace" role="region" aria-labelledby={`hx-title-${workspaceId}`}
    style={{ '--workspace-width': `${definition.defaultWidthPx}px` } as React.CSSProperties}>
    <header className="hx-surface-header">
      <h2 id={`hx-title-${workspaceId}`} ref={heading} tabIndex={-1}>{definition.label}</h2>
      <button type="button" className="hx-icon-button" aria-label={`Close ${definition.shortLabel}`} onClick={onClose}><X size={18}/></button>
    </header>
    <div className="hx-workspace-body">{children}</div>
  </section>;
}
