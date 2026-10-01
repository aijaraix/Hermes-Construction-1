import type { AxisAlignedSizeMeters, CanonicalPose, EulerRadians, SpatialTransform, Vector3 } from '../types/hermes';

export function assertFiniteVector3(value: Vector3, label = 'vector'): Vector3 {
  if (value.length !== 3 || value.some(item => !Number.isFinite(item))) throw new Error(`${label} must contain three finite numbers`);
  return value;
}
export function fromXyzMeters(x: number, y: number, z: number): AxisAlignedSizeMeters { return { x, y, z }; }
export function fromLegacyLengthWidthHeightMeters(length: number, width: number, height: number): AxisAlignedSizeMeters { return { x: length, y: height, z: width }; }
export function createCanonicalPose(pose: CanonicalPose): CanonicalPose { assertFiniteVector3(pose.positionMeters, 'positionMeters'); return pose; }
function rotateEulerXyz(vector: Vector3, [rx, ry, rz]: EulerRadians): Vector3 {
  const [x, y, z] = vector;
  const cy = Math.cos(rx), sy = Math.sin(rx); const y1 = y * cy - z * sy, z1 = y * sy + z * cy;
  const cp = Math.cos(ry), sp = Math.sin(ry); const x2 = x * cp + z1 * sp, z2 = -x * sp + z1 * cp;
  const cr = Math.cos(rz), sr = Math.sin(rz); return [x2 * cr - y1 * sr, x2 * sr + y1 * cr, z2];
}
export function applyTransform(position: Vector3, transform: SpatialTransform): Vector3 {
  const rotated = rotateEulerXyz(assertFiniteVector3(position), transform.orientation.value);
  return [rotated[0] + transform.translationMeters[0], rotated[1] + transform.translationMeters[1], rotated[2] + transform.translationMeters[2]];
}
export function invertTransform(transform: SpatialTransform): SpatialTransform {
  const [rx, ry, rz] = transform.orientation.value;
  const inverseOrientation: EulerRadians = [-rx, -ry, -rz];
  const translated: Vector3 = [-transform.translationMeters[0], -transform.translationMeters[1], -transform.translationMeters[2]];
  return { ...transform, transformId: `${transform.transformId}:inverse`, sourceFrameId: transform.targetFrameId, targetFrameId: transform.sourceFrameId, translationMeters: rotateEulerXyz(translated, inverseOrientation), orientation: { kind: 'EULER_XYZ_RADIANS', value: inverseOrientation } };
}
/** Renderer coordinates are derived only; current local-meter fixtures project identically. */
export function projectPoseToRenderer(pose: CanonicalPose): Vector3 { return [...pose.positionMeters] as Vector3; }
