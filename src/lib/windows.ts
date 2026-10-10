import type { Bounds, OfficeWindow, Rect, WindowKind } from '../types';
export const MOBILE_WIDTH = 650;
export function clampRect(rect: Rect, bounds: Bounds): Rect {
  const width = Math.min(Math.max(1, bounds.width - 24), Math.max(300, rect.width));
  const height = Math.min(Math.max(1, bounds.height - 112), Math.max(260, rect.height));
  return { width, height, x: Math.max(12, Math.min(rect.x, bounds.width - width - 12)), y: Math.max(12, Math.min(rect.y, bounds.height - height - 100)) };
}
export function defaultRect(kind: WindowKind, bounds: Bounds, offset = 0): Rect {
  const channel = kind === 'channel';
  const width = channel ? 476 : kind === 'dm' ? 390 : 420;
  const height = channel ? 596 : kind === 'dm' ? 408 : 430;
  return clampRect({ x: channel ? bounds.width - width - 34 : 74 + offset * 22, y: channel ? 234 : kind === 'dm' ? 412 + offset * 18 : 216, width, height }, bounds);
}
export function displayRect(window: OfficeWindow, bounds: Bounds): Rect {
  if (bounds.width < MOBILE_WIDTH) return { x: 8, y: 56, width: Math.max(1, bounds.width - 16), height: Math.max(180, bounds.height - 204) };
  if (window.mode === 'maximized') return { x: 12, y: 12, width: bounds.width - 24, height: Math.max(180, bounds.height - 112) };
  return window.rect;
}
