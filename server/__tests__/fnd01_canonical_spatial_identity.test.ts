import { describe, expect, it } from 'vitest';
import { createCanonicalEntity, assertNoExternalIdentityConflict, supersedeEntityRevision, withExternalIdentity } from '../../src/lib/canonicalIdentity';
import { applyTransform, fromLegacyLengthWidthHeightMeters, fromXyzMeters, invertTransform, projectPoseToRenderer } from '../../src/lib/canonicalSpatial';
import { convertAngle, convertArea, convertLength, convertVolume } from '../../src/lib/physicalUnits';
import { BimCommandEngine } from '../bimCommandEngine';
import { calculateComponentQuantities } from '../deterministicGeometryEngine';

describe('HERMES FND-01 canonical identity, revisions, units and frames', () => {
  it('keeps canonical identity stable while aliases change and permits multiple sources', () => {
    const entity = createCanonicalEntity({ entityId: 'ENTITY-1', projectId: 'P1', entityClass: 'WALL', currentRevisionId: 'ER-1', externalIds: [{ system: 'IFC', externalId: 'old' }] });
    const remapped = withExternalIdentity({ ...entity, externalIds: [] }, { system: 'IFC', externalId: 'new' });
    const mapped = withExternalIdentity(remapped, { system: 'REVIT', externalId: '42' });
    expect(mapped.entityId).toBe('ENTITY-1');
    expect(mapped.externalIds).toHaveLength(2);
    expect(() => assertNoExternalIdentityConflict([mapped, { ...mapped, entityId: 'ENTITY-2' }])).toThrow(/conflict/);
  });

  it('keeps immutable project/entity revision lineage', () => {
    const next = supersedeEntityRevision(
      { revisionId: 'ER-1', entityId: 'ENTITY-1', projectRevisionId: 'PR-1', revisionIndex: 1, recordedAt: '2026-01-01T00:00:00.000Z' },
      { revisionId: 'ER-2', entityId: 'ENTITY-1', projectRevisionId: 'PR-2', revisionIndex: 2, recordedAt: '2026-01-02T00:00:00.000Z' }
    );
    expect(next.supersedesRevisionId).toBe('ER-1');
  });

  it('requires explicit conversions and preserves physical values', () => {
    expect(convertLength(convertLength(1, 'METER', 'FOOT'), 'FOOT', 'METER')).toBeCloseTo(1, 10);
    expect(convertArea(1, 'SQUARE_METER', 'SQUARE_FOOT')).toBeCloseTo(10.7639, 3);
    expect(convertVolume(1, 'CUBIC_METER', 'CUBIC_YARD')).toBeCloseTo(1.30795, 4);
    expect(convertAngle(Math.PI, 'RADIAN', 'DEGREE')).toBeCloseTo(180, 10);
  });

  it('uses explicit adapters for legacy L/W/H and XYZ dimensions', () => {
    expect(fromLegacyLengthWidthHeightMeters(12.192, 2.438, 2.896)).toEqual({ x: 12.192, y: 2.896, z: 2.438 });
    expect(fromXyzMeters(12.192, 2.896, 2.438)).toEqual({ x: 12.192, y: 2.896, z: 2.438 });
  });

  it('transforms and inverts the supported local-frame translation subset', () => {
    const transform = { transformId: 'T1', sourceFrameId: 'CHILD', targetFrameId: 'ROOT', translationMeters: [10, 2, -5] as [number, number, number], orientation: { kind: 'EULER_XYZ_RADIANS' as const, value: [0, 0, 0] as [number, number, number] } };
    const world = applyTransform([1, 2, 3], transform);
    expect(world).toEqual([11, 4, -2]);
    expect(applyTransform(world, invertTransform(transform))).toEqual([1, 2, 3]);
    expect(projectPoseToRenderer({ frameId: 'ROOT', positionMeters: world, orientation: transform.orientation, anchor: 'BASE_INSERTION' })).toEqual(world);
  });

  it('calculates metric command-created wall area correctly while preserving legacy feet', () => {
    const metric = { type: 'wall', geometry: { dimensions: [0.15, 3, 4], lengthUnit: 'METER' }, unitCost: 1 } as any;
    const legacy = { type: 'wall', geometry: { dimensions: [4, 3, 20] }, unitCost: 1 } as any;
    expect(calculateComponentQuantities(metric).value).toBeCloseTo(129.1669, 3);
    expect(calculateComponentQuantities(legacy).value).toBe(12);
  });

  it('labels command-created BIM geometry as meter/frame/anchor metadata', () => {
    const projectId = `FND01-${Date.now()}`;
    const result = BimCommandEngine.executeCommand({ commandType: 'CREATE_WALL', projectId, attemptId: 'ATTEMPT-1', agentId: 'AGENT-1', taskId: 'TASK-1', params: { startPos: [0, 0, 0], endPos: [4, 0, 0], thicknessMeters: 0.15, heightMeters: 3 } });
    const component = BimCommandEngine.getCanonicalProjectComponents(projectId).find(item => item.id === result.createdModifiedObjectIds[0])!;
    expect(component.geometry).toMatchObject({ lengthUnit: 'METER', frameId: `FRAME-${projectId}-ROOT`, positionAnchor: 'BASE_INSERTION' });
  });
});
