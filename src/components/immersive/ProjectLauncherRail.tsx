import React, { useState } from 'react';
import { LayoutDashboard, Layers, Package, Calendar, Users, Truck, ShieldCheck, Network, Terminal, MoreHorizontal } from 'lucide-react';
import { IMMERSIVE_WORKSPACES, ImmersiveWorkspaceId } from '../../lib/immersiveWorkspaceRegistry';

const icons = { LAYOUT_DASHBOARD: LayoutDashboard, LAYERS: Layers, PACKAGE: Package, CALENDAR: Calendar, USERS: Users, TRUCK: Truck, SHIELD_CHECK: ShieldCheck, NETWORK: Network };
export function ProjectLauncherRail({ active, onToggle, onDeveloper, badges }: {
  active: ImmersiveWorkspaceId | null; onToggle: (id: ImmersiveWorkspaceId) => void;
  onDeveloper: () => void; badges: Partial<Record<ImmersiveWorkspaceId, number>>;
}) {
  const [more, setMore] = useState(false);
  return <nav className="hx-launcher" aria-label="Project workspaces" onKeyDown={e => {
    if (e.key === 'Escape' && more) { e.stopPropagation(); e.preventDefault(); setMore(false); }
  }}>
    <div className={`hx-launcher-items ${more ? 'hx-more-open' : ''}`}>
      {IMMERSIVE_WORKSPACES.map(item => {
        const Icon = icons[item.iconKey];
        const badge = badges[item.id] || 0;
        return <button key={item.id} type="button" data-workspace={item.id}
          data-mobile-primary={item.mobilePrimary} className="hx-launcher-button"
          aria-label={`${item.label}${badge > 0 ? `, ${badge} items` : ''}`} aria-pressed={active === item.id}
          aria-keyshortcuts={item.keyboardShortcut} title={`${item.label} (${item.keyboardShortcut})`}
          onClick={() => { onToggle(item.id); setMore(false); }}>
          <Icon size={20}/><span className="hx-rail-label">{item.shortLabel}</span>
          {badge > 0 && <span className="hx-badge">{badge > 99 ? '99+' : badge}</span>}
        </button>;
      })}
    </div>
    <button type="button" className="hx-mobile-more hx-launcher-button" aria-label="More workspaces" aria-expanded={more} onClick={() => setMore(!more)}><MoreHorizontal size={20}/></button>
    <button type="button" className="hx-launcher-button hx-developer" aria-label="Developer / System" title="Developer / System" onClick={onDeveloper}><Terminal size={20}/></button>
  </nav>;
}
