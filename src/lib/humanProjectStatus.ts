import { HermesWorldState } from '../types/hermes';

export type HumanAttentionSeverity = 'INFO' | 'WARNING' | 'BLOCKED' | 'FAILED';

export interface HumanAttentionItem {
  id: string;
  severity: HumanAttentionSeverity;
  title: string;
  detail?: string;
  relatedEntityIds?: string[];
  source: 'PROJECT_STATUS' | 'PENDING_QUESTION' | 'CONSTRUCTABILITY' | 'INSPECTION' | 'CLASH';
}

export interface HumanPhaseProgress {
  phase: string;
  label: string;
  state: 'COMPLETE' | 'CURRENT' | 'UPCOMING';
  completedTaskCount: number;
  totalKnownTaskCount: number;
}

export interface HumanProjectStatus {
  projectId: string;
  projectName: string;
  statusLabel: string;
  phaseLabel: string;
  completionPct: number;
  done: {
    latestCompletedTaskId?: string;
    latestCompletedLabel?: string;
    completedTaskCount: number;
  };
  doing: {
    taskId?: string;
    label: string;
    phaseLabel: string;
    activeAgentIds: string[];
    workLocationXYZ?: [number, number, number];
    requiredEquipment: string[];
    requiredMaterials: string[];
  };
  next: {
    taskId?: string;
    label: string;
  };
  attention: HumanAttentionItem[];
  evidence: {
    checkpoint: number;
    eventCount: number;
    componentCount: number;
    materialBatchCount: number;
    inspectionCount: number;
    worldStateHash?: string;
  };
  phaseProgress: HumanPhaseProgress[];
}

const PHASES = [
  ['INTAKE', 'Project Brief'],
  ['FEASIBILITY', 'Site & Code Feasibility'],
  ['SURVEY', 'Site Survey'],
  ['GEOTECH', 'Geotechnical'],
  ['FOUNDATION_DESIGN', 'Foundation Design'],
  ['ARCHITECTURAL_DESIGN', 'Architectural Design'],
  ['STRUCTURAL_ENGINEERING', 'Structural Engineering'],
  ['MOBILIZATION', 'Site Mobilization'],
  ['CONSTRUCTION_SUBSTRUCTURE', 'Foundation & Substructure'],
  ['CONSTRUCTION_SUPERSTRUCTURE', 'Framing & Structure'],
  ['ENCLOSURE', 'Building Enclosure'],
  ['MEP_COORDINATION', 'MEP Rough-In & Coordination'],
  ['CLOSE_IN', 'Insulation & Close-In'],
  ['FINISHES', 'Finishes & Fixtures'],
  ['ESTIMATING', 'Quantity & Cost Finalization'],
  ['SCHEDULING', 'Schedule & Logistics'],
  ['INSPECTION', 'Final Inspections'],
  ['CLOSEOUT', 'Project Closeout'],
] as const;

const PHASE_LABELS = Object.fromEntries(PHASES) as Record<string, string>;

const TASKS_BY_PHASE: Record<string, string[]> = {
  INTAKE: ['INTAKE_COMPLETE'],
  FEASIBILITY: ['RESOLVE_JURISDICTION'],
  SURVEY: ['SITE_SURVEY_CONTROL'],
  GEOTECH: ['GEOTECHNICAL_INVESTIGATION'],
  FOUNDATION_DESIGN: ['FOUNDATION_SELECTION_ENGINE'],
  ARCHITECTURAL_DESIGN: ['SPACE_PLANNING_SOLVER'],
  STRUCTURAL_ENGINEERING: ['STRUCTURAL_ANALYSIS_LAYER'],
  MOBILIZATION: ['MOBILIZE_SITE_OPERATIONS'],
  CONSTRUCTION_SUBSTRUCTURE: [
    'EXCAVATE_PAD_AND_TRENCHES',
    'ASSEMBLE_SLAB_FORMWORK',
    'INSTALL_REBAR_AND_PT_TENDONS',
    'POUR_FOUNDATION_CONCRETE',
    'CONSTRUCT_FOUNDATION_MESH',
    'EVALUATE_ENVIRONMENTAL_CURING',
  ],
  CONSTRUCTION_SUPERSTRUCTURE: [
    'STAGE_LONG_MATERIAL_BEFORE_CLOSURE',
    'SUPERSTRUCTURE_FRAMING',
  ],
  ENCLOSURE: ['ENCLOSE_BUILDING_AND_INSTALL_OPENINGS'],
  MEP_COORDINATION: ['MEP_ROUTING_AND_CLASH_DETECTION', 'REPAIR-CLASH-001'],
  CLOSE_IN: ['INSULATE_AND_CLOSE_IN'],
  FINISHES: ['INSTALL_FINISHES_AND_FIXTURES'],
  ESTIMATING: ['CALCULATED_BOM_AND_TAKEOFF'],
  SCHEDULING: ['CPM_SCHEDULE_GENERATION', 'LOGISTICS_RESILIENCE_GATE'],
  INSPECTION: ['MULTI_TRADE_INSPECTION_GATE'],
  CLOSEOUT: ['CLOSEOUT_DIGITAL_TWIN'],
};

