import React, { useState } from 'react';
import type { HermesWorldState } from '../../types/hermes';
import { deriveMaterialWorkspaceState, isOnSiteBatch, MaterialWorkspaceState, PhysicalMaterialBatch } from '../../lib/materialWorkspaceState';
import { money } from './ProjectOverviewWorkspace';
import { OperationsActions, OperationsRecordLinks, recordedValue } from './OperationsRecordLinks';

export const MATERIAL_TABS = ['Overview','Requirements','On Site','Procurement','Suppliers & Price Evidence','Installed','Exceptions'] as const;
type MaterialTab = typeof MATERIAL_TABS[number];
interface MaterialProps { state: HermesWorldState; materials: MaterialWorkspaceState; actions: OperationsActions }

export function MaterialBatchList({ state, batches, actions }: { state: HermesWorldState; batches: PhysicalMaterialBatch[]; actions: OperationsActions }) {
  if (!batches.length) return <p className="hx-empty">No matching batch records.</p>;
  return <ul className="hx-operation-list">{batches.map(batch => <li key={batch.id}>
    <h4>{batch.name}</h4><p>{batch.stageLabel}</p><p>{recordedValue(batch.quantity)} {batch.unit || 'Unit not recorded'}</p>
    <p>Location: {batch.currentLocation || 'Not recorded'}</p>
    {batch.truthWarnings.map(warning => <p className="hx-warning" key={warning}>{warning}</p>)}
    <OperationsRecordLinks state={state} ids={[batch.id]} actions={actions}/>
    <details><summary>Batch details & links</summary><dl>
      <dt>Batch ID</dt><dd>{batch.id}</dd><dt>Recorded supplier</dt><dd>{batch.supplierName || 'Not recorded'}</dd>
      <dt>Legacy verification label</dt><dd>{batch.verificationStatus || 'Not recorded'}</dd>
      <dt>Task</dt><dd>{batch.assignedTaskId || 'Not recorded'}</dd>
      <dt>Created checkpoint</dt><dd>{recordedValue(batch.createdCheckpoint)}</dd>
      <dt>Current world position</dt><dd>{batch.worldPosition ? `${batch.worldPosition.join(', ')} m` : 'Not recorded'}</dd>
      <dt>Dimensions</dt><dd>{batch.dimensions ? `${batch.dimensions.join(' × ')} m` : 'Not recorded'}</dd>
    </dl><OperationsRecordLinks state={state} ids={[batch.targetComponentId,batch.carriedByAgentId,batch.stagingZoneId].filter((id): id is string => Boolean(id))} actions={actions}/>
      {batch.movementHistory?.length ? <ol>{batch.movementHistory.map((move,index) => <li key={index}>{move.timestamp || 'Time not recorded'} · {move.status || 'State not recorded'} · {Array.isArray(move.position) && move.position.length === 3 && move.position.every(Number.isFinite) ? move.position.join(', ') + ' m' : 'Position not recorded'}</li>)}</ol> : <p>No movement history recorded.</p>}
    </details>
  </li>)}</ul>;
}

export function MaterialRequirements({ state, materials, actions }: MaterialProps) {
  const [query,setQuery] = useState('');
  const lines = materials.demandLines.filter(line => `${line.id} ${line.name} ${line.category || ''}`.toLowerCase().includes(query.toLowerCase()));
  return <section><label className="hx-search">Find a requirement<input value={query} onChange={event => setQuery(event.target.value)} placeholder="Name, ID or category"/></label>
    <p>Demand is separate from inventory. Quantities are not reconciled with batch consumption.</p>
    <ul className="hx-operation-list">{lines.map(line => <li key={line.id}><h4>{line.name}</h4><p>{recordedValue(line.quantity)} {line.unit || 'Unit not recorded'} · {line.category || 'Category not recorded'}</p>
      <dl><dt>Quantity source</dt><dd>{line.quantitySource || 'Not recorded'}</dd><dt>Procurement quantity</dt><dd>{recordedValue(line.procurementQuantity)} {line.unit}</dd>
        <dt>Waste allowance</dt><dd>{recordedValue(line.wastePercent,'%')}</dd><dt>Material unit estimate</dt><dd>{money(line.materialUnitCostUSD)}</dd>
        <dt>Labor unit estimate</dt><dd>{money(line.laborUnitCostUSD)}</dd><dt>Equipment unit estimate</dt><dd>{money(line.equipmentUnitCostUSD)}</dd>
        <dt>Extended scoped estimate</dt><dd>{money(line.extendedScopedCostUSD)}</dd><dt>Recorded price origin</dt><dd>{line.priceOrigin || 'Not recorded'}</dd>
        <dt>Recorded supplier</dt><dd>{line.supplierName || 'Not recorded'}</dd><dt>Recorded lead time</dt><dd>{recordedValue(line.leadTimeWeeks,' weeks')}</dd></dl>
      <small>Scoped line estimates can include labor and equipment; they are not verified material-only quotes.</small>
      {line.linkedComponentIds.length ? <OperationsRecordLinks state={state} ids={line.linkedComponentIds} actions={actions}/> : <p>No component links recorded.</p>}
    </li>)}</ul>{!lines.length && <p className="hx-empty">No matching requirement records.</p>}
  </section>;
}

