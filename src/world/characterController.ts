import * as THREE from 'three';
import type { Point } from '../types';
import { OFFICE_ANCHORS, calculateNavRoute, type OfficeAnchor } from './navigation';

export type CharacterActionState =
  | 'idle'
  | 'walking'
  | 'turning'
  | 'sitting'
  | 'standing_up'
  | 'sitting_down'
  | 'seated';

export interface ManagedCharacter {
  userId: string;
  group: THREE.Group;
  mixer: THREE.AnimationMixer;
  actions: Record<string, THREE.AnimationAction>;
  currentActionName: string;
  state: CharacterActionState;
  anchor: OfficeAnchor;
  isLocalAvatar: boolean;
}

export class CharacterMovementManager {
  private characters = new Map<string, ManagedCharacter>();
  private activeRoute: Point[] = [];
  private currentWaypointIndex = 0;
  private walkSpeed = 3.2; // Units per second - believable, brisk walking pace
  private turnSpeed = 8.0; // Radians per second - smooth natural turn
  private isTraveling = false;
  private travelTargetUserId: string | null = null;
  private onArrivalCallback: (() => void) | null = null;
  private localAvatarId = 'me';

  // Subtle ambient life timers
  private nextAmbientEmoteTime = 4.0;
  private elapsedTime = 0;

  public registerCharacter(
    userId: string,
    group: THREE.Group,
    mixer: THREE.AnimationMixer,
    clips: THREE.AnimationClip[],
    anchor: OfficeAnchor,
    initialState: CharacterActionState = 'idle'
  ): ManagedCharacter {
    const actions: Record<string, THREE.AnimationAction> = {};
    for (const clip of clips) {
      actions[clip.name] = mixer.clipAction(clip);
    }

    const isLocalAvatar = userId === this.localAvatarId;
    const initialClipName = initialState === 'seated' ? 'sit' : 'idle';
    const initialAction = actions[initialClipName] || actions['idle'] || Object.values(actions)[0];

    if (initialAction) {
      initialAction.setEffectiveTimeScale(1);
      initialAction.setEffectiveWeight(1);
      initialAction.play();
    }

    const managed: ManagedCharacter = {
      userId,
      group,
      mixer,
      actions,
      currentActionName: initialClipName,
      state: initialState,
      anchor,
      isLocalAvatar,
    };

    this.characters.set(userId, managed);
    return managed;
  }

  public getCharacter(userId: string): ManagedCharacter | undefined {
    return this.characters.get(userId);
  }

  public getLocalAvatarPosition(): THREE.Vector3 {
    const avatar = this.characters.get(this.localAvatarId);
    if (!avatar) return new THREE.Vector3(2, 0.12, 2);
    return avatar.group.position;
  }

  public isNavigating(): boolean {
    return this.isTraveling;
  }

  public getTravelTargetUserId(): string | null {
    return this.travelTargetUserId;
  }

  // Crossfade between animation clips smoothly
  public playAction(char: ManagedCharacter, actionName: string, duration = 0.25): void {
    if (char.currentActionName === actionName) return;

    const currentAction = char.actions[char.currentActionName];
    const newAction = char.actions[actionName];

    if (!newAction) return;

    newAction.reset();
    newAction.setEffectiveTimeScale(1);
    newAction.setEffectiveWeight(1);
    newAction.fadeIn(duration);
    newAction.play();

    if (currentAction) {
      currentAction.fadeOut(duration);
    }

    char.currentActionName = actionName;
  }

  // Initiate Go to Person navigation
  public navigateToPerson(targetUserId: string, onArrival?: () => void): boolean {
    const avatar = this.characters.get(this.localAvatarId);
    const targetAnchor = OFFICE_ANCHORS[targetUserId];

    if (!avatar || !targetAnchor) return false;

    this.travelTargetUserId = targetUserId;
    this.onArrivalCallback = onArrival || null;

    // Start position of the local avatar
    const startPoint: Point = {
      x: avatar.group.position.x,
      z: avatar.group.position.z,
    };

    // Calculate collision-free route to target approach point
    const route = calculateNavRoute(startPoint, targetAnchor.approachPoint);
    this.activeRoute = route;
    this.currentWaypointIndex = 0;
    this.isTraveling = true;

    // If avatar was seated at their desk, stand up first
    if (avatar.state === 'seated') {
      avatar.state = 'standing_up';
      avatar.group.position.y = 0.12;
      this.playAction(avatar, 'idle', 0.2);
    }

    // Blend to walk animation
    this.playAction(avatar, 'walk', 0.2);
    avatar.state = 'walking';

    return true;
  }

  // Skip travel: instantaneous jump with correct final framing and idle stance
  public skipTravel(): void {
    if (!this.isTraveling) return;

    const avatar = this.characters.get(this.localAvatarId);
    const targetAnchor = this.travelTargetUserId ? OFFICE_ANCHORS[this.travelTargetUserId] : null;

    if (avatar && targetAnchor) {
      avatar.group.position.set(targetAnchor.approachPoint.x, 0.12, targetAnchor.approachPoint.z);

      // Face target coworker
      const dx = targetAnchor.position.x - targetAnchor.approachPoint.x;
      const dz = targetAnchor.position.z - targetAnchor.approachPoint.z;
      avatar.group.rotation.y = Math.atan2(dx, dz);

      this.playAction(avatar, 'idle', 0.15);
      avatar.state = 'idle';
    }

    this.isTraveling = false;
    const callback = this.onArrivalCallback;
    this.onArrivalCallback = null;
    this.travelTargetUserId = null;
    this.activeRoute = [];

    if (callback) callback();
  }