const TASK_LABELS: Record<string, string> = {
  INTAKE_COMPLETE: 'Validate project brief',
  RESOLVE_JURISDICTION: 'Resolve jurisdiction and code requirements',
  SITE_SURVEY_CONTROL: 'Establish site survey control',
  GEOTECHNICAL_INVESTIGATION: 'Complete geotechnical investigation',
  FOUNDATION_SELECTION_ENGINE: 'Select foundation system',
  SPACE_PLANNING_SOLVER: 'Develop architectural layout',
  STRUCTURAL_ANALYSIS_LAYER: 'Complete structural analysis',
  MOBILIZE_SITE_OPERATIONS: 'Mobilize construction site',
  EXCAVATE_PAD_AND_TRENCHES: 'Excavate building pad and footings',
  ASSEMBLE_SLAB_FORMWORK: 'Assemble slab formwork',
  INSTALL_REBAR_AND_PT_TENDONS: 'Install reinforcing and post-tensioning',
  POUR_FOUNDATION_CONCRETE: 'Place foundation concrete',
  CONSTRUCT_FOUNDATION_MESH: 'Complete foundation assembly',
  EVALUATE_ENVIRONMENTAL_CURING: 'Verify concrete curing readiness',
  STAGE_LONG_MATERIAL_BEFORE_CLOSURE: 'Stage long material before access closes',
  SUPERSTRUCTURE_FRAMING: 'Frame walls and roof structure',
  ENCLOSE_BUILDING_AND_INSTALL_OPENINGS: 'Install enclosure, windows and doors',
  MEP_ROUTING_AND_CLASH_DETECTION: 'Install and coordinate MEP rough-in',
  'REPAIR-CLASH-001': 'Resolve MEP coordination conflict',
  INSULATE_AND_CLOSE_IN: 'Inspect rough-in, insulate and close walls',
  INSTALL_FINISHES_AND_FIXTURES: 'Install finishes and fixtures',
  CALCULATED_BOM_AND_TAKEOFF: 'Finalize quantities and cost',
  CPM_SCHEDULE_GENERATION: 'Generate construction schedule',
  LOGISTICS_RESILIENCE_GATE: 'Validate logistics and supply-chain resilience',
  MULTI_TRADE_INSPECTION_GATE: 'Complete multi-trade inspection',
  CLOSEOUT_DIGITAL_TWIN: 'Complete project closeout',
};

const STATUS_LABELS: Record<string, string> = {
  PENDING_INTAKE: 'Waiting for project information',
  CUSTOMER_DECISION_REQUIRED: 'Owner decision required',
  IN_PROGRESS: 'In progress',
  COMPLETED: 'Complete',
  BLOCKED: 'Blocked',
};

function formatCanonicalLabel(value?: string): string {
  if (!value) return 'Not available';
  return value
    .replace(/^PROJECT_/, '')
    .replace(/^CONSTRUCTION_/, '')
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

export function humanPhaseLabel(phase?: string): string {
  return phase ? PHASE_LABELS[phase] || formatCanonicalLabel(phase) : 'Not available';
}

export function humanTaskLabel(task?: string): string {
  if (!task) return 'Not available';
  return TASK_LABELS[task] || formatCanonicalLabel(task);
}

function clampPercent(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, value));
}

