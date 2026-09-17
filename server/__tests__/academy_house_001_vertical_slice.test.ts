import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import fs from 'fs';
import path from 'path';
import { HermesLiveHouseEngine } from '../hermesLiveHouseEngine';

const statePath = path.join(process.cwd(), 'data', 'hermesLiveHouseState.json');
let originalState = '';

describe('Academy House 001 visual/runtime vertical slice', () => {
  beforeAll(() => {
    originalState = fs.readFileSync(statePath, 'utf8');
  });

  afterAll(() => {
    fs.writeFileSync(statePath, originalState, 'utf8');
  });

  it('starts at an empty canonical parcel', () => {
    const genesis = HermesLiveHouseEngine.resetToGenesis();
    expect(genesis.currentCheckpoint).toBe(0);
    expect(genesis.buildingComponents).toHaveLength(0);
    expect(genesis.events).toHaveLength(1);
    expect(genesis.constructabilityProof?.status).toBe('UNVERIFIED');
  });

  it('executes canonical mobilization through a finished residence', () => {
    const finalState = HermesLiveHouseEngine.advanceToStep(30);
    expect(finalState.status).toBe('COMPLETED');
    expect(finalState.overallCompletionPct).toBe(100);
    expect(finalState.completedTasks).toContain('MOBILIZE_SITE_OPERATIONS');
    expect(finalState.completedTasks).toContain('INSTALL_FINISHES_AND_FIXTURES');
    expect(finalState.buildingComponents.some((component) => component.installationPhase === 'FINISHES')).toBe(true);
    expect(finalState.buildingComponents.some((component) => component.installationPhase === 'MEP_FINAL')).toBe(true);
  });

  it('enforces long-material staging before future closure', () => {
    const state = HermesLiveHouseEngine.getCanonicalWorldState();
    const proof = state.constructabilityProof;
    expect(proof?.status).toBe('PASSED');
    expect(proof?.routeAfterClosureFeasible).toBe(false);
    expect(state.completedTasks.indexOf(proof!.predecessorTaskId)).toBeLessThan(state.completedTasks.indexOf(proof!.closureTaskId));
    expect(proof?.evidenceEventId).toMatch(/^EVT-TASK-/);

    const actor = state.agentSpatialStates.find((candidate) => candidate.agentId === 'AGENT-FRAMING-001');
    expect(actor?.carriedMaterial?.materialId).toBe(proof?.materialId);
    expect(actor?.combinedEnvelopeMeters[0]).toBeGreaterThan(actor?.bodyEnvelopeMeters[0]);
  });

  it('leaves no actionable clash open at closeout', () => {
    const state = HermesLiveHouseEngine.getCanonicalWorldState();
    expect(state.clashes.filter((clash) => clash.status === 'ACTIVE')).toHaveLength(0);
  });
});
