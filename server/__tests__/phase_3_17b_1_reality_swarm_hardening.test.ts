import { describe, it, expect, beforeEach } from 'vitest';
import { AgentRegistry } from '../agentRegistry';
import { RealitySwarmEngine } from '../realitySwarmEngine';
import { ProcurementStore } from '../procurementStore';
import { StaticAnalysisScanner } from '../staticAnalysisScanner';
import { SecurityScanner } from '../securityScanner';
import { BuildMetadata } from '../buildMetadata';
import { RealityStore } from '../realityStore';

describe('Phase 3.17B.1 — Reality Swarm Hardening & Live Data Audit Test Suite', () => {
  beforeEach(() => {
    AgentRegistry.initialize();
    ProcurementStore.initialize();
  });

  it('Test 1: Canonical agent role count is derived directly from AgentRegistry without 132 fallback', () => {
    const contracts = AgentRegistry.getAllContracts();
    const actualCount = contracts.length;
    expect(actualCount).toBeGreaterThanOrEqual(20);

    const audit = RealitySwarmEngine.runFullSwarmAudit({
      agentCount: actualCount,
    });

    const agentRecord = audit.truthRecords.find((r) => r.field === 'totalAgentRoles');
    expect(agentRecord).toBeDefined();
    expect(agentRecord?.canonicalValue).toBe(actualCount);
    expect(agentRecord?.displayedValue).toBe(actualCount);
    expect(agentRecord?.validationStatus).toBe('VERIFIED');
  });

  it('Test 2: Controlled Agent Count Mismatch triggers safe auto-repair to match registry', () => {
    const actualCount = AgentRegistry.getAllContracts().length;
    const wrongDisplayedCount = actualCount - 1;

    const audit = RealitySwarmEngine.runFullSwarmAudit({
      agentCount: wrongDisplayedCount,
    });

    const repair = audit.repairLogs.find((r) => r.field === 'totalAgentRoles');
    expect(repair).toBeDefined();
    expect(repair?.beforeValue).toBe(wrongDisplayedCount);
    expect(repair?.afterValue).toBe(actualCount);
    expect(repair?.repairAgent).toBe('COUNT-CONSISTENCY-INSPECTOR');
  });

  it('Test 3: Price Status Derivation and Missing Evidence Downgrade', () => {
    const priceStatus = ProcurementStore.derivePriceStatus('PRICE-CONCRETE-001');
    expect(priceStatus.hasEvidence).toBe(true);
    expect(priceStatus.classification).toBe('VERIFIED_CURRENT_QUOTE');

    const missingStatus = ProcurementStore.derivePriceStatus('PRICE-MISSING-999');
    expect(missingStatus.hasEvidence).toBe(false);
    expect(missingStatus.classification).toBe('UNKNOWN');
  });

  it('Test 4: Real Security Exposure Scanner detects synthetic secret marker', () => {
    // 1. Inject test secret
    SecurityScanner.setTestFixtureSecret('HERMES_TEST_SECRET_DO_NOT_EXPOSE_123');
    const dirtyScan = SecurityScanner.runExposureScan([]);
    expect(dirtyScan.clean).toBe(false);
    expect(dirtyScan.exposuresFound).toBe(1);
    expect(dirtyScan.items[0].type).toBe('TEST_SYNTHETIC_MARKER_EXPOSURE');

    // 2. Remove test secret
    SecurityScanner.setTestFixtureSecret(null);
    const cleanScan = SecurityScanner.runExposureScan([
      { endpointOrPath: '/api/heartbeat', payload: { status: 'ok', key: '[PROTECTED]' } },
    ]);
    expect(cleanScan.clean).toBe(true);
    expect(cleanScan.exposuresFound).toBe(0);
  });

  it('Test 5: Engineering Data Protection Invariant - Discrepancy generates Conflict without overwriting value', () => {
    const discrepancy = {
      page: '3D Digital Twin',
      component: 'Footing-F01',
      field: 'concreteCompressivePsi',
      uiValue: 3000,
      engineeringValue: 4000,
      responsibleDomain: 'Structural Engineering',
    };

    const conflict = RealitySwarmEngine.reportEngineeringDiscrepancy(discrepancy);
    expect(conflict).toBeDefined();
    expect(conflict.status).toBe('OPEN');
    expect(conflict.escalatedTo).toContain('STRUCTURAL ENGINEERING_MANAGER');

    const truthRecords = RealitySwarmEngine.getTruthRecords();
    const conflictRecord = truthRecords.find((r) => r.truthRecordId === `REC-CONFLICT-${conflict.conflictId}`);
    expect(conflictRecord).toBeDefined();
    expect(conflictRecord?.validationStatus).toBe('CONFLICT');
    expect(conflictRecord?.displayedValue).toBe(3000); // Engineering value NOT overwritten
  });

  it('Test 6: Self-Auditing Meta-Auditor validates Reality Swarm self-consistency', () => {
    const audit = RealitySwarmEngine.runFullSwarmAudit({});
    expect(audit.metaAudit).toBeDefined();
    expect(audit.metaAudit.metaAuditPassed).toBe(true);
    expect(audit.metaAudit.discrepancyFound).toBe(false);
  });

  it('Test 7: Reality Store persistence saves state and restores on load', () => {
    const audit = RealitySwarmEngine.runFullSwarmAudit({});
    const loaded = RealityStore.load();
    expect(loaded).not.toBeNull();
    expect(loaded?.truthRecords.length).toBeGreaterThan(0);
    expect(loaded?.lastSavedAt).toBeDefined();
  });
});
