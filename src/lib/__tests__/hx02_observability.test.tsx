import React from 'react';
import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import type { HermesWorldState } from '../../types/hermes';
import { resolveInspectableEntity } from '../inspectableEntity';
import { inspectorViewState, finitePosition, rendererEntityId } from '../inspectorViewState';
import { deriveProjectAttentionState } from '../projectAttentionState';
import { deriveHumanTimelineState, createLastSeenMarker, lastSeenStorageKey } from '../projectTimelineState';
import { readLastSeen, writeLastSeen } from '../projectLastSeen';
import { UniversalInspector } from '../../components/immersive/UniversalInspector';
import { AttentionDrawer } from '../../components/immersive/AttentionDrawer';
import { ConstructionTimeline } from '../../components/immersive/ConstructionTimeline';
import { InspectorView } from '../../components/InspectorView';
import { ChangeOrderView } from '../../components/ChangeOrderView';

const world = (overrides: Partial<HermesWorldState> = {}): HermesWorldState => ({projectId:'p',projectName:'House',attemptId:'a',currentCheckpoint:2,currentStepIndex:2,currentPhase:'SURVEY',currentTask:'SITE_SURVEY_CONTROL',nextTask:'GEOTECHNICAL_INVESTIGATION',activeAgents:[],overallCompletionPct:5,status:'IN_PROGRESS',mode:'SIMULATION_GYM',projectParams:{},...overrides});
const noActions = { canFocus:false,canIsolate:false,canHide:false,focus:()=>{},isolate:()=>{},hide:()=>{},select:()=>{} };
const eventActions = { replay:()=>{}, focusEntity:()=>{}, focusPosition:()=>{}, canFocusEntity:()=>false };
describe('HX-02 inspectable records', () => {
  const state=world({buildingComponents:[{componentId:'wall',name:'Wall',positionXYZ:[1,2,3],dimensionsXYZ:[4,3,0.2],inspectionStatus:'UNINSPECTED',sourceTaskId:'build',createdByAgentId:'actor',materialSpecIds:['MAT-1'],currentRevisionId:'rev-2',connectedComponentIds:['pipe']}],materialsOnsite:[{materialBatchId:'batch',name:'Timber',quantity:3,unit:'m',worldPosition:[4,0,2]}],agentSpatialStates:[{agentId:'actor',role:'Carpenter',currentTaskId:'build',worldPosition:[2,0,1],bodyEnvelopeMeters:[1,2,1]}],equipmentEntities:[{equipmentId:'rig',name:'Rig',equipmentType:'DRILL_RIG',homeDepotId:'depot',worldPosition:[7,0,4],dimensionsXYZ:[2,4,3],operationalStatus:'STANDBY',modelName:'Rig R',clearanceRadiusMeters:2,assignedTaskId:'boring'}]});
  it.each([['wall','COMPONENT'],['batch','MATERIAL'],['AGENT-actor','ACTOR'],['rig','EQUIPMENT']])('resolves %s from its canonical record', (id,kind) => {
    const entity=resolveInspectableEntity(state,id)!; expect(entity.kind).toBe(kind); expect(entity.sourceRecord).toBeTruthy();
    const html=renderToStaticMarkup(<UniversalInspector state={state} selectedId={id} actions={noActions} onClose={()=>{}}/>);
    expect(html).toContain(`${kind.toLowerCase()} inspector`); expect(html).toContain('Current project record');
  });
  it('keeps renderer aliases out of canonical identity and avoids component/actor alias confusion', () => {
    expect(resolveInspectableEntity(state,'AGENT-actor')?.id).toBe('actor'); expect(rendererEntityId(state,'actor')).toBe('AGENT-actor');
    expect(resolveInspectableEntity(state,'AGENT-wall')?.kind).toBe('UNKNOWN');
  });
  it('preserves missing safety and invalid position values as unknown', () => {
    const actor=resolveInspectableEntity(world({agentSpatialStates:[{agentId:'x',worldPosition:[null,0,0]}]}),'x')!;
    expect(actor.spatial?.position).toBeUndefined(); expect(actor.properties.find(p=>p.label==='Blocked Unsafe')).toBeUndefined();
    for (const value of [[NaN,0,0],['1',0,0],[null,0,0],[0,0],[]]) expect(finitePosition(value)).toBe(false);
    expect(finitePosition([0,0,0])).toBe(true);
  });
  it('shows actual dimensions, materials, task, actor, revision and relationships', () => {
    const view=inspectorViewState(state,'wall');
    expect(view.fields.Properties.some(f=>f.value==='MAT-1')).toBe(true);
    expect(view.fields.Spatial.find(f=>f.label==='Recorded dimensions')?.value).toBe('4 × 3 × 0.2');
    expect(view.fields.Construction.some(f=>f.value==='build')).toBe(true);
    expect(view.fields.Provenance.some(f=>f.value==='rev-2')).toBe(true);
    expect(view.entity.relationships.some(r=>r.targetId==='pipe')).toBe(true);
  });
  it('does not grant Verified from legacy strings or unsigned claims', () => {
    const view=inspectorViewState(world({buildingComponents:[{componentId:'c',verificationStatus:'VERIFIED',claims:[{claimId:'claim',projectId:'p',subjectEntityId:'c',realityClass:'LIVE',status:'VERIFIED',evidenceIds:[],derivationMethod:'ASSUMED'}]}]}),'c');
    expect(view.fields.Provenance.find(f=>f.label==='Claim claim')?.value).toBe('Assumed');
    expect(view.fields.Quality[0].label).toContain('not evidence promotion');
  });
  it('does not attach unrelated project inspections to a component', () => {
    const view=inspectorViewState(world({...state,inspectionTickets:[{ticketId:'project-check',status:'HERMES_VALIDATED'}]}),'wall');
    expect(view.inspections).toEqual([]); expect(view.fields.Quality).toEqual([{label:'Recorded internal inspection',value:'UNINSPECTED',sourcePath:'inspectionStatus',unit:undefined}]);
  });
});
describe('HX-02 attention', () => {
  it('matches owner, blocker, constructability, clash and separate external gates exactly', () => {
    const state=world({status:'BLOCKED',pendingQuestion:{questionId:'q',prompt:'Confirm the brief',missingFields:['location']},constructabilityProof:{proofId:'cp',status:'FAILED',rationale:'Opening too narrow',materialId:'m'},clashes:[{clashId:'active',status:'ACTIVE',severity:'HIGH'},{clashId:'resolved',status:'RESOLVED_REROUTED'},{clashId:'unknown'}],inspectionTickets:[{ticketId:'i',status:'HERMES_VALIDATED',licensedProfessionalApproval:'PENDING',AHJInspection:'PENDING_CITY_INSPECTION',certificateOfOccupancyStatus:'PENDING_AHJ_FINAL_WALK'}]});
    const attention=deriveProjectAttentionState(state);
    expect(attention.activeCount).toBe(8); expect(attention.blockingCount).toBe(4); expect(attention.ownerActionCount).toBe(1);
    expect(attention.items.some(i=>i.id==='resolved')).toBe(false); expect(attention.byCategory.PROFESSIONAL_REVIEW).toBe(1); expect(attention.byCategory.AHJ).toBe(2);
    const html=renderToStaticMarkup(<AttentionDrawer state={state} attention={attention} onSelect={()=>{}} onFocus={()=>{}}/>);
    expect(html).toContain('Confirm the brief'); expect(html).toContain('HERMES_VALIDATED'); expect(html).toContain('PENDING_CITY_INSPECTION'); expect(html).not.toContain('All clear');
  });
  it('empty inspections remain unrecorded in new and legacy views', () => {
    const state=world();
    const html=renderToStaticMarkup(<AttentionDrawer state={state} attention={deriveProjectAttentionState(state)} onSelect={()=>{}} onFocus={()=>{}}/>);
    expect(html).toContain('No inspection results recorded yet');
    const legacy=renderToStaticMarkup(<InspectorView tickets={[]} onRepairTicket={()=>{}} onTriggerHeartbeat={()=>{}}/>);
    expect(legacy).toContain('No inspection results recorded yet'); expect(legacy).not.toContain('have passed'); expect(legacy).not.toContain('Run Inspection Sweep');
  });
  it('labels unresolved risk as potential exposure', () => {
    const html=renderToStaticMarkup(<ChangeOrderView risks={[]}/>); expect(html).toContain('Potential Cost Exposure'); expect(html).toContain('Not recorded'); expect(html).not.toContain('Prevented Cost');
  });
});
describe('HX-02 history and seen markers', () => {
  const state=world({eventSequence:42,events:[{eventId:'e42',projectId:'p',attemptId:'a',sequence:42,eventType:'TASK_COMPLETED_SITE_SURVEY_CONTROL',payload:{taskId:'SITE_SURVEY_CONTROL',message:'Survey record created',embodiedExecution:{assignedAgent:'surveyor',workLocationXYZ:[1,2,3]}}},{eventId:'e7',sequence:7,eventType:'WORLD_GENESIS_INITIALIZED'},{eventId:'foreign',projectId:'other',sequence:40,eventType:'INSPECTION_FAILED'},{eventId:'old',attemptId:'old',sequence:41,eventType:'TASK_COMPLETED'}]});
  it('preserves canonical event order, task evidence and excludes foreign scope', () => {
    const timeline=deriveHumanTimelineState(state); expect(timeline.events.map(e=>e.sequence)).toEqual([7,42]);
    expect(timeline.events[1].actorId).toBe('surveyor'); expect(timeline.events[1].workLocationXYZ).toEqual([1,2,3]); expect(timeline.events[1].title).toContain('Establish site survey control');
  });
  it('marks the actual latest sparse sequence, not array length', () => { expect(createLastSeenMarker({...state,eventSequence:0}).eventSequence).toBe(42); });
  it('scopes unseen events to project plus attempt and rejects future/corrupt markers', () => {
    const marker={projectId:'p',attemptId:'a',eventSequence:7,viewedAt:'2026-09-30'};
    expect(deriveHumanTimelineState(state,{lastSeen:marker}).whatChanged.unseenCount).toBe(1);
    for (const override of [{projectId:'other'},{attemptId:'old'},{eventSequence:Infinity},{eventSequence:99},{eventSequence:-1}]) {
      const changed=deriveHumanTimelineState(state,{lastSeen:{...marker,...override}}).whatChanged;
      expect(changed.markerValid).toBe(false); expect(changed.unseenCount).toBe(2);
    }
  });
  it('isolates storage keys and handles corrupt or unavailable local storage', () => {
    expect(lastSeenStorageKey('a:b','c')).not.toBe(lastSeenStorageKey('a','b:c'));
    const map=new Map(); const storage={getItem:(key:string)=>map.get(key)||null,setItem:(key:string,value:string)=>{map.set(key,value);}};
    const marker=createLastSeenMarker(state); expect(writeLastSeen(storage,marker)).toBe(true); expect(readLastSeen(storage,state)).toEqual(marker);
    expect(readLastSeen(storage,{projectId:'p',attemptId:'new'})).toBeNull(); storage.setItem(lastSeenStorageKey('p','a'),'bad json'); expect(readLastSeen(storage,state)).toBeNull();
    expect(writeLastSeen({getItem:()=>null,setItem:()=>{throw new Error('disabled');}},marker)).toBe(false);
  });
  it('normalizes CPM IDs, status, critical path and missing fields without imaginary inspections', () => {
    expect(deriveHumanTimelineState(world()).schedule).toEqual({availability:'NOT_CALCULATED',activities:[],criticalActivityIds:[]});
    const schedule=deriveHumanTimelineState(world({scheduleActivities:[{activityId:'a1',name:'Excavate',status:'IN_PROGRESS',durationDays:4,earlyStart:0,earlyFinish:4,isCriticalPath:true,predecessors:[]}]})).schedule;
    expect(schedule.activities[0]).toMatchObject({id:'a1',name:'Excavate',status:'IN_PROGRESS',equipmentIds:[]}); expect(schedule.criticalPathDurationDays).toBe(4); expect(schedule.criticalActivityIds).toEqual(['a1']);
    expect(deriveHumanTimelineState(world({scheduleActivities:[{activityId:'a',earlyFinish:4},{activityId:'b'}]})).schedule.criticalPathDurationDays).toBeUndefined();
  });
  it('renders history without live step/run/reset or invented physical inspection controls', () => {
    const html=renderToStaticMarkup(<ConstructionTimeline state={state} index={0} count={2} isPlaying={false} speed={1} expanded={true} setExpanded={()=>{}} setPlaying={()=>{}} setIndex={()=>{}} setSpeed={()=>{}} actions={eventActions} onWhatChanged={()=>{}}/>);
    expect(html).toContain('View-only history'); expect(html).toContain('Replay from here'); expect(html).toContain('not been calculated');
    for(const label of ['Run all','Reset world','Step +1','Standard Trade Rigging','PENDING_CITY_INSPECTION']) expect(html).not.toContain(label);
  });
});