function deriveAttention(state: HermesWorldState): HumanAttentionItem[] {
  const attention: HumanAttentionItem[] = [];

  if (state.status === 'BLOCKED') {
    attention.push({
      id: 'project-blocked',
      severity: 'BLOCKED',
      title: 'Project work is blocked',
      source: 'PROJECT_STATUS',
    });
  }

  if (state.pendingQuestion?.prompt) {
    attention.push({
      id: state.pendingQuestion.questionId || 'pending-question',
      severity: 'WARNING',
      title: 'Decision required',
      detail: state.pendingQuestion.prompt,
      source: 'PENDING_QUESTION',
    });
  }

  if (state.constructabilityProof && ['BLOCKED', 'FAILED'].includes(state.constructabilityProof.status)) {
    attention.push({
      id: state.constructabilityProof.proofId,
      severity: state.constructabilityProof.status === 'FAILED' ? 'FAILED' : 'BLOCKED',
      title: 'Future access / constructability issue',
      detail: state.constructabilityProof.rationale,
      relatedEntityIds: [
        state.constructabilityProof.materialId,
        state.constructabilityProof.closureComponentId,
      ].filter(Boolean),
      source: 'CONSTRUCTABILITY',
    });
  }

  for (const ticket of state.inspectionTickets || []) {
    if (ticket?.status === 'FAIL' || ticket?.status === 'INSUFFICIENT_INFORMATION') {
      attention.push({
        id: ticket.ticketId || 'inspection-' + String(attention.length + 1),
        severity: ticket.status === 'FAIL' ? 'FAILED' : 'WARNING',
        title: ticket.status === 'FAIL' ? 'Inspection failed' : 'Inspection needs more information',
        detail: ticket.notes,
        source: 'INSPECTION',
      });
    }
  }

  if ((state.clashes || []).length > 0) {
    attention.push({
      id: 'coordination-records',
      severity: 'WARNING',
      title: 'Coordination records require review',
      detail: String(state.clashes?.length || 0) + ' clash / coordination record(s) are present in the current world state.',
      source: 'CLASH',
    });
  }

  return attention;
}

function derivePhaseProgress(state: HermesWorldState): HumanPhaseProgress[] {
  const completed = new Set(state.completedTasks || []);
  const currentIndex = PHASES.findIndex(([phase]) => phase === state.currentPhase);

  return PHASES.map(([phase, label], index) => {
    const knownTasks = TASKS_BY_PHASE[phase] || [];
    const completedTaskCount = knownTasks.filter((taskId) => completed.has(taskId)).length;
    const allKnownComplete = knownTasks.length > 0 && completedTaskCount === knownTasks.length;

    let phaseState: HumanPhaseProgress['state'] = 'UPCOMING';
    if (allKnownComplete || (currentIndex >= 0 && index < currentIndex)) phaseState = 'COMPLETE';
    if (phase === state.currentPhase) phaseState = 'CURRENT';

    return {
      phase,
      label,
      state: phaseState,
      completedTaskCount,
      totalKnownTaskCount: knownTasks.length,
    };
  });
}

export function deriveHumanProjectStatus(state: HermesWorldState): HumanProjectStatus {
  const completedTasks = state.completedTasks || [];
  const latestCompletedTaskId = completedTasks.length > 0 ? completedTasks[completedTasks.length - 1] : undefined;

  const currentTaskId = state.activeTaskDetails?.taskId;
  const currentLabel = state.activeTaskDetails?.title
    ? state.activeTaskDetails.title
    : humanTaskLabel(state.currentTask);

  return {
    projectId: state.projectId,
    projectName: state.projectName,
    statusLabel: STATUS_LABELS[state.status] || formatCanonicalLabel(state.status),
    phaseLabel: humanPhaseLabel(state.currentPhase),
    completionPct: clampPercent(state.overallCompletionPct),
    done: {
      latestCompletedTaskId,
      latestCompletedLabel: latestCompletedTaskId ? humanTaskLabel(latestCompletedTaskId) : undefined,
      completedTaskCount: completedTasks.length,
    },
    doing: {
      taskId: currentTaskId,
      label: currentLabel,
      phaseLabel: humanPhaseLabel(state.activeTaskDetails?.phase || state.currentPhase),
      activeAgentIds: state.activeAgents || [],
      workLocationXYZ: state.activeTaskDetails?.workLocationXYZ,
      requiredEquipment: state.activeTaskDetails?.requiredEquipment || [],
      requiredMaterials: state.activeTaskDetails?.requiredMaterials || [],
    },
    next: {
      taskId: TASK_LABELS[state.nextTask] ? state.nextTask : undefined,
      label: humanTaskLabel(state.nextTask),
    },
    attention: deriveAttention(state),
    evidence: {
      checkpoint: state.currentCheckpoint,
      eventCount: state.events?.length ?? state.eventSequence ?? 0,
      componentCount: state.buildingComponents?.length || 0,
      materialBatchCount: state.materialsOnsite?.length || 0,
      inspectionCount: state.inspectionTickets?.length || 0,
      worldStateHash: state.diagnostics?.worldStateHash,
    },
    phaseProgress: derivePhaseProgress(state),
  };
}
