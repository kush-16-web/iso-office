import type { Point } from './types';
// Shared by Three.js and the minimap. Pass 2 will extend this retained layout.
export const WORLD_FLOORS = [
  { id: 'open', x: 0, z: 0, width: 16, depth: 16, color: '#78a5e6', label: 'Public space' },
  { id: 'meeting', x: -12, z: 0, width: 8, depth: 16, color: '#e1a747', label: 'Meeting rooms' },
  { id: 'lounge', x: 0, z: -12, width: 16, depth: 8, color: '#f4bc51', label: 'Lounge & library' },
];
export const WORLD_BOUNDS = { min: -17, max: 9 };
export const WORLD_POSITIONS: Record<string, Point> = {
  me: { x: 2, z: 2 }, gregoria: { x: 0, z: -1.5 }, christeen: { x: 4.5, z: 3 },
  deane: { x: -2.5, z: 5 }, elisa: { x: -10.5, z: 2 }, wilbert: { x: -13.5, z: 2 },
  sephora: { x: 4, z: -10 }, vanessa: { x: -2, z: -12 }, arturo: { x: 5, z: -4 },
  denise: { x: -5, z: 1 }, kaeya: { x: -12, z: -4 }, edgar: { x: -12, z: -6 }, keely: { x: 2, z: -5 },
};
export const worldToMap = (value: number) => (value - WORLD_BOUNDS.min) / (WORLD_BOUNDS.max - WORLD_BOUNDS.min) * 100;
export const mapToWorld = (value: number) => WORLD_BOUNDS.min + value / 100 * (WORLD_BOUNDS.max - WORLD_BOUNDS.min);
export const clampWorldPoint = (point: Point): Point => ({ x: Math.max(-14, Math.min(6, point.x)), z: Math.max(-14, Math.min(6, point.z)) });
