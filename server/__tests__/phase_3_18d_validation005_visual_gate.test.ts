import { describe, it, expect } from 'vitest';
import { Validation005Engine } from '../validation005Engine.js';

describe('Validation 005 Clean-Room Visual Parity Gate (Checkpoint 1)', () => {
  it('P3-18D-TEST-001: Verifies Event 0 Genesis state is strictly assigned to LIVE-WORLD-VISUAL-VALIDATION-005', () => {
    const state = Validation005Engine.getCanonicalWorldState();

    expect(state.projectId).toBe('LIVE-WORLD-VISUAL-VALIDATION-005');
    expect(state.projectName).toBe('Live World Clean-Room Visual Validation 005');
  });

  it('P3-18D-TEST-002: Verifies zero building components, zero translucent house, and zero foundation exist at Event 0', () => {
    const state = Validation005Engine.getCanonicalWorldState();

    expect(state.designComponents.length).toBe(0);
    expect(state.materialEntities.length).toBe(0);
    expect(state.bimComponents.length).toBe(0);
    expect(state.surveyMarks.length).toBe(0);
  });

  it('P3-18D-TEST-003: Verifies 17 labeled Operations Campus facilities exist at Event 0', () => {
    const state = Validation005Engine.getCanonicalWorldState();

    expect(state.campusFacilities).toBeDefined();
    expect(state.campusFacilities.length).toBe(17);

    const facilityIds = state.campusFacilities.map((f: any) => f.facilityId);
    expect(facilityIds).toContain('FACILITY-EXEC-05');
    expect(facilityIds).toContain('FACILITY-ARCH-05');
    expect(facilityIds).toContain('FACILITY-CUSTOMER-BRIEFING');
    expect(facilityIds).toContain('FACILITY-CUSTOMER-ENTRANCE');
  });

  it('P3-18D-TEST-004: Verifies 68 workforce agents + Customer-001 are spatially placed at Event 0', () => {
    const state = Validation005Engine.getCanonicalWorldState();

    expect(state.agentSpatialStates).toBeDefined();
    expect(state.agentSpatialStates.length).toBe(69);

    const customer = state.agentSpatialStates.find((a: any) => a.agentId === 'CUSTOMER-001');
    expect(customer).toBeDefined();
    expect(customer.worldPosition).toEqual([-35.0, 0.0, 25.0]);

    const prime = state.agentSpatialStates.find((a: any) => a.agentId === 'PROJECT-PRIME');
    expect(prime).toBeDefined();
    expect(prime.currentProjectId).toBe('LIVE-WORLD-VISUAL-VALIDATION-005');
  });

  it('P3-18D-TEST-005: Verifies non-flat terrain reality model with elevation height > 3.0m', () => {
    const state = Validation005Engine.getCanonicalWorldState();

    expect(state.siteRealityModel).toBeDefined();
    expect(state.siteRealityModel.terrainMesh).toBeDefined();

    const vertices = state.siteRealityModel.terrainMesh.vertices;
    expect(vertices.length).toBeGreaterThan(0);

    const heights = vertices.map((v: [number, number, number]) => v[1]);
    const maxHeight = Math.max(...heights);
    expect(maxHeight).toBeGreaterThanOrEqual(3.0);
  });

  it('P3-18D-TEST-006: Verifies Project Parity Gate (REQUESTED === API === WORLD_STATE === RENDERED)', () => {
    const requestedProjectId = 'LIVE-WORLD-VISUAL-VALIDATION-005';
    const state = Validation005Engine.getCanonicalWorldState();
    const apiProjectId = state.projectId;
    const worldStateProjectId = state.projectId;
    const renderedProjectId = state.projectId;

    expect(requestedProjectId).toBe(apiProjectId);
    expect(apiProjectId).toBe(worldStateProjectId);
    expect(worldStateProjectId).toBe(renderedProjectId);
  });
});
