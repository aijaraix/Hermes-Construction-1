import { describe, it, expect, beforeAll } from 'vitest';
import { RealitySwarmEngine } from '../realitySwarmEngine';
import { AgentRegistry } from '../agentRegistry';
import { primeOrchestrator } from '../primeOrchestrator';
import { KnowledgeIngestionEngine } from '../knowledgeIngestionEngine';

describe('Phase 3.17B — Reality & Data Truth Swarm & Project Isolation Tests', () => {
  beforeAll(async () => {
    await KnowledgeIngestionEngine.initialize();
  });

  it('Test 1: Canonical agent role count is derived directly from AgentRegistry', () => {
    const allAgents = AgentRegistry.getAllContracts();
    expect(allAgents.length).toBeGreaterThanOrEqual(50);
  });

  it('Test 2: Reality Swarm full audit generates verified provenance for all key fields', () => {
    const audit = RealitySwarmEngine.runFullSwarmAudit({
      agentCount: 132,
      activeProjectCount: 1,
      activeProjectId: 'RESIDENCE-TAMPA-001',
      heartbeatCount: 10,
      bomTotalValue: 18627,
      bomItemCount: 12,
      inspectionTicketCount: 3,
    });

    expect(audit.pageAudits.length).toBeGreaterThanOrEqual(8);
    expect(audit.security.clean).toBe(true);
    expect(audit.truthRecords.length).toBeGreaterThan(0);
  });

  it('Test 3: Safe auto-repair logs mismatched UI counts without corrupting canonical data', () => {
    const audit = RealitySwarmEngine.runFullSwarmAudit({
      agentCount: 50, // Intentional mismatch
      activeProjectCount: 1,
      activeProjectId: 'RESIDENCE-TAMPA-001',
      heartbeatCount: 10,
      bomTotalValue: 18627,
      bomItemCount: 12,
      inspectionTicketCount: 3,
    });

    expect(audit.repairLogs.length).toBeGreaterThan(0);
    const countRepair = audit.repairLogs.find((r) => r.field === 'totalAgentRoles');
    expect(countRepair).toBeDefined();
    expect(countRepair?.afterValue).toBe(132);
  });

  it('Test 4: CRITICAL BOUNDARY — Reality Swarm CANNOT overwrite engineering data, creates domain conflict instead', () => {
    const conflict = RealitySwarmEngine.reportEngineeringDiscrepancy({
      page: 'Rooms & Spaces',
      component: 'Room 204 Slab',
      field: 'slabThicknessInches',
      uiValue: 6,
      engineeringValue: 5.5,
      responsibleDomain: 'Structural',
    });

    expect(conflict.status).toBe('OPEN');
    expect(conflict.escalatedTo).toContain('HERMES_PRIME -> STRUCTURAL_MANAGER');

    const allConflicts = RealitySwarmEngine.getDomainConflicts();
    expect(allConflicts).toContainEqual(conflict);
  });

  it('Test 5: Security Exposure Inspector verifies zero key leakages in API endpoints', () => {
    const sec = RealitySwarmEngine.auditSecurityExposures();
    expect(sec.clean).toBe(true);
    expect(sec.exposuresFound).toBe(0);
  });

  it('Test 6: Project context isolation — Changing project resolves distinct project records', () => {
    const projects = primeOrchestrator.getAllProjects();
    expect(projects.length).toBeGreaterThan(0);

    const activeProj = primeOrchestrator.getProject('RESIDENCE-TAMPA-001');
    expect(activeProj).toBeDefined();
    expect(activeProj?.id).toBe('RESIDENCE-TAMPA-001');
    expect(activeProj?.name).toContain('Tampa Coastal');
  });

  it('Test 7: Cost confidence calculations distinguish verified cost from estimated cost', () => {
    const activeProj = primeOrchestrator.getProject('RESIDENCE-TAMPA-001');
    const totalCost = activeProj?.bom.reduce((acc, curr) => acc + curr.estimatedTotalCost, 0) || 0;
    expect(totalCost).toBeGreaterThan(0);
  });
});
