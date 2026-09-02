import { useState } from 'react';
import { Settings, ChevronsLeft, Globe, MapPin, Search, MessageSquare } from 'lucide-react';
import { useStore, type User } from './store';
import clsx from 'clsx';

export const Sidebar = () => {
  const { currentUser, coworkers } = useStore();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCoworkers = coworkers.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const StatusDot = ({ status }: { status: User['status'] }) => {
    const colors = {
      'online': 'bg-green-500',
      'in-call': 'bg-blue-500',
      'offline': 'bg-gray-400'
    };
    return (
      <div className={clsx("w-3 h-3 rounded-full border-2 border-white absolute bottom-0 right-0", colors[status])} />
    );
  };

  return (
    <div className="w-64 h-full bg-[var(--bg-panel)] border-r border-[var(--border-color)] flex flex-col shrink-0 z-10">
      {/* Current User Card */}
      <div className="p-4 flex items-center justify-between border-b border-[var(--border-color)]">
        <div className="flex items-center gap-3">
          <img src={currentUser.avatar} alt="You" className="w-10 h-10 rounded-full" />
          <span className="font-medium">{currentUser.name}</span>
        </div>
        <div className="flex gap-1 text-[var(--text-secondary)]">
          <button className="p-1 hover:text-[var(--text-primary)] transition-colors"><Settings className="w-4 h-4" /></button>
          <button className="p-1 hover:text-[var(--text-primary)] transition-colors"><ChevronsLeft className="w-4 h-4" /></button>
        </div>
      </div>

      {/* Public Chats */}
      <div className="p-4 border-b border-[var(--border-color)]">
        <h3 className="text-xs font-semibold text-[var(--text-secondary)] mb-3 uppercase tracking-wider">Public Chats</h3>

        <div className="space-y-3">
          <div className="flex items-center justify-between group cursor-pointer">
            <div className="flex items-center gap-3 text-[var(--text-primary)] font-medium">
              <Globe className="w-4 h-4 text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]" />
              Everyone
            </div>
          </div>

          <div className="flex items-center justify-between group cursor-pointer">
            <div className="flex items-center gap-3 text-[var(--text-primary)] font-medium">
              <MapPin className="w-4 h-4 text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]" />
              Nearby
            </div>
            <div className="flex -space-x-2">
              {coworkers.filter(c => c.isNearby).slice(0,3).map(c => (
                <img key={c.id} src={c.avatar} alt={c.name} className="w-6 h-6 rounded-full border-2 border-white" />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Online Coworkers */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="p-4 pb-2">
          <div className="flex items-center gap-2 mb-3">
            <h3 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Online Coworkers</h3>
            <span className="bg-gray-100 dark:bg-gray-800 text-[var(--text-secondary)] text-xs px-2 py-0.5 rounded-full">{coworkers.length}</span>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-50 dark:bg-gray-900 border border-[var(--border-color)] rounded-full pl-9 pr-4 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-brand-yellow)]"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 pt-2 space-y-4">
          {filteredCoworkers.map((user) => (
            <div key={user.id} className="flex items-center justify-between group">
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative shrink-0">
                  <img src={user.avatar} alt={user.name} className="w-9 h-9 rounded-full" />
                  <StatusDot status={user.status} />
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-[var(--text-primary)] truncate leading-tight">{user.name}</p>
                  <p className="text-xs text-[var(--text-secondary)] truncate leading-tight">{user.location}</p>
                </div>
              </div>
              <button className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-gray-100 dark:hover:bg-gray-800 p-1.5 rounded-md transition-colors opacity-0 group-hover:opacity-100">
                <MessageSquare className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
