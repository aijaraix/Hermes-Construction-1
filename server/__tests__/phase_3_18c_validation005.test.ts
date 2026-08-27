import { describe, it, expect } from 'vitest';
import { Validation005Engine } from '../validation005Engine.js';

describe('HERMES Master Spec 001 — Validation 005 Causal Construction Suite', () => {
  it('1. Genesis World State: Non-flat Site Reality, Operations Campus & 68 Canonical Workforce', () => {
    const state = Validation005Engine.initialize();
    expect(state.projectId).toBe('LIVE-WORLD-VISUAL-VALIDATION-005');
    expect(state.siteRealityModel).toBeDefined();
    expect(state.siteRealityModel.siteId).toBe('PARCEL-005');

    // Verify non-flat terrain mesh
    const vertices = state.siteRealityModel.terrainMesh.vertices;
    expect(vertices.length).toBeGreaterThan(50);
    const yValues = vertices.map((v: [number, number, number]) => v[1]);
    const minY = Math.min(...yValues);
    const maxY = Math.max(...yValues);
    expect(maxY - minY).toBeGreaterThan(1.0); // Non-flat terrain!

    // Verify 68 agents at home facilities
    const workforce = state.agentSpatialStates.filter((a: any) => a.agentId !== 'CUSTOMER-001');
    expect(workforce.length).toBe(68);

    // Verify empty initial construction site
    expect(state.bimComponents.length).toBe(0);
    expect(state.designComponents.length).toBe(0);
    expect(state.materialEntities.length).toBe(0);
  });

  it('2. Customer Intent & Briefing Interview: Requirements Persistence', () => {
    const state = Validation005Engine.initialize();
    // Advance steps 1 to 8
    for (let i = 0; i < 8; i++) {
      Validation005Engine.advanceOneStep(state);
    }

    expect(state.customerInteractions.length).toBeGreaterThan(0);
    expect(state.structuredRequirements).toBeDefined();
    expect(state.structuredRequirements.buildingType).toBe('SINGLE_FAMILY_RESIDENTIAL');
    expect(state.structuredRequirements.targetAreaSqM).toBe(110.0);
    expect(state.requirementDecisions.length).toBeGreaterThan(0);
  });

  it('3. Site Investigation & Survey: Buildable Envelope Derivation', () => {
    const state = Validation005Engine.initialize();
    // Advance to step 13 (Buildable Envelope calculated)
    for (let i = 0; i < 13; i++) {
      Validation005Engine.advanceOneStep(state);
    }

    expect(state.activeMissions.length).toBeGreaterThan(0);
    expect(state.surveyMarks.length).toBe(4);
    expect(state.buildableEnvelope).toBeDefined();
    expect(state.buildableEnvelope.envelopeId).toBe('ENVELOPE-V5-001');
    expect(state.buildableEnvelope.terrainConstraints.cutFillStrategy).toBe('CUT_AND_FILL');
  });

  it('4. Causal Design & Virtual Build: BOM Takeoff & Procurement', () => {
    const state = Validation005Engine.initialize();
    // Advance to step 18 (Procurement order issued)
    for (let i = 0; i < 18; i++) {
      Validation005Engine.advanceOneStep(state);
    }

    expect(state.designComponents.length).toBe(3); // Layer A Proposed
    expect(state.approvedDesign).toBeDefined();
    expect(state.approvedDesign.selectedAlternative).toBe('ALT-B-CUT-FILL-SLAB');
    expect(state.bomTakeoff).toBeDefined();
    expect(state.bomTakeoff.items.length).toBe(3);
    expect(state.procurementOrders.length).toBe(2);

    // Physical site remains empty before delivery!
    expect(state.bimComponents.length).toBe(0);
    expect(state.materialEntities.length).toBe(0);
  });

  it('5. Supply Chain Delivery & Staging: Material Conservation', () => {
    const state = Validation005Engine.initialize();
    // Advance to step 20 (Material staged)
    for (let i = 0; i < 20; i++) {
      Validation005Engine.advanceOneStep(state);
    }

    expect(state.materialEntities.length).toBe(1);
    const rebar = state.materialEntities[0];
    expect(rebar.materialId).toBe('MAT-PKG-REBAR-001');
    expect(rebar.status).toBe('STAGED');
    expect(rebar.worldPosition).toEqual([-15.0, 0.2, 10.0]); // Staging yard
  });

  it('6. Physical Execution & Earthwork: Terrain Mesh Deformation & Accepted Foundation', () => {
    const report = Validation005Engine.runFullSimulation();

    expect(report.currentStepIndex).toBe(26);
    expect(report.siteRealityModel.proposedGrade).toBe(0.5);

    // Verify earthwork updated footprint terrain height to 0.5m
    const footprintVertices = report.siteRealityModel.terrainMesh.vertices.filter(
      (v: [number, number, number]) => v[0] >= -10.0 && v[0] <= 10.0 && v[2] >= -10.0 && v[2] <= 10.0
    );
    expect(footprintVertices.every((v: [number, number, number]) => v[1] === 0.5)).toBe(true);

    // Verify Foundation Component Accepted As-Built
    const foundation = report.evidencePackage.find((e) => e.checkpointId === 'CHK-P-ACCEPTED-AS-BUILT');
    expect(foundation).toBeDefined();

    // Truth Gates Verification
    expect(report.truthGates.GENESIS_EMPTY_PROJECT_SITE).toBe('PASS');
    expect(report.truthGates.OPERATIONS_CAMPUS_VISIBLE).toBe('PASS');
    expect(report.truthGates.CANONICAL_WORKFORCE_VISIBLE).toBe('PASS');
    expect(report.truthGates.FOUNDATION_ACCEPTED_AS_BUILT).toBe('PASS');
    expect(report.truthGates.NO_PREMATURE_WALLS).toBe('PASS');
    expect(report.truthGates.NO_PREMATURE_MEP).toBe('PASS');
    expect(report.diagnosticsSummary.passedGatesCount).toBe(40);
    expect(report.diagnosticsSummary.overallGateStatus).toBe('PASS');
    expect(report.diagnosticsSummary.ownerVisualAcceptanceStatus).toBe('PENDING');
  });
});
