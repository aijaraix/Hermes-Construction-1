import { AgentRegistry } from './agentRegistry';
import {
  DynamicAgentStatus,
  AgentActivationRecord,
  AgentStandbyRecord,
  AgentLearningAssignmentRecord,
  AgentEscalationRecord
} from '../src/types/hermes';

export interface AgentWorkforceState {
  roleId: string;
  roleName: string;
  discipline: string;
  managerRoleId: string;
  status: DynamicAgentStatus;
  currentProjectId?: string;
  currentTaskId?: string;
  assignedQueue: 'PROJECT_EXECUTION_QUEUE' | 'KNOWLEDGE_LEARNING_QUEUE';
  lastStatusChange: string;
  learningTopic?: string;
}

export class WorkforceSchedulerEngine {
  private static workforceState: Map<string, AgentWorkforceState> = new Map();
  private static activationRecords: AgentActivationRecord[] = [];
  private static standbyRecords: AgentStandbyRecord[] = [];
  private static learningAssignments: AgentLearningAssignmentRecord[] = [];
  private static escalationRecords: AgentEscalationRecord[] = [];
  private static initialized = false;

  public static initialize(): void {
    if (this.initialized) return;

    AgentRegistry.initialize();
    const allContracts = AgentRegistry.getAllContracts();

    allContracts.forEach(contract => {
      this.workforceState.set(contract.roleId, {
        roleId: contract.roleId,
        roleName: contract.roleName,
        discipline: contract.discipline,
        managerRoleId: contract.managerRoleId,
        status: contract.isCoreHouse1Role ? 'STANDBY' : 'ACTIVE_KNOWLEDGE_LEARNING',
        assignedQueue: contract.isCoreHouse1Role ? 'PROJECT_EXECUTION_QUEUE' : 'KNOWLEDGE_LEARNING_QUEUE',
        lastStatusChange: new Date().toISOString(),
        learningTopic: contract.isCoreHouse1Role ? undefined : `Curriculum: ${contract.knowledgeDomains[0] || 'General Engineering'}`
      });
    });

    this.initialized = true;
  }

