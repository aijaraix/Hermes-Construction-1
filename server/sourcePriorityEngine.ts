import { AuthoritativeSourceDefinition } from '../src/types/hermes';
import { SourceRegistry } from './sourceRegistry';

export class SourcePriorityEngine {
  public static getRankedSourcesForRole(agentRoleId: string, topic?: string): AuthoritativeSourceDefinition[] {
    const allSources = SourceRegistry.getAllSources();

    const roleFiltered = allSources.filter((src) => {
      if (src.applicableAgentRoles && src.applicableAgentRoles.includes(agentRoleId)) {
        return true;
      }
      // Discipline fallback matching
      if (agentRoleId.includes('FOOTING') || agentRoleId.includes('CONCRETE') || agentRoleId.includes('SOILS')) {
        return src.sourceId === 'ACI-318-19-CONCRETE' || src.sourceId === 'FBC-2023-BUILDING' || src.sourceId === 'FEMA-P55';
      }
      if (agentRoleId.includes('HVAC') || agentRoleId.includes('DUCT') || agentRoleId.includes('DIFFUSER')) {
        return src.sourceId === 'DOE-PNNL-BASC' || src.sourceId === 'FBC-2023-BUILDING';
      }
      if (agentRoleId.includes('RECEPTACLE') || agentRoleId.includes('BRANCH') || agentRoleId.includes('ELECTRICAL')) {
        return src.sourceId === 'NEC-2023-ELECTRICAL';
      }
      if (agentRoleId.includes('PLUMBING') || agentRoleId.includes('DRAIN')) {
        return src.sourceId === 'EPA-WATERSENSE-PLUMBING';
      }
      return false;
    });

    // Rank by authority and priority
    return roleFiltered.sort((a, b) => {
      const authRank = (src: AuthoritativeSourceDefinition) => {
        if (src.authorityLevel === 'PRIMARY_GOVERNMENT') return 1;
        if (src.authorityLevel === 'PRIMARY_TECHNICAL') return 2;
        if (src.authorityLevel === 'CONSENSUS_STANDARD') return 3;
        return 4;
      };
      const rankA = authRank(a);
      const rankB = authRank(b);
      if (rankA !== rankB) return rankA - rankB;
      return (a.priority || 9) - (b.priority || 9);
    });
  }
}
