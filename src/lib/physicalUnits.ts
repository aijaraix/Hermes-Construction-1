import type { AngleUnit, AreaUnit, LengthUnit, VolumeUnit } from '../types/hermes';

const FEET_PER_METER = 3.280839895013123;
const INCHES_PER_METER = 39.37007874015748;

export function convertLength(value: number, from: LengthUnit, to: LengthUnit): number {
  if (from === to) return value;
  const meters = from === 'METER' ? value : from === 'FOOT' ? value / FEET_PER_METER : value / INCHES_PER_METER;
  return to === 'METER' ? meters : to === 'FOOT' ? meters * FEET_PER_METER : meters * INCHES_PER_METER;
}
export function convertArea(value: number, from: AreaUnit, to: AreaUnit): number {
  if (from === to) return value;
  return from === 'SQUARE_METER' ? value * FEET_PER_METER ** 2 : value / FEET_PER_METER ** 2;
}
export function convertVolume(value: number, from: VolumeUnit, to: VolumeUnit): number {
  if (from === to) return value;
  const cubicMeters = from === 'CUBIC_METER' ? value : from === 'CUBIC_FOOT' ? value / FEET_PER_METER ** 3 : (value * 27) / FEET_PER_METER ** 3;
  return to === 'CUBIC_METER' ? cubicMeters : to === 'CUBIC_FOOT' ? cubicMeters * FEET_PER_METER ** 3 : (cubicMeters * FEET_PER_METER ** 3) / 27;
}
export function convertAngle(value: number, from: AngleUnit, to: AngleUnit): number {
  if (from === to) return value;
  return from === 'RADIAN' ? (value * 180) / Math.PI : (value * Math.PI) / 180;
}
