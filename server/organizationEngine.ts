import { AgentContract, AgentMessage, CoreReadinessGate, MessageType } from '../src/types/hermes';
import { AgentRegistry } from './agentRegistry';

export class OrganizationEngine {
  private static messages: AgentMessage[] = [];

  public static getCoreReadinessGate(): CoreReadinessGate {
    const contracts = AgentRegistry.getAllContracts();
    const totalDefined = contracts.length;
    const coreHouse1Contracts = contracts.filter(c => c.isCoreHouse1Role);
    const totalCoreHouse1 = coreHouse1Contracts.length;

    const curriculumAssigned = contracts.filter(c => c.readinessStatus !== 'DEFINED').length;
    const initialIngestionComplete = contracts.filter(c => 
      ['INGESTING', 'EXTRACTING_KNOWLEDGE', 'VALIDATING_SOURCES', 'MANAGER_REVIEW', 'COMPETENCY_TESTING', 'READY_FOR_SHADOW_WORK', 'READY_FOR_CONSTRUCTION_WORK'].includes(c.readinessStatus)
    ).length;
    const managerReviewed = contracts.filter(c => 
      ['MANAGER_REVIEW', 'COMPETENCY_TESTING', 'READY_FOR_SHADOW_WORK', 'READY_FOR_CONSTRUCTION_WORK'].includes(c.readinessStatus)
    ).length;
    const shadowTested = contracts.filter(c => 
      ['READY_FOR_SHADOW_WORK', 'READY_FOR_CONSTRUCTION_WORK'].includes(c.readinessStatus)
    ).length;

    const certifiedCoreHouse1 = coreHouse1Contracts.filter(c => c.readinessStatus === 'READY_FOR_CONSTRUCTION_WORK').length;
    const readinessPct = totalCoreHouse1 > 0 ? (certifiedCoreHouse1 / totalCoreHouse1) * 100 : 0;

    const isBlocked = readinessPct < 85.0;
    const reason = isBlocked 
      ? `Core Construction Readiness is ${readinessPct.toFixed(1)}% (Threshold: >= 85.0%). Gym Curriculum remains BLOCKED at Level 3.`
      : 'Core Construction Readiness satisfied. System ready for autonomous Gym execution.';

    return {
      totalDefinedRoles: totalDefined,
      totalCoreHouse1Roles: totalCoreHouse1,
      curriculumAssignedCount: curriculumAssigned,
      initialIngestionCompleteCount: initialIngestionComplete,
      managerReviewedCount: managerReviewed,
      shadowTestedCount: shadowTested,
      certifiedCount: certifiedCoreHouse1,
      requiredCertificationThreshold: Math.ceil(totalCoreHouse1 * 0.85),
      coreConstructionReadinessPct: Math.round(readinessPct * 10) / 10,
      isGymBlocked: isBlocked,
      gymBlockReason: reason
    };
  }

  public static postMessage(message: Omit<AgentMessage, 'messageId' | 'timestamp' | 'status'>): AgentMessage {
    const fullMessage: AgentMessage = {
      ...message,
      messageId: `MSG-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      status: 'OPEN'
    };
    this.messages.push(fullMessage);
    return fullMessage;
  }

  public static getMessagesForRole(roleId: string): AgentMessage[] {
    return this.messages.filter(m => m.senderRoleId === roleId || m.receiverRoleId === roleId);
  }

  public static getAllMessages(): AgentMessage[] {
    return [...this.messages];
  }

  public static resolveMessage(messageId: string, payloadUpdates: Record<string, any>): AgentMessage | undefined {
    const msg = this.messages.find(m => m.messageId === messageId);
    if (!msg) return undefined;
    msg.status = 'RESOLVED';
    msg.payload = { ...msg.payload, ...payloadUpdates };
    return msg;
  }
}
