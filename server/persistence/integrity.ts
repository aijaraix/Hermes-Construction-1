import { createHash } from 'node:crypto';
import type { EventAppend, FrameRecord } from './contracts';

export class PersistenceConflict extends Error { constructor(message: string) { super(message); this.name = 'PersistenceConflict'; } }
export class ScopeViolation extends Error { constructor() { super('Canonical repository scope mismatch or project unavailable'); this.name = 'ScopeViolation'; } }
export function required(value: unknown, name: string): asserts value is string { if (typeof value !== 'string' || !value.trim()) throw new Error(`${name} required`); }
export function canonicalJson(value: unknown): string {
  const visit = (v: unknown): unknown => {
    if (v === null || typeof v === 'string' || typeof v === 'boolean') return v;
    if (typeof v === 'number' && Number.isFinite(v)) return v;
    if (Array.isArray(v)) return v.map(visit);
    if (typeof v === 'object' && v && Object.getPrototypeOf(v) === Object.prototype) return Object.fromEntries(Object.keys(v).sort().filter(k => v[k] !== undefined).map(k => [k, visit(v[k])]));
    throw new Error('Canonical persistence accepts finite JSON only');
  };
  return JSON.stringify(visit(value));
}
export const hashContent = (value: unknown) => createHash('sha256').update(canonicalJson(value)).digest('hex');
export function eventHash(input: EventAppend): string {
  required(input.record.eventId, 'eventId'); required(input.record.projectId, 'projectId'); required(input.record.eventType, 'eventType');
  if (!Number.isFinite(Date.parse(input.record.timestamp))) throw new Error('Invalid event timestamp');
  if (!Number.isSafeInteger(input.sequence) || input.sequence < 0) throw new Error('Invalid event sequence');
  return hashContent(input);
}
export function compareEventHash(existing: string | undefined, candidate: string): 'APPENDED' | 'IDEMPOTENT' {
  if (existing === undefined) return 'APPENDED';
  if (existing !== candidate) throw new PersistenceConflict('Same event ID has different canonical content');
  return 'IDEMPOTENT';
}
export function validateFrame(input: FrameRecord): void {
  required(input.frame.frameId, 'frameId'); required(input.frame.projectId, 'projectId'); required(input.revisionId, 'revisionId');
  if (input.unit !== 'METER') throw new Error('Frame translations must use canonical metres');
  if (input.geodeticOrigin) {
    const p = input.geodeticOrigin;
    if (input.frame.kind !== 'GEODETIC' || input.crs !== 'EPSG:4326') throw new Error('Geodetic origin requires explicit GEODETIC EPSG:4326 frame');
    if (![p.longitudeDeg,p.latitudeDeg,p.elevationMeters].every(Number.isFinite) || Math.abs(p.longitudeDeg)>180 || Math.abs(p.latitudeDeg)>90) throw new Error('Invalid geodetic origin');
  }
  if (!['GEODETIC','PROJECT_SURVEY'].includes(input.frame.kind) && input.crs) throw new Error('Local XYZ cannot be assigned a geodetic/projected CRS');
}
