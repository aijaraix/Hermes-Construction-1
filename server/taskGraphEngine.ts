import { TaskGraphNode, TaskStage, TaskStatus, DigitalTwinProject, ProjectSnapshot } from '../src/types/hermes';

export const STAGE_SEQUENCE: TaskStage[] = [
  'SITE_ANALYSIS',
  'PROGRAMMING_SITE_PAD',
  'EXCAVATION_FOOTINGS',
  'UNDERGROUND_UTILITIES',
  'FOUNDATION_SLAB',
  'STRUCTURE_FRAMING',
  'EXTERIOR_ENVELOPE',
  'ROOF_ASSEMBLY',
  'PLUMBING_ROUGH_IN',
  'HVAC_ROUGH_IN',
  'ELECTRICAL_ROUGH_IN',
  'FIRE_PROTECTION',
  'INSPECTOR_SWEEP',
  'AUTO_REPAIR_LOOP',
  'BOM_QUANTITY_RECALC',
  'LOCAL_PROCUREMENT_COSTING',
  'JOB_SCHEDULE_4D',
  'CHANGE_ORDER_PREVENTION',
  'FINAL_SCORE_POSTMORTEM',
  'EXTRACT_LEARNED_LESSONS',
];

export function createDefaultTaskGraphForProject(projectId: string): TaskGraphNode[] {
  const now = new Date().toISOString();
  const tasks: TaskGraphNode[] = [];

  STAGE_SEQUENCE.forEach((stage, idx) => {
    const taskId = `TASK-${projectId}-${idx + 1}`;
    const dependsOn = idx > 0 ? [`TASK-${projectId}-${idx}`] : [];
    const unlocks = idx < STAGE_SEQUENCE.length - 1 ? [`TASK-${projectId}-${idx + 2}`] : [];

    let agentId = 'PRIME-ORCHESTRATOR-01';
    if (stage.includes('SITE')) agentId = 'SITE-AGENT-03';
    else if (stage.includes('FOOTING') || stage.includes('SLAB') || stage.includes('STRUCTURE') || stage.includes('ROOF')) agentId = 'STRUCTURAL-AGENT-01';
    else if (stage.includes('PLUMBING')) agentId = 'PLUMBING-AGENT-07';
    else if (stage.includes('HVAC')) agentId = 'HVAC-AGENT-04';
    else if (stage.includes('ELECTRICAL')) agentId = 'ELECTRICAL-AGENT-05';
    else if (stage.includes('INSPECTOR')) agentId = 'INSPECTOR-STRUCTURAL-01';
    else if (stage.includes('REPAIR')) agentId = 'REPAIR-AGENT-03';
    else if (stage.includes('BOM')) agentId = 'QUANTITY-AGENT-01';
    else if (stage.includes('PROCUREMENT')) agentId = 'PROCUREMENT-AGENT-04';
    else if (stage.includes('RISK') || stage.includes('SCHEDULE')) agentId = 'RISK-AGENT-02';
    else if (stage.includes('POSTMORTEM') || stage.includes('LESSONS')) agentId = 'KNOWLEDGE-AGENT-01';

    tasks.push({
      id: taskId,
      projectId,
      stage,
      title: stage.replace(/_/g, ' '),
      status: idx === 0 ? 'RUNNING' : 'QUEUED',
      assignedAgentId: agentId,
      dependsOnTaskIds: dependsOn,
      unlocksTaskIds: unlocks,
      created_at: now,
    });
  });

  return tasks;
}

export function createProjectSnapshotFromTask(
  project: DigitalTwinProject,
  stage: TaskStage,
  snapshotIndex: number
): ProjectSnapshot {
  const versionTag = `V${String(snapshotIndex).padStart(3, '0')}`;
  return {
    id: `SNAP-${project.id}-${versionTag}`,
    projectId: project.id,
    versionTag,
    description: `Digital Twin Model State after completing task stage: ${stage}`,
    taskStage: stage,
    components: JSON.parse(JSON.stringify(project.components)),
    componentCount: project.components.length,
    completionPct: project.overallCompletionPct,
    timestamp: new Date().toISOString(),
  };
}
