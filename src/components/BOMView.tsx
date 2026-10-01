import React from 'react';
import type { BOMItem } from '../types/hermes';
import { useHermesProject } from '../context/HermesProjectContext';
import { deriveMaterialWorkspaceState } from '../lib/materialWorkspaceState';
import { MaterialRequirements } from './immersive/MaterialsWorkspace';
import { money } from './immersive/ProjectOverviewWorkspace';

interface BOMViewProps {
  bom: BOMItem[];
  sourceProjectId?: string;
  onHighlightComponents?: (componentIds: string[], itemName: string) => void;
}

export const BOMView: React.FC<BOMViewProps> = ({ bom, sourceProjectId, onHighlightComponents }) => {
  const { worldState, selectEntity, openInspectorDrawer } = useHermesProject();
  if (!worldState) return <p>Awaiting current project state.</p>;
  const materials = deriveMaterialWorkspaceState(worldState,{ projectBom: bom, sourceProjectId });
  const select = (id: string) => {
    if (onHighlightComponents) onHighlightComponents([id],id);
    else { selectEntity(id); openInspectorDrawer(); }
  };
  return <div className="hx-summary hx-operations rounded-xl bg-white p-5 text-slate-800">
    <section><h3>Project quantity & cost records</h3><p>{worldState.mode} · {worldState.projectName}</p>
      <p>Materials estimate: {money(materials.summary.canonicalMaterialsCostUSD)}</p>
      <p>Turnkey estimate: {money(materials.summary.canonicalTurnkeyCostUSD)}</p>
      <p>Cost categories require a recorded cost breakdown. Supplier quote verification is not connected.</p>
      {bom.length > 0 && sourceProjectId !== worldState.projectId && <p>Unscoped legacy BOM records are excluded from this project.</p>}
    </section>
    <MaterialRequirements state={worldState} materials={materials} actions={{ select, focusEntity: select, focusPosition: () => {}, focusAvailable: false }}/>
  </div>;
};
