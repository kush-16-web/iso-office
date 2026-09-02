import { create } from 'zustand';

export type UserStatus = 'online' | 'in-call' | 'offline';
export type Theme = 'light' | 'dark';

export interface User {
  id: string;
  name: string;
  avatar: string;
  status: UserStatus;
  location: string;
  role?: string;
  department?: string;
  isNearby: boolean;
}

interface AppState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  currentUser: User;
  coworkers: User[];
  activeRoom: string;
  isMuted: boolean;
  toggleMute: () => void;
  isCameraOn: boolean;
  toggleCamera: () => void;
  isScreenSharing: boolean;
  toggleScreenShare: () => void;
  isFullscreen: boolean;
  toggleFullscreen: () => void;
  rewardBalance: number;
  sendReward: (amount: number) => void;
}

const mockCoworkers: User[] = [
  { id: '1', name: 'Gregoria Comacho', avatar: 'https://i.pravatar.cc/150?u=1', status: 'online', location: 'Central Open Space', role: 'Data Analyst', department: 'Tech', isNearby: true },
  { id: '2', name: 'Christeen Violette', avatar: 'https://i.pravatar.cc/150?u=2', status: 'in-call', location: 'Central Open Space', isNearby: true },
  { id: '3', name: 'Deane Chadburn', avatar: 'https://i.pravatar.cc/150?u=3', status: 'online', location: 'Central Open Space', isNearby: false },
  { id: '4', name: 'Elisa Lona', avatar: 'https://i.pravatar.cc/150?u=4', status: 'offline', location: 'Meeting room #1', isNearby: false },
  { id: '5', name: 'Wilbert Prewitt', avatar: 'https://i.pravatar.cc/150?u=5', status: 'in-call', location: 'Meeting room #1', isNearby: false },
  { id: '6', name: 'Keely Jansen', avatar: 'https://i.pravatar.cc/150?u=6', status: 'online', location: 'Central Open Space', isNearby: true },
];

export const useStore = create<AppState>((set) => ({
  theme: 'light',
  setTheme: (theme) => set({ theme }),
  currentUser: {
    id: 'me',
    name: 'Renay Montero',
    avatar: 'https://i.pravatar.cc/150?u=me',
    status: 'online',
    location: 'Public space',
    isNearby: true,
  },
  coworkers: mockCoworkers,
  activeRoom: 'Public space',
  isMuted: true,
  toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),
  isCameraOn: false,
  toggleCamera: () => set((state) => ({ isCameraOn: !state.isCameraOn })),
  isScreenSharing: false,
  toggleScreenShare: () => set((state) => ({ isScreenSharing: !state.isScreenSharing })),
  isFullscreen: false,
  toggleFullscreen: () => set((state) => ({ isFullscreen: !state.isFullscreen })),
  rewardBalance: 400,
  sendReward: (amount) => set((state) => ({ rewardBalance: state.rewardBalance - amount })),
}));
