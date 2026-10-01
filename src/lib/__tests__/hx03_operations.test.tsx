import React from 'react';
import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import type { HermesWorldState } from '../../types/hermes';
import { deriveMaterialWorkspaceState, isOnSiteBatch } from '../materialWorkspaceState';
import { deriveLogisticsWorkspaceState } from '../logisticsWorkspaceState';
import { deriveHumanTimelineState } from '../projectTimelineState';
import { deriveProjectOverviewState } from '../projectOverviewState';
import { resolveInspectableEntity } from '../inspectableEntity';
import { rendererEntityId } from '../inspectorViewState';
import { MaterialSection, MaterialsWorkspace } from '../../components/immersive/MaterialsWorkspace';
import { ScheduleWorkspace } from '../../components/immersive/ScheduleWorkspace';
import { LogisticsWorkspace } from '../../components/immersive/LogisticsWorkspace';
import { OperationsRecordLinks, operationEntityAccess } from '../../components/immersive/OperationsRecordLinks';
import { computeReducedComponentsForEvent } from '../../components/BimWorkspaceView';
import { money } from '../../components/immersive/ProjectOverviewWorkspace';

const actions = { select: () => {}, focusEntity: () => {}, focusPosition: () => {} };
function world(overrides: Partial<HermesWorldState> = {}): HermesWorldState {
  return { projectId:'HERMES-LIVE-HOUSE-001', projectName:'Current house', attemptId:'attempt-2', currentCheckpoint:0,
    currentStepIndex:0, currentPhase:'INTAKE', currentTask:'INTAKE_COMPLETE', activeAgents:[], nextTask:'SITE_SURVEY_CONTROL',
    overallCompletionPct:0, status:'PENDING_INTAKE', mode:'LIVE_PROJECT', projectParams:{}, ...overrides };
}

