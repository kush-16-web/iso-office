import { create } from 'zustand';
import { currentUser, coworkers, initialChannels, initialMessages, userById } from './data';
import { clampRect, defaultRect, MOBILE_WIDTH } from './lib/windows';
import { clampWorldPoint, WORLD_POSITIONS } from './world';
import type { Attachment, Bounds, CallSession, Channel, Message, Office, OfficeWindow, Point, Rect, WindowKind } from './types';
export type { User } from './types';

interface ProfileSelection { userId: string; x: number; y: number; anchored: boolean }
interface State {
  currentUser: typeof currentUser; coworkers: typeof coworkers;
  office: Office; channels: Channel[];
  sidebarOpen: boolean; setSidebarOpen: (open: boolean) => void;
  windows: OfficeWindow[]; nextZ: number; bounds: Bounds; initialized: boolean;
  setBounds: (bounds: Bounds) => void;
  openWindow: (kind: WindowKind, targetId: string, title?: string) => void;
  closeWindow: (id: string) => void; focusWindow: (id: string) => void;
  minimizeWindow: (id: string) => void; restoreWindow: (id: string) => void;
  maximizeWindow: (id: string) => void; setWindowRect: (id: string, rect: Rect) => void;
  resetLayout: () => void;
  messages: Record<string, Message[]>; drafts: Record<string, string>;
  setDraft: (key: string, text: string) => void;
  sendMessage: (key: string, attachments?: Attachment[]) => boolean;
  react: (key: string, messageId: string, emoji: string) => void;
  selectedProfile: ProfileSelection | null;
  selectProfile: (userId: string | null, point?: { x: number; y: number }) => void;
  moveProfile: (point: { x: number; y: number }) => void;
  call: CallSession | null; callHistory: { name: string; time: string; action: string }[];
  joinCall: (name: string, participantIds: string[], kind?: 'audio' | 'video') => void;
  leaveCall: () => void; incomingCall: string | null; setIncomingCall: (id: string | null) => void;
  isMuted: boolean; isCameraOn: boolean; isScreenSharing: boolean;
  toggleMedia: (kind: 'mic' | 'camera' | 'screen') => void;
  rewardBalance: number; rewardOpen: boolean; rewardRecipient: string;
  rewardHistory: { recipient: string; amount: number }[];
  showReward: (recipient?: string) => void; hideReward: () => void;
  sendReward: (recipient: string, amount: number) => boolean;
  camera: { target: Point; zoom: number; revision: number }; cameraFootprint: Point[];
  cameraMode: 'overview' | 'follow' | 'focus';
  setCameraMode: (mode: 'overview' | 'follow' | 'focus') => void;
  navigation: { isNavigating: boolean; targetUserId: string | null; targetName: string | null };
  startNavigation: (targetUserId: string) => void;
  cancelNavigation: () => void;
  skipNavigation: () => void;
  completeNavigation: () => void;
  focusWorld: (point: Point, zoom?: number) => void; setCameraFootprint: (points: Point[]) => void;
  sceneState: 'loading' | 'ready' | 'unavailable'; setSceneState: (state: State['sceneState']) => void;
  toasts: Array<{ id: number; text: string; title?: string; kind?: 'info' | 'success' | 'warn' | 'error' }>;
  notice: { id: number; text: string; title?: string; kind?: 'info' | 'success' | 'warn' | 'error' } | null;
  notify: (text: string, title?: string, kind?: 'info' | 'success' | 'warn' | 'error') => void;
  clearNotice: (id?: number) => void;
  dismissToast: (id: number) => void;
  createChannel: (name: string) => string | null;
}
export type ToastNotice = State['toasts'][number];
let toastSeq = 0;
const clock = () => new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
const makeWindow = (kind: WindowKind, targetId: string, title: string, bounds: Bounds, z: number): OfficeWindow => ({ id: `${kind}:${targetId}`, kind, targetId, title, rect: defaultRect(kind, bounds), mode: 'floating', restoreMode: 'floating', z });
const initialWindows = (bounds: Bounds) => [makeWindow('dm', 'elisa', 'Elisa Lona', bounds, 10), makeWindow('channel', 'development', 'Development', bounds, 11)];

