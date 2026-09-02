import { useState } from 'react';
import { createPortal } from 'react-dom';
import { User, X, Navigation, MessageSquare,  } from 'lucide-react';
import { type User as UserType } from './store';
import { RewardWidget } from './RewardWidget';
import { ChatPanel } from './ChatPanel';

interface ProfileCardProps {
  user: UserType;
  position: { x: number; y: number };
  onClose: () => void;
}

export const ProfileCard = ({ user, position, onClose }: ProfileCardProps) => {
  const [showReward, setShowReward] = useState(false);
  const [showChat, setShowChat] = useState(false);

  return (
    <>
      <div
        className="absolute bg-[var(--bg-panel)] border border-[var(--border-color)] rounded-2xl shadow-xl w-64 p-4 z-30 transform -translate-x-1/2 -translate-y-[120%]"
        style={position.x === 0 && position.y === 0 ? {} : { left: position.x, top: position.y }}
      >
        <button onClick={onClose} className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
          <X className="w-4 h-4" />
        </button>

        <div className="flex flex-col items-center mb-4">
          <img src={user.avatar} alt={user.name} className="w-16 h-16 rounded-full mb-2 border-2 border-white shadow-sm" />
          <h3 className="font-bold text-lg text-center leading-tight">{user.name}</h3>
          <p className="text-sm text-[var(--text-secondary)]">{user.role || 'Team Member'}</p>
          {user.department && (
            <span className="mt-1 bg-emerald-100 text-emerald-800 text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span> {user.department}
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button className="flex items-center justify-center gap-1.5 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 py-2 rounded-xl text-sm font-medium transition-colors">
            <User className="w-4 h-4" /> Profile
          </button>
          <button
            onClick={() => console.log(`Navigating to ${user.name}`)}
            className="flex items-center justify-center gap-1.5 border border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800 py-2 rounded-xl text-sm font-medium transition-colors"
          >
            <Navigation className="w-4 h-4" /> Go to
          </button>
          <button
            onClick={() => setShowChat(true)}
            className="flex items-center justify-center gap-1.5 border border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800 py-2 rounded-xl text-sm font-medium transition-colors"
          >
            <MessageSquare className="w-4 h-4" /> Chat
          </button>
          <button
            onClick={() => setShowReward(true)}
            className="flex items-center justify-center gap-1.5 border border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800 py-2 rounded-xl text-sm font-medium transition-colors"
          >
            Send 🥐
          </button>
        </div>
      </div>

      {showReward && createPortal(<RewardWidget user={user} onClose={() => setShowReward(false)} />, document.body)}
      {showChat && createPortal(<ChatPanel user={user} onClose={() => setShowChat(false)} />, document.body)}
    </>
  );
};