describe('HX-03 material truth', () => {
  it('leaves absent cost, quantity, unit and supplier evidence unknown', () => {
    const state=world({bomItems:[{itemId:'d'}],materialsOnsite:[{materialId:'m'}]});
    const material=deriveMaterialWorkspaceState(state);
    expect(material.demandLines[0].quantity).toBeUndefined(); expect(material.demandLines[0].unit).toBeUndefined();
    expect(material.physicalBatches[0].quantity).toBeUndefined(); expect(material.physicalBatches[0].unit).toBeUndefined();
    expect(material.summary.canonicalMaterialsCostUSD).toBeUndefined(); expect(material.priceEvidenceConnection).toBe('NOT_CONNECTED');
    const html=renderToStaticMarkup(<MaterialsWorkspace state={state} actions={actions}/>);
    expect(html).toContain('Not calculated'); expect(html).toContain('Suppliers &amp; Price Evidence'); expect(html).toContain('Exceptions');
  });
  it('preserves real zero amounts and rejects nonfinite costs', () => {
    const material=deriveMaterialWorkspaceState(world({bomItems:[{itemId:'d',quantity:0,quantityModeled:50,materialUnitCostUSD:0,unitPriceUSD:90,extendedCostUSD:0,estimatedTotalCost:300}],costScopeBreakdown:{materialsTotalUSD:0,turnkeyTotalUSD:Infinity}}));
    expect(material.demandLines[0]).toMatchObject({quantity:0,materialUnitCostUSD:0,extendedScopedCostUSD:0});
    expect(material.summary.canonicalMaterialsCostUSD).toBe(0); expect(material.summary.canonicalTurnkeyCostUSD).toBeUndefined();
    expect(money(NaN)).toBe('Not calculated'); expect(money(0)).toBe('$0'); expect(money(0.25)).toBe('$0.25');
  });
  it.each([undefined,'STAGED','DELIVERED'])('keeps PURCHASED + LAYDOWN_YARD unverified despite %s status', status => {
    const material=deriveMaterialWorkspaceState(world({materialsOnsite:[{materialBatchId:'m',status,currentLocation:'LAYDOWN_YARD',verificationStatus:'PURCHASED'}]}));
    expect(material.physicalBatches[0].stage).toBe('STAGED_UNVERIFIED'); expect(material.physicalBatches[0].stageLabel).toContain('delivery not verified');
    expect(material.summary.onSiteBatchCount).toBe(1); expect(material.attention).toHaveLength(1);
  });
  it('matches onsite filtering to summary and excludes explicitly offsite or in-transit batches', () => {
    const material=deriveMaterialWorkspaceState(world({materialsOnsite:[
      {materialId:'staged',status:'STAGED'},{materialId:'delivered',status:'DELIVERED',currentLocation:'LAYDOWN_YARD'},
      {materialId:'purchased',status:'ORDERED',currentLocation:'OFFSITE_SUPPLIER'},
      {materialId:'transit',status:'IN_TRANSIT',currentLocation:'TRANSIT_TRUCK'},
      {materialId:'inconsistent',status:'STAGED',currentLocation:'OFFSITE_SUPPLIER'},
    ]}));
    expect(material.physicalBatches.filter(isOnSiteBatch).map(batch=>batch.id)).toEqual(['staged','delivered']);
    expect(material.summary.onSiteBatchCount).toBe(2); expect(material.summary.inTransitBatchCount).toBe(1);
  });
  it('does not attach historical or unscoped BOM/supplier prices to the live house', () => {
    const options={projectBom:[{id:'old',item:'Concrete',unitPrice:425,estimatedTotalCost:9000}] as any,suppliers:[{id:'s',name:'Historical supplier'}] as any};
    for(const sourceProjectId of [undefined,'RESIDENCE-TAMPA-001']) {
      const material=deriveMaterialWorkspaceState(world(),{...options,sourceProjectId});
      expect(material.demandLines).toEqual([]); expect(material.suppliers).toEqual([]);
    }
    const stale=deriveMaterialWorkspaceState(world(),{...options,sourceProjectId:'HERMES-LIVE-HOUSE-001',sourceAttemptId:'attempt-1'});
    expect(stale.demandLines).toEqual([]); expect(stale.suppliers).toEqual([]);
  });
  it('allows explicitly scoped legacy records without promoting their products to verified quote evidence', () => {
    const state=world();
    const material=deriveMaterialWorkspaceState(state,{sourceProjectId:state.projectId,projectBom:[{id:'d',item:'Concrete',modeledQuantity:0,estimatedTotalCost:20}] as any,suppliers:[{id:'s',name:'Recorded supplier',verifiedProducts:[{name:'Concrete',price:20,unit:'bag'}]}] as any});
    expect(material.demandLines[0].quantity).toBe(0); expect(material.suppliers).toHaveLength(1);
    const html=renderToStaticMarkup(<MaterialSection state={state} materials={material} actions={actions} tab="Suppliers & Price Evidence"/>);
    expect(html).toContain('Recorded supplier'); expect(html).toContain('Project-scoped price evidence is not connected');
    expect(html).not.toContain('VERIFIED_CURRENT_QUOTE');
  });
  it('rejects explicit foreign records and foreign canonical cost scope', () => {
    const state=world({bomItems:[{itemId:'foreign',projectId:'other'},{itemId:'current'}],materialsOnsite:[{materialId:'foreign',attemptId:'attempt-1'}],costScopeBreakdown:{projectId:'RESIDENCE-TAMPA-001',turnkeyTotalUSD:400000}});
    const material=deriveMaterialWorkspaceState(state);
    expect(material.demandLines.map(line=>line.id)).toEqual(['current']); expect(material.physicalBatches).toEqual([]);
    expect(deriveProjectOverviewState(state).cost.state).toBe('NOT_CALCULATED');
  });
  it('does not join requirements to batches by similar names or reconcile quantities', () => {
    const material=deriveMaterialWorkspaceState(world({bomItems:[{itemId:'d',description:'Concrete',quantity:100,sourceComponentIds:['wall','wall']}],materialsOnsite:[{materialId:'m',name:'Concrete',quantity:20,status:'CONSUMED'}]}));
    expect(material.demandLines[0].quantity).toBe(100); expect(material.demandLines[0].linkedComponentIds).toEqual(['wall']);
    expect(material.physicalBatches[0].targetComponentId).toBeUndefined(); expect(material.summary.installedBatchCount).toBe(1);
  });
  it('reports only recorded damage, waste, returns and actual truth conflicts', () => {
    const material=deriveMaterialWorkspaceState(world({materialsOnsite:[{id:'a',status:'DAMAGED'},{id:'b',status:'WASTE'},{id:'c',status:'RETURNED'},{id:'d'}]}));
    expect(material.attention.map(item=>item.materialBatchId)).toEqual(['a','b','c']);
    expect(material.summary.exceptionCount).toBe(3);
  });
  it('does not hide damage or returns when delivery verification also conflicts', () => {
    for (const status of ['DAMAGED','WASTE','RETURNED']) {
      const material=deriveMaterialWorkspaceState(world({materialsOnsite:[{id:'m',status,currentLocation:'LAYDOWN_YARD',verificationStatus:'PURCHASED'}]}));
      expect(material.physicalBatches[0].stage).toBe(status);
      expect(material.attention.map(item=>item.id)).toEqual(['material-truth-m','material-exception-m']);
    }
  });
  it('renders batch and requirement records independently in their sections', () => {
    const state=world({bomItems:[{itemId:'d',description:'Demand only'}],materialsOnsite:[{materialId:'m',name:'Batch only',status:'STAGED',worldPosition:[1,2,3]}]});
    const materials=deriveMaterialWorkspaceState(state);
    const demand=renderToStaticMarkup(<MaterialSection state={state} materials={materials} tab="Requirements" actions={actions}/>);
    const onsite=renderToStaticMarkup(<MaterialSection state={state} materials={materials} tab="On Site" actions={actions}/>);
    expect(demand).toContain('Demand only'); expect(demand).not.toContain('Batch only'); expect(demand).toContain('Not recorded');
    expect(onsite).toContain('Batch only'); expect(onsite).not.toContain('Demand only'); expect(onsite).toContain('Inspect m');
  });
});

