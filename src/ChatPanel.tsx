
import { X, Send } from 'lucide-react';
import { type User } from './store';

interface ChatPanelProps {
  user: User;
  onClose: () => void;
}

export const ChatPanel = ({ user, onClose }: ChatPanelProps) => {
  return (
    <div className="absolute bottom-24 right-6 w-80 h-96 bg-[var(--bg-panel)] border border-[var(--border-color)] rounded-xl shadow-2xl flex flex-col z-40 overflow-hidden">
      {/* Header */}
      <div className="p-3 border-b border-[var(--border-color)] flex items-center justify-between bg-gray-50 dark:bg-gray-800">
        <div className="flex items-center gap-2">
          <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full" />
          <div>
            <p className="font-medium text-sm leading-tight">{user.name}</p>
            <p className="text-xs text-green-500">Online</p>
          </div>
        </div>
        <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages Area (Stub) */}
      <div className="flex-1 p-4 bg-gray-50/50 dark:bg-gray-900/50 flex flex-col justify-end">
        <div className="text-center text-xs text-[var(--text-secondary)] mb-4">Chat started</div>
      </div>

      {/* Input Area */}
      <div className="p-3 border-t border-[var(--border-color)]">
        <div className="relative">
          <input
            type="text"
            placeholder={`Message ${user.name.split(' ')[0]}...`}
            className="w-full bg-gray-100 dark:bg-gray-800 border-none rounded-full pl-4 pr-10 py-2 text-sm focus:ring-1 focus:ring-[var(--color-brand-yellow)] focus:outline-none"
          />
          <button className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-[var(--color-brand-yellow)]">
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
