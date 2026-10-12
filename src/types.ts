export type Presence = 'online' | 'in-call' | 'away' | 'offline';
export type OfficeRole = 'owner' | 'admin' | 'member' | 'guest';
export interface User {
  id: string; name: string; status: Presence; role: string; department: string; location: string;
  portrait: { skin: string; hair: string; shirt: string; background: string; longHair?: boolean; beard?: boolean };
  avatarUrl?: string;
}
export interface Office { id: string; name: string; role: OfficeRole; membershipPolicy: 'approval' | 'invite-only'; assignedChannelIds: string[] }
export interface Channel { id: string; name: string; unread: number; memberIds: string[]; description: string }
export interface Attachment { id: string; name: string; size: number; mime: string; url: string; preview?: string }
export interface Message {
  id: string; authorId: string; text: string; time: string; attachments?: Attachment[];
  reactions?: Record<string, { count: number; mine: boolean }>;
}
export type WindowKind = 'channel' | 'dm' | 'file' | 'directory' | 'settings' | 'profile';
export interface Rect { x: number; y: number; width: number; height: number }
export interface Bounds { width: number; height: number }
export interface OfficeWindow {
  id: string; kind: WindowKind; targetId: string; title: string; rect: Rect;
  mode: 'floating' | 'maximized' | 'minimized'; restoreMode: 'floating' | 'maximized'; z: number;
}
export interface Point { x: number; z: number }
export interface CallSession { name: string; participantIds: string[]; kind: 'audio' | 'video'; startedAt: number }