describe('HX-03 recorded schedule and logistics', () => {
  it('keeps a missing or legacy-only schedule uncalculated without invented days', () => {
    const state=world();
    const schedule=deriveHumanTimelineState(state,{legacySchedule:[{id:'legacy',dayStart:0,dayEnd:7}] as any}).schedule;
    expect(schedule.availability).toBe('NOT_CALCULATED'); expect(schedule.criticalPathDurationDays).toBeUndefined();
    const html=renderToStaticMarkup(<ScheduleWorkspace state={state} actions={actions}/>);
    expect(html).toContain('Detailed schedule not calculated'); expect(html).not.toContain('Calendar Days');
    expect(html).not.toContain('PENDING_CITY_INSPECTION'); expect(html).not.toContain('Standard Trade Rigging');
  });
  it('renders canonical CPM identity, early/late dates, float, dependencies and resources', () => {
    const state=world({scheduleActivities:[{activityId:'A-2',name:'Pour slab',status:'in_progress',durationDays:2,earlyStart:3,earlyFinish:5,lateStart:4,lateFinish:6,totalFloat:1,isCriticalPath:false,predecessors:['A-1'],successors:['A-3'],trade:'Concrete',equipmentRequired:['pump'],componentIds:['slab']}]});
    const schedule=deriveHumanTimelineState(state).schedule;
    expect(schedule.activities[0]).toMatchObject({id:'A-2',name:'Pour slab',status:'IN_PROGRESS',earlyStart:3,lateFinish:6,totalFloatDays:1});
    expect(schedule.criticalPathDurationDays).toBe(5); expect(schedule.criticalActivityIds).toEqual([]);
    const html=renderToStaticMarkup(<ScheduleWorkspace state={state} actions={actions}/>);
    for(const value of ['A-2','Pour slab','IN PROGRESS','3 / 5','4 / 6','1 days','A-1','A-3','Concrete','pump','slab']) expect(html).toContain(value);
    expect(html).not.toContain('HERMES_VALIDATED');
  });
  it('does not fill missing late dates, float, resources or criticality from other fields', () => {
    const schedule=deriveHumanTimelineState(world({scheduleActivities:[{activityId:'a',earlyStart:0,earlyFinish:2},{activityId:'b'}]})).schedule;
    expect(schedule.criticalPathDurationDays).toBeUndefined();
    expect(schedule.activities[0].lateStart).toBeUndefined(); expect(schedule.activities[0].totalFloatDays).toBeUndefined();
    expect(schedule.activities[0].isCriticalPath).toBeUndefined(); expect(schedule.activities[0].equipmentIds).toEqual([]);
  });
  it('excludes foreign schedule records', () => {
    expect(deriveHumanTimelineState(world({scheduleActivities:[{activityId:'foreign',projectId:'other',earlyFinish:300}]})).schedule.availability).toBe('NOT_CALCULATED');
  });
  it('preserves exact logistics relationships and never constructs routes or assignments', () => {
    const state=world({equipmentEntities:[{equipmentId:'e',name:'Pump',worldPosition:[2,0,4],assignedTaskId:'t'}] as any,
      spatialEntities:[{entityId:'zone',entityType:'STAGING_ZONE',name:'Staging'},{entityId:'fuzzy',name:'Staging zone'}],
      materialsOnsite:[{materialId:'m',status:'STAGED',stagingZoneId:'zone'}],
      activeTaskDetails:{taskId:'t',title:'Work',assignedAgentId:'a',workLocationXYZ:[1,0,2],requiredEquipment:['e'],requiredMaterials:['m'],phase:'CONSTRUCTION'},
      constructabilityProof:{proofId:'p',status:'BLOCKED',rationale:'Opening closes early',materialId:'m',closureComponentId:'wall'}});
    const logistics=deriveLogisticsWorkspaceState(state);
    expect(logistics.staging.map(zone=>zone.id)).toEqual(['zone']); expect(logistics.staging[0].batchIds).toEqual(['m']);
    expect(logistics.work?.requiredEquipmentIds).toEqual(['e']); expect(logistics.equipment[0].assignedAgentId).toBeUndefined();
    expect(logistics.proof?.status).toBe('BLOCKED'); expect(logistics).not.toHaveProperty('routes');
    const html=renderToStaticMarkup(<LogisticsWorkspace state={state} actions={actions}/>);
    expect(html).toContain('Opening closes early'); expect(html).toContain('Internal proof is not physical access verification');
  });
  it('leaves unsupported logistics fields unavailable and excludes foreign equipment', () => {
    const state=world({equipmentEntities:[{equipmentId:'other',projectId:'other',worldPosition:[1,2,3]},{equipmentId:'e',worldPosition:['1',2,3]}] as any});
    const logistics=deriveLogisticsWorkspaceState(state);
    expect(logistics.equipment.map(e=>e.id)).toEqual(['e']); expect(logistics.equipment[0].position).toBeUndefined(); expect(logistics.proof).toBeUndefined();
    const html=renderToStaticMarkup(<LogisticsWorkspace state={state} actions={actions}/>);
    expect(html).toContain('No active work location recorded'); expect(html).toContain('No constructability or future-access proof recorded');
  });
});