export function MaterialSection({ state, materials, actions, tab }: MaterialProps & { tab: MaterialTab }) {
  const summary = materials.summary;
  if (tab === 'Requirements') return <MaterialRequirements state={state} materials={materials} actions={actions}/>;
  if (tab === 'On Site' || tab === 'Installed') return <section><p>{tab === 'On Site' ? 'Recorded on-site location or stage; delivery evidence remains separate.' : 'Installed / consumed batch records; this is not partial-consumption accounting.'}</p><MaterialBatchList state={state} actions={actions} batches={materials.physicalBatches.filter(batch => tab === 'On Site' ? isOnSiteBatch(batch) : ['INSTALLED','CONSUMED'].includes(batch.stage))}/></section>;
  if (tab === 'Procurement') {
    const stages = [...new Set(materials.physicalBatches.map(batch => batch.stage))];
    return <section><p>Recorded batch lifecycle. Purchase orders, delivery tracking and payments are not connected.</p>
      {!stages.length && <p className="hx-empty">No procurement batch states recorded.</p>}
      {stages.map(stage => <details key={stage}><summary>{stage.replace(/_/g,' ')} · {materials.physicalBatches.filter(batch => batch.stage === stage).length} batches</summary><MaterialBatchList state={state} actions={actions} batches={materials.physicalBatches.filter(batch => batch.stage === stage)}/></details>)}
    </section>;
  }
  if (tab === 'Suppliers & Price Evidence') return <section><h3>Supplier records</h3>
    <p>{materials.supplierConnection === 'NOT_CONNECTED' ? 'Project-scoped supplier records are not connected.' : `${materials.suppliers.length} project-scoped supplier records.`}</p>
    {materials.suppliers.map(supplier => <details key={supplier.id}><summary>{supplier.name}</summary><p>{supplier.address || 'Address not recorded'}</p><p>Distance: {recordedValue(supplier.distanceMiles,' miles')} · Lead time: {recordedValue(supplier.leadTimeDays,' days')}</p>
      {supplier.products.map((product,index) => <p key={index}>{product.name}: {money(product.price)} / {product.unit || 'Unit not recorded'} · {product.availability || 'Availability not recorded'}</p>)}
    </details>)}
    <h3>Price evidence</h3><p>Project-scoped price evidence is not connected. Verified price evidence count is unavailable.</p>
    <p>Supplier names on requirements and batches are recorded text. They do not establish supplier identity, a current quote or a link to historical prices.</p>
  </section>;
  if (tab === 'Exceptions') return <section><p>{summary.exceptionCount} recorded exceptions or verification conflicts.</p>
    {materials.attention.map(item => <article className="hx-operation-card" key={item.id}><h4>{item.title}</h4><p>{item.detail}</p>{item.materialBatchId && <OperationsRecordLinks state={state} ids={[item.materialBatchId]} actions={actions}/>}</article>)}
    {!materials.attention.length && <p>No recorded material exceptions. Delivery or price verification may still be unavailable.</p>}
  </section>;
  return <section><h3>Material records</h3><dl>
    <dt>Requirement lines</dt><dd>{summary.requirementLineCount}</dd><dt>Physical batch records</dt><dd>{summary.physicalBatchCount}</dd>
    <dt>On-site records</dt><dd>{summary.onSiteBatchCount}</dd><dt>Installed / consumed records</dt><dd>{summary.installedBatchCount}</dd>
    <dt>In transit</dt><dd>{summary.inTransitBatchCount}</dd><dt>Exceptions</dt><dd>{summary.exceptionCount}</dd>
    <dt>Materials estimate</dt><dd>{money(summary.canonicalMaterialsCostUSD)}</dd><dt>Turnkey estimate</dt><dd>{money(summary.canonicalTurnkeyCostUSD)}</dd>
    <dt>Supplier evidence</dt><dd>{materials.supplierConnection === 'NOT_CONNECTED' ? 'Not connected' : `${materials.suppliers.length} scoped records`}</dd>
    <dt>Verified price evidence</dt><dd>Not connected</dd>
  </dl><p>Demand, batches and supplier evidence are separate records. No name-based joins or inferred purchases.</p></section>;
}

export function MaterialsWorkspace({ state, actions }: { state: HermesWorldState; actions: OperationsActions }) {
  const [tab,setTab] = useState<MaterialTab>('Overview');
  const materials = deriveMaterialWorkspaceState(state);
  return <div className="hx-summary hx-operations"><p className="hx-record-scope">Current project records · {state.mode}. Replay does not change these records.</p>
    <nav className="hx-tabs" aria-label="Material sections">{MATERIAL_TABS.map(name => <button key={name} aria-pressed={tab === name} onClick={() => setTab(name)}>{name}</button>)}</nav>
    <p className="hx-record-scope">Legacy delivery and inspection labels do not establish physical or professional verification.</p>
    <MaterialSection state={state} materials={materials} actions={actions} tab={tab}/>
  </div>;
}