export const useStore = create<State>((set, get) => ({
  currentUser, coworkers,
  office: { id: 'isooffice-demo', name: 'IsoOffice', role: 'owner', membershipPolicy: 'approval', assignedChannelIds: initialChannels.map(channel => channel.id) },
  channels: initialChannels, sidebarOpen: false,
  setSidebarOpen: sidebarOpen => set({ sidebarOpen }),
  bounds: { width: 1182, height: 1024 }, initialized: false,
  windows: initialWindows({ width: 1182, height: 1024 }), nextZ: 12,
  setBounds: bounds => set(state => ({ bounds, initialized: true, windows: !state.initialized ? initialWindows(bounds) : state.windows.map(win => ({ ...win, rect: bounds.width < MOBILE_WIDTH ? win.rect : clampRect(win.rect, bounds) })) })),
  openWindow: (kind, targetId, title) => set(state => {
    const id = `${kind}:${targetId}`;
    const existing = state.windows.find(win => win.id === id);
    const name = title ?? (kind === 'channel' ? state.channels.find(channel => channel.id === targetId)?.name : userById(targetId).name) ?? targetId;
    const window = makeWindow(kind, targetId, name, state.bounds, state.nextZ);
    if (kind === 'dm' && targetId !== 'elisa') window.rect = defaultRect(kind, state.bounds, state.windows.filter(win => win.kind === 'dm').length);
    return {
      windows: existing ? state.windows.map(win => win.id === id ? { ...win, mode: win.mode === 'minimized' ? win.restoreMode : win.mode, z: state.nextZ } : win) : [...state.windows, window],
      channels: kind === 'channel' ? state.channels.map(channel => channel.id === targetId ? { ...channel, unread: 0 } : channel) : state.channels,
      nextZ: state.nextZ + 1, sidebarOpen: false,
    };
  }),
  closeWindow: id => set(state => ({ windows: state.windows.filter(win => win.id !== id) })),
  focusWindow: id => set(state => state.windows.find(win => win.id === id)?.z === state.nextZ - 1 ? {} : ({ windows: state.windows.map(win => win.id === id ? { ...win, z: state.nextZ } : win), nextZ: state.nextZ + 1 })),
  minimizeWindow: id => set(state => ({ windows: state.windows.map(win => win.id === id ? { ...win, restoreMode: win.mode === 'maximized' ? 'maximized' : 'floating', mode: 'minimized' } : win) })),
  restoreWindow: id => set(state => ({ windows: state.windows.map(win => win.id === id ? { ...win, mode: win.restoreMode, z: state.nextZ } : win), nextZ: state.nextZ + 1 })),
  maximizeWindow: id => set(state => ({ windows: state.windows.map(win => win.id === id ? { ...win, mode: win.mode === 'maximized' ? 'floating' : 'maximized', z: state.nextZ } : win), nextZ: state.nextZ + 1 })),
  setWindowRect: (id, rect) => set(state => ({ windows: state.windows.map(win => win.id === id ? { ...win, rect: clampRect(rect, state.bounds) } : win) })),
  resetLayout: () => set(state => ({ windows: initialWindows(state.bounds), nextZ: 12, selectedProfile: { userId: 'gregoria', x: 62, y: 210, anchored: false }, rewardOpen: true })),
  messages: initialMessages, drafts: {},
  setDraft: (key, text) => set(state => ({ drafts: { ...state.drafts, [key]: text.slice(0, 4000) } })),
  sendMessage: (key, attachments = []) => {
    const state = get();
    const text = (state.drafts[key] ?? '').trim();
    if (!text && !attachments.length) return false;
    // All data remains in memory; this is not a delivery or persistence service.
    if (!key.startsWith('channel:') && !key.startsWith('dm:')) return false;
    set({ messages: { ...state.messages, [key]: [...(state.messages[key] ?? []), { id: crypto.randomUUID(), authorId: 'me', text, time: clock(), attachments }] }, drafts: { ...state.drafts, [key]: '' } });
    return true;
  },
  react: (key, messageId, emoji) => set(state => ({ messages: { ...state.messages, [key]: (state.messages[key] ?? []).map(message => {
    if (message.id !== messageId) return message;
    const reaction = message.reactions?.[emoji] ?? { count: 0, mine: false };
    return { ...message, reactions: { ...message.reactions, [emoji]: { count: reaction.count + (reaction.mine ? -1 : 1), mine: !reaction.mine } } };
  }) } })),
  selectedProfile: { userId: 'gregoria', x: 62, y: 210, anchored: false },
  selectProfile: (userId, point) => {
    if (userId && get().bounds.width < MOBILE_WIDTH) { get().openWindow('profile', userId, userById(userId).name); set({ selectedProfile: null }); return; }
    set({ selectedProfile: userId ? { userId, x: point?.x ?? 62, y: point?.y ?? 210, anchored: Boolean(point) } : null });
  },
  moveProfile: point => set(state => ({ selectedProfile: state.selectedProfile ? { ...state.selectedProfile, ...point } : null })),
  call: { name: 'Public space', participantIds: ['me', 'gregoria', 'keely', 'arturo', 'elisa'], kind: 'video', startedAt: Date.now() },
  callHistory: [],
  joinCall: (name, participantIds, kind = 'video') => set(state => ({ call: { name, participantIds: [...new Set(['me', ...participantIds])], kind, startedAt: Date.now() }, callHistory: [...state.callHistory, { name, time: clock(), action: 'Joined demo call' }], isMuted: true, isCameraOn: false, isScreenSharing: false, incomingCall: null, notice: { id: Date.now(), text: 'Demo call opened. No microphone, camera, or network connection is active.' } })),
  leaveCall: () => set(state => ({ call: null, isMuted: true, isCameraOn: false, isScreenSharing: false, callHistory: [...state.callHistory, { name: state.call?.name ?? 'Call', time: clock(), action: 'Left demo call' }], notice: { id: Date.now(), text: 'You left the demo call.' } })),
  incomingCall: null, setIncomingCall: incomingCall => set({ incomingCall }),
  isMuted: true, isCameraOn: false, isScreenSharing: false,
  toggleMedia: kind => set(state => !state.call ? {} : ({ ...(kind === 'mic' ? { isMuted: !state.isMuted } : kind === 'camera' ? { isCameraOn: !state.isCameraOn } : { isScreenSharing: !state.isScreenSharing }), notice: { id: Date.now(), text: 'Preview only. No microphone, camera, or screen is being captured.' } })),
  rewardBalance: 400, rewardOpen: true, rewardRecipient: 'gregoria', rewardHistory: [],
  showReward: recipient => set(state => ({ rewardOpen: true, rewardRecipient: recipient ?? state.rewardRecipient })), hideReward: () => set({ rewardOpen: false }),
  sendReward: (recipient, amount) => {
    const state = get();
    if (!Number.isSafeInteger(amount) || amount <= 0 || amount > state.rewardBalance || !coworkers.some(user => user.id === recipient)) return false;
    set({ rewardBalance: state.rewardBalance - amount, rewardHistory: [...state.rewardHistory, { recipient, amount }], notice: { id: Date.now(), text: `${amount} demo ${amount === 1 ? 'coin' : 'coins'} given to ${userById(recipient).name}.` } });
    return true;
  },
  camera: { target: { x: -3, z: -3 }, zoom: 1, revision: 0 }, cameraFootprint: [],
  cameraMode: 'overview',
  setCameraMode: mode => set({ cameraMode: mode }),
  navigation: { isNavigating: false, targetUserId: null, targetName: null },
  startNavigation: (targetUserId: string) => {
    const targetUser = userById(targetUserId);
    const targetPos = WORLD_POSITIONS[targetUserId];
    if (targetPos) {
      set(state => ({
        cameraMode: 'follow',
        navigation: { isNavigating: true, targetUserId, targetName: targetUser?.name ?? targetUserId },
        camera: { target: clampWorldPoint(targetPos), zoom: 1.15, revision: state.camera.revision + 1 },
      }));
    }
  },
  cancelNavigation: () => set({ cameraMode: 'overview', navigation: { isNavigating: false, targetUserId: null, targetName: null } }),
  skipNavigation: () => set(state => {
    const targetUserId = state.navigation.targetUserId;
    const targetPos = targetUserId ? WORLD_POSITIONS[targetUserId] : null;
    return {
      cameraMode: 'focus',
      navigation: { isNavigating: false, targetUserId: null, targetName: null },
      ...(targetPos ? { camera: { target: clampWorldPoint(targetPos), zoom: 1.25, revision: state.camera.revision + 1 } } : {}),
    };
  }),
  completeNavigation: () => set({ cameraMode: 'focus', navigation: { isNavigating: false, targetUserId: null, targetName: null } }),
  focusWorld: (point, zoom) => set(state => ({ camera: { target: clampWorldPoint(point), zoom: Math.max(0.65, Math.min(2.4, zoom ?? state.camera.zoom)), revision: state.camera.revision + 1 } })),
  setCameraFootprint: cameraFootprint => set({ cameraFootprint }),
  sceneState: 'loading', setSceneState: sceneState => set({ sceneState }),
  toasts: [],
  notice: null,
  notify: (text, title, kind = 'info') => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const now = Date.now();
    set(state => {
      if (state.toasts.some(t => t.text === trimmed && now - Math.floor(t.id / 1000) < 2000)) return {};
      toastSeq = (toastSeq + 1) % 1000;
      const id = now * 1000 + toastSeq;
      const newToast: ToastNotice = { id, text: trimmed, title, kind };
      const updated = [newToast, ...state.toasts].slice(0, 4);
      return { toasts: updated, notice: newToast };
    });
  },
  dismissToast: id => set(state => {
    const updated = state.toasts.filter(t => t.id !== id);
    return { toasts: updated, notice: updated[0] ?? null };
  }),
  clearNotice: (id?: number) => set(state => {
    if (id !== undefined) {
      const updated = state.toasts.filter(t => t.id !== id);
      return { toasts: updated, notice: updated[0] ?? null };
    }
    return { toasts: [], notice: null };
  }),
  createChannel: name => {
    const trimmed = name.trim().replace(/^#+/, '').slice(0, 32);
    const state = get();
    if (!trimmed || state.channels.some(channel => channel.name.toLowerCase() === trimmed.toLowerCase())) return null;
    const id = crypto.randomUUID();
    set({ channels: [...state.channels, { id, name: trimmed, unread: 0, memberIds: ['me'], description: 'A new local demo channel.' }] });
    get().openWindow('channel', id, trimmed);
    return id;
  },
}));
export const nearbyCount = () => coworkers.filter(user => {
  const me = WORLD_POSITIONS.me, other = WORLD_POSITIONS[user.id];
  return user.status !== 'offline' && Math.hypot(me.x - other.x, me.z - other.z) <= 7;
}).length;