describe('HX-03 entity bridges and renderer metadata', () => {
  it('enables inspect only for current canonical IDs and focus only for finite spatial evidence', () => {
    const state=world({materialsOnsite:[{materialId:'m',worldPosition:[1,2,3]},{materialId:'bad',worldPosition:['1',2,3]}],buildingComponents:[{componentId:'foreign',projectId:'other',worldPosition:[0,0,0]}]});
    expect(operationEntityAccess(state,'m')).toMatchObject({canInspect:true,canFocus:true});
    expect(operationEntityAccess(state,'bad')).toMatchObject({canInspect:true,canFocus:false});
    expect(operationEntityAccess(state,'missing').canInspect).toBe(false); expect(operationEntityAccess(state,'foreign').canInspect).toBe(false);
    expect(resolveInspectableEntity(state,'foreign')?.kind).toBe('UNKNOWN');
    const html=renderToStaticMarkup(<OperationsRecordLinks state={state} ids={['missing']} actions={actions}/>);
    expect((html.match(/disabled/g)||[]).length).toBe(2);
  });
  it('maps actor aliases including the unprefixed customer and respects component identity collisions', () => {
    const state=world({agentSpatialStates:[{agentId:'worker'},{agentId:'CUSTOMER-001'}]});
    expect(rendererEntityId(state,'worker')).toBe('AGENT-worker'); expect(rendererEntityId(state,'AGENT-worker')).toBe('AGENT-worker');
    expect(rendererEntityId(state,'CUSTOMER-001')).toBe('CUSTOMER-001');
    expect(rendererEntityId(world({...state,buildingComponents:[{componentId:'worker'}]}),'worker')).toBe('worker');
  });
  it('does not generate verification dates or default geotechnical test results', () => {
    const components=computeReducedComponentsForEvent(6,world({boringSamples:[{sampleId:'s',worldPosition:[1,2,3]}],surveyMarks:[{markId:'mark',worldPosition:[0,0,0]}]}));
    expect(components.every(component=>component.provenance.verifiedDate===undefined)).toBe(true);
    const geotech=components.find(component=>component.id==='s')!;
    expect(geotech.position).toEqual([1,2,3]); expect(geotech.inspectionStatus).toBe('UNINSPECTED');
    expect(geotech.propertySets[0].properties).toEqual({BearingCapacity:'Not recorded',SoilType:'Not recorded'});
    expect(components.find(component=>component.id==='mark')?.propertySets[0].properties.Verification).toBe('Not recorded');
  });
  it('retains source-provided provenance without manufacturing a replacement date', () => {
    const provenance={source:'Measured source',creator:'Recorder',verifiedDate:'2020-01-02',license:'L'};
    const components=computeReducedComponentsForEvent(10,world({buildingComponents:[{componentId:'c',name:'Component',createdCheckpoint:0,provenance}]}));
    expect(components.find(component=>component.id==='c')?.provenance).toEqual(provenance);
  });
  it('qualifies fixture geotechnical import labels and preserves a recorded zero water table', () => {
    const overview=deriveProjectOverviewState(world({mode:'REGRESSION_TEST',geotechTruth:{soilClass:'Clay',bearingCapacityPsf:1800,dataOrigin:'VERIFIED_IMPORT'},projectParams:{waterTableFt:0}}));
    expect(overview.site.facts.find(fact=>fact.key==='bearing')?.truthStatus).toContain('not field verified');
    expect(overview.site.facts.find(fact=>fact.key==='groundwater')?.truthStatus).toBe('USER_INPUT');
  });
});
