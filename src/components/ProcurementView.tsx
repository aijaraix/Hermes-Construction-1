import React from 'react';
import type { SupplierSource } from '../types/hermes';
import { useHermesProject } from '../context/HermesProjectContext';
import { deriveMaterialWorkspaceState } from '../lib/materialWorkspaceState';
import { MaterialSection } from './immersive/MaterialsWorkspace';

interface ProcurementViewProps { suppliers: SupplierSource[]; sourceProjectId?: string }
export const ProcurementView: React.FC<ProcurementViewProps> = ({ suppliers, sourceProjectId }) => {
  const { worldState } = useHermesProject();
  if (!worldState) return <p>Awaiting current project state.</p>;
  const materials = deriveMaterialWorkspaceState(worldState,{ suppliers, sourceProjectId });
  return <div className="hx-summary hx-operations rounded-xl bg-white p-5 text-slate-800">
    <h3>Supplier & price evidence</h3><p>{worldState.mode} · {worldState.projectName}</p>
    <MaterialSection state={worldState} materials={materials} tab="Suppliers & Price Evidence" actions={{ select: () => {}, focusEntity: () => {}, focusPosition: () => {}, focusAvailable: false }}/>
  </div>;
};
