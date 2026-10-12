import './setup';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { useStore } from '../src/store';
import { OFFICE_ANCHORS, calculateNavRoute, findClosestNavNode } from '../src/world/navigation';

test('every office anchor is uniquely occupied and within office bounds', () => {
  const anchors = Object.values(OFFICE_ANCHORS);
  assert.ok(anchors.length >= 12, 'Expected at least 12 office character anchors');

  // Check no two characters occupy the exact same position
  const positions = new Set<string>();
  for (const anchor of anchors) {
    const key = `${anchor.position.x.toFixed(2)},${anchor.position.z.toFixed(2)}`;
    assert.equal(positions.has(key), false, `Collision detected at anchor position ${key}`);
    positions.add(key);

    // Bounds check
    assert.ok(anchor.position.x >= -16 && anchor.position.x <= 8, `X out of bounds: ${anchor.position.x}`);
    assert.ok(anchor.position.z >= -16 && anchor.position.z <= 8, `Z out of bounds: ${anchor.position.z}`);

    // Elevation check: seated must be ~0.42, standing ~0.12
    if (anchor.type === 'seated') {
      assert.ok(Math.abs(anchor.position.y - 0.42) < 0.05, `Seated character must be at chair seat height`);
    } else {
      assert.ok(Math.abs(anchor.position.y - 0.12) < 0.05, `Standing character must be on floor`);
    }
  }
});

test('A* navigation calculates valid waypoints across office zones', () => {
  // Test route from Open Office (me) to West Meeting Room (wilbert)
  const start = OFFICE_ANCHORS.me.approachPoint;
  const target = OFFICE_ANCHORS.wilbert.approachPoint;

  const route = calculateNavRoute(start, target);
  assert.ok(route.length >= 3, 'Expected multi-step waypoint path connecting zones');

  // Verify route ends at target
  const endPoint = route[route.length - 1];
  assert.equal(endPoint.x, target.x);
  assert.equal(endPoint.z, target.z);

  // Test closest node resolution
  const closest = findClosestNavNode({ x: 0, z: 0 });
  assert.ok(closest.startsWith('wp_'));
});

test('notification manager handles stacking, deduplication, and individual dismissals', () => {
  const state = useStore.getState();
  state.clearNotice();

  state.notify('Build completed successfully.', 'Build', 'success');
  assert.equal(useStore.getState().toasts.length, 1);
  assert.equal(useStore.getState().toasts[0].kind, 'success');

  // Deduplication check
  state.notify('Build completed successfully.', 'Build', 'success');
  assert.equal(useStore.getState().toasts.length, 1, 'Duplicate messages within 2s must be ignored');

  // Adding different toasts
  state.notify('Review requested.', 'Review', 'info');
  state.notify('Connection degraded.', 'Network', 'warn');
  assert.equal(useStore.getState().toasts.length, 3);

  // Dismissing individual toast
  const middleId = useStore.getState().toasts[1].id;
  state.dismissToast(middleId);
  assert.equal(useStore.getState().toasts.length, 2);
  assert.ok(!useStore.getState().toasts.some((t) => t.id === middleId));

  state.clearNotice();
  assert.equal(useStore.getState().toasts.length, 0);
});

test('navigation travel state transitions correctly', () => {
  const state = useStore.getState();
  state.startNavigation('gregoria');

  assert.equal(useStore.getState().navigation.isNavigating, true);
  assert.equal(useStore.getState().navigation.targetUserId, 'gregoria');
  assert.equal(useStore.getState().cameraMode, 'follow');

  state.skipNavigation();
  assert.equal(useStore.getState().navigation.isNavigating, false);
  assert.equal(useStore.getState().cameraMode, 'focus');
});