  // Cancel travel: stop walking immediately at current position
  public cancelTravel(): void {
    if (!this.isTraveling) return;

    const avatar = this.characters.get(this.localAvatarId);
    if (avatar) {
      this.playAction(avatar, 'idle', 0.2);
      avatar.state = 'idle';
    }

    this.isTraveling = false;
    this.travelTargetUserId = null;
    this.onArrivalCallback = null;
    this.activeRoute = [];
  }

  // Main per-frame update loop
  public update(delta: number): void {
    this.elapsedTime += delta;

    // 1. Update animation mixers for all characters
    for (const char of this.characters.values()) {
      char.mixer.update(delta);
    }

    // 2. Handle navigation movement along route
    if (this.isTraveling) {
      this.updateNavigation(delta);
    }

    // 3. Subtle ambient life behavior for idle/seated characters
    this.updateAmbientOfficeLife();
  }

  private updateNavigation(delta: number): void {
    const avatar = this.characters.get(this.localAvatarId);
    if (!avatar || this.currentWaypointIndex >= this.activeRoute.length) {
      this.completeArrival();
      return;
    }

    const targetWaypoint = this.activeRoute[this.currentWaypointIndex];
    const currentPos = avatar.group.position;

    const dx = targetWaypoint.x - currentPos.x;
    const dz = targetWaypoint.z - currentPos.z;
    const dist = Math.hypot(dx, dz);

    // Target rotation towards waypoint
    const targetAngle = Math.atan2(dx, dz);
    let diffAngle = targetAngle - avatar.group.rotation.y;

    // Normalize angle difference to [-PI, PI]
    while (diffAngle > Math.PI) diffAngle -= Math.PI * 2;
    while (diffAngle < -Math.PI) diffAngle += Math.PI * 2;

    // Smooth turning towards direction
    const turnStep = Math.sign(diffAngle) * Math.min(Math.abs(diffAngle), this.turnSpeed * delta);
    avatar.group.rotation.y += turnStep;

    // Move forward
    const moveStep = this.walkSpeed * delta;
    if (dist <= moveStep) {
      currentPos.x = targetWaypoint.x;
      currentPos.z = targetWaypoint.z;
      this.currentWaypointIndex++;

      if (this.currentWaypointIndex >= this.activeRoute.length) {
        this.completeArrival();
      }
    } else {
      currentPos.x += (dx / dist) * moveStep;
      currentPos.z += (dz / dist) * moveStep;
    }
  }

  private completeArrival(): void {
    const avatar = this.characters.get(this.localAvatarId);
    const targetAnchor = this.travelTargetUserId ? OFFICE_ANCHORS[this.travelTargetUserId] : null;

    if (avatar && targetAnchor) {
      // Turn to face the coworker upon arrival
      const dx = targetAnchor.position.x - avatar.group.position.x;
      const dz = targetAnchor.position.z - avatar.group.position.z;
      avatar.group.rotation.y = Math.atan2(dx, dz);

      this.playAction(avatar, 'idle', 0.25);
      avatar.state = 'idle';
    }

    this.isTraveling = false;
    const callback = this.onArrivalCallback;
    this.onArrivalCallback = null;
    this.travelTargetUserId = null;
    this.activeRoute = [];

    if (callback) callback();
  }

  // Periodic subtle gestures (nodding in meeting, brief head turns)
  private updateAmbientOfficeLife(): void {
    if (this.elapsedTime < this.nextAmbientEmoteTime) return;

    this.nextAmbientEmoteTime = this.elapsedTime + 4.5 + Math.random() * 5.0;

    // Pick an idle coworker not actively navigating
    const candidates = Array.from(this.characters.values()).filter(
      (c) => c.userId !== this.localAvatarId && (c.state === 'idle' || c.state === 'seated')
    );

    if (candidates.length === 0) return;
    const randomChar = candidates[Math.floor(Math.random() * candidates.length)];

    // If seated in meeting, perform subtle emote-yes nod or interact
    if (randomChar.state === 'seated' && randomChar.anchor.activity === 'meeting') {
      const emoteClip = randomChar.actions['emote-yes'];
      if (emoteClip) {
        emoteClip.reset();
        emoteClip.setLoop(THREE.LoopOnce, 1);
        emoteClip.clampWhenFinished = true;
        emoteClip.play();
      }
    } else if (randomChar.state === 'idle') {
      const emote = Math.random() > 0.5 ? 'emote-yes' : 'interact-right';
      const action = randomChar.actions[emote];
      if (action) {
        action.reset();
        action.setLoop(THREE.LoopOnce, 1);
        action.play();
      }
    }
  }
}