  public static scheduleWorkforceForStage(projectId: string, stage: string): {
    activeProject: number;
    activeLearning: number;
    standby: number;
  } {
    this.initialize();

    const now = new Date().toISOString();
    let neededDisciplines: string[] = [];

    // Map stage to required discipline focus
    if (stage.includes('SITE') || stage.includes('SURVEY') || stage.includes('EXCAVATION')) {
      neededDisciplines = ['Management', 'Site & Civil', 'Geotechnical', 'Safety'];
    } else if (stage.includes('SLAB') || stage.includes('FOOTING') || stage.includes('FOUNDATION') || stage.includes('FRAMING') || stage.includes('STRUCTURE')) {
      neededDisciplines = ['Management', 'Structural', 'Materials', 'Safety', 'Quality'];
    } else if (stage.includes('PLUMBING') || stage.includes('HVAC') || stage.includes('ELECTRICAL') || stage.includes('MEP')) {
      neededDisciplines = ['Management', 'MEP', 'Plumbing', 'Electrical', 'HVAC', 'Quality'];
    } else {
      neededDisciplines = ['Management', 'Structural', 'MEP', 'Site & Civil', 'Quality', 'Safety'];
    }

    this.workforceState.forEach((state, roleId) => {
      const isNeeded = neededDisciplines.includes(state.discipline);
      const contract = AgentRegistry.getContract(roleId);

      if (isNeeded && state.status !== 'ACTIVE_PROJECT_TASK') {
        const oldStatus = state.status;
        state.status = 'ACTIVE_PROJECT_TASK';
        state.assignedQueue = 'PROJECT_EXECUTION_QUEUE';
        state.currentProjectId = projectId;
        state.currentTaskId = `TASK-${stage}-${roleId.slice(0, 8)}`;
        state.lastStatusChange = now;

        this.activationRecords.push({
          id: `ACT-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          roleId,
          projectId,
          timestamp: now,
          previousStatus: oldStatus,
          newStatus: 'ACTIVE_PROJECT_TASK',
          reason: `Activated for stage ${stage} based on discipline ${state.discipline}`,
          queueLane: 'PROJECT_EXECUTION_QUEUE'
        });
      } else if (!isNeeded && state.status === 'ACTIVE_PROJECT_TASK') {
        // Transition back to learning queue to avoid starving capacity
        const oldStatus = state.status;
        state.status = 'ACTIVE_KNOWLEDGE_LEARNING';
        state.assignedQueue = 'KNOWLEDGE_LEARNING_QUEUE';
        state.currentProjectId = undefined;
        state.currentTaskId = undefined;
        state.learningTopic = contract ? `Specialist Mastery: ${contract.knowledgeDomains[0] || 'Codes & Specs'}` : 'General Domain Training';
        state.lastStatusChange = now;

        this.standbyRecords.push({
          id: `STB-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          roleId,
          timestamp: now,
          standbyReason: `Stage ${stage} complete for discipline ${state.discipline}`,
          eligibleForLearning: true
        });

        this.learningAssignments.push({
          id: `LRN-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          roleId,
          timestamp: now,
          curriculumTopic: state.learningTopic
        });
      }
    });

    return this.getWorkforceMetrics();
  }

  public static wakeAgentFromStandby(roleId: string, projectId: string, reason: string): AgentWorkforceState | null {
    this.initialize();
    const state = this.workforceState.get(roleId);
    if (!state) return null;

    const oldStatus = state.status;
    state.status = 'ACTIVE_PROJECT_TASK';
    state.assignedQueue = 'PROJECT_EXECUTION_QUEUE';
    state.currentProjectId = projectId;
    state.lastStatusChange = new Date().toISOString();

    this.activationRecords.push({
      id: `ACT-WAKE-${Date.now()}`,
      roleId,
      projectId,
      timestamp: new Date().toISOString(),
      previousStatus: oldStatus,
      newStatus: 'ACTIVE_PROJECT_TASK',
      reason: `Woken by Prime: ${reason}`,
      queueLane: 'PROJECT_EXECUTION_QUEUE'
    });

    return state;
  }

  public static escalateIssue(projectId: string, escalatingRoleId: string, receivingRoleId: string, issueId: string, reason: string): AgentEscalationRecord {
    const esc: AgentEscalationRecord = {
      id: `ESC-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      projectId,
      escalatingRoleId,
      receivingRoleId,
      issueId,
      reason,
      timestamp: new Date().toISOString()
    };
    this.escalationRecords.push(esc);
    return esc;
  }

  public static getWorkforceMetrics(): {
    totalRegistered: number;
    activeProject: number;
    activeLearning: number;
    standby: number;
    blocked: number;
    inspection: number;
  } {
    this.initialize();

    let activeProject = 0;
    let activeLearning = 0;
    let standby = 0;
    let blocked = 0;
    let inspection = 0;

    this.workforceState.forEach(s => {
      if (s.status === 'ACTIVE_PROJECT_TASK') activeProject++;
      else if (s.status === 'ACTIVE_KNOWLEDGE_LEARNING') activeLearning++;
      else if (s.status === 'STANDBY') standby++;
      else if (s.status === 'BLOCKED') blocked++;
      else if (s.status === 'INSPECTION') inspection++;
    });

    return {
      totalRegistered: this.workforceState.size,
      activeProject,
      activeLearning,
      standby,
      blocked,
      inspection
    };
  }

  public static getAllWorkforceStates(): AgentWorkforceState[] {
    this.initialize();
    return Array.from(this.workforceState.values());
  }

  public static getActivationRecords(): AgentActivationRecord[] {
    return [...this.activationRecords];
  }

  public static getEscalationRecords(): AgentEscalationRecord[] {
    return [...this.escalationRecords];
  }
}
