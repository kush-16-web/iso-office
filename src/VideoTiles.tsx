
import { useStore } from './store';
import { MicOff, VideoOff } from 'lucide-react';

export const VideoTiles = () => {
  const { currentUser, coworkers } = useStore();
  const nearbyCoworkers = coworkers.filter(c => c.isNearby);

  const tiles = [currentUser, ...nearbyCoworkers];

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 flex gap-4 z-20">
      {tiles.map((user) => (
        <div
          key={user.id}
          className={`w-56 h-40 rounded-xl overflow-hidden relative shadow-lg ${user.id === 'me' ? 'border-2 border-[var(--color-brand-yellow)] ring-2 ring-[var(--color-brand-yellow)]/30' : 'border border-[var(--border-color)]'}`}
        >
          {/* Mock Video Feed / Avatar fallback */}
          <div className={`w-full h-full flex items-center justify-center ${user.id === 'me' ? 'bg-indigo-900' : 'bg-emerald-900'}`}>
             <img src={user.avatar} alt={user.name} className="w-16 h-16 rounded-full" />
          </div>

          {/* Name overlay */}
          <div className="absolute bottom-2 left-2 right-2">
            <div className="bg-black/50 backdrop-blur-sm text-white text-xs font-medium px-2 py-1 rounded w-max max-w-full truncate">
              {user.name} {user.id === 'me' && '(You)'}
            </div>
          </div>

          {/* Status icons */}
          <div className="absolute top-2 left-2 flex gap-1">
            <div className="bg-black/50 backdrop-blur-sm p-1 rounded">
              <MicOff className="w-3 h-3 text-white" />
            </div>
            <div className="bg-black/50 backdrop-blur-sm p-1 rounded">
              <VideoOff className="w-3 h-3 text-white" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
