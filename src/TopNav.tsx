import { useState } from 'react';
import { Search, ChevronDown, Moon, Sun,  } from 'lucide-react';
import { useStore } from './store';
import clsx from 'clsx';

export const TopNav = () => {
  const { theme, setTheme, currentUser } = useStore();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('Virtual office');

  const navLinks = [
    { label: 'Overview' },
    { label: 'People' },
    { label: 'Team' },
    { label: 'Rewards' },
    { label: 'Virtual office' },
    { label: 'Knowledge', hasDropdown: true },
    { label: 'Apps', hasDropdown: true },
  ];

  return (
    <div className="h-14 bg-[var(--bg-nav)] text-white flex items-center justify-between px-4 shrink-0 z-50 shadow-md relative">
      {/* Left: Logo & Nav */}
      <div className="flex items-center gap-6 h-full">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[var(--color-brand-yellow)] rounded-full flex items-center justify-center text-black font-bold text-lg">
            I
          </div>
          <span className="font-semibold text-lg tracking-wide">IsoOffice</span>
          <span className="bg-white/10 text-xs px-2 py-0.5 rounded-full text-gray-300 ml-1">Beta</span>
        </div>

        {/* Nav Links */}
        <nav className="flex items-center gap-1 h-full ml-4">
          {navLinks.map((link) => (
            <button
              key={link.label}
              onClick={() => setActiveTab(link.label)}
              className={clsx(
                "px-3 h-full flex items-center text-sm font-medium transition-colors hover:text-white",
                activeTab === link.label ? "text-white border-b-2 border-[var(--color-brand-yellow)]" : "text-gray-400"
              )}
            >
              {link.label}
              {link.hasDropdown && <ChevronDown className="w-3 h-3 ml-1 opacity-70" />}
            </button>
          ))}
        </nav>
      </div>

      {/* Right: Search, Help, User */}
      <div className="flex items-center gap-4">
        <button className="text-gray-400 hover:text-white transition-colors">
          <Search className="w-5 h-5" />
        </button>

        <button className="flex items-center gap-1 text-gray-400 hover:text-white transition-colors text-sm">
          Help <ChevronDown className="w-3 h-3" />
        </button>

        {/* User Dropdown */}
        <div className="relative">
          <button
            className="w-8 h-8 rounded-full overflow-hidden border border-white/20 focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-yellow)]"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <img src={currentUser.avatar} alt="User avatar" className="w-full h-full object-cover" />
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-[var(--bg-panel)] text-[var(--text-primary)] rounded-lg shadow-xl border border-[var(--border-color)] overflow-hidden z-50">
              <div className="px-4 py-3 border-b border-[var(--border-color)]">
                <p className="text-sm font-medium">{currentUser.name}</p>
                <p className="text-xs text-[var(--text-secondary)]">{currentUser.location}</p>
              </div>
              <div className="p-2">
                <p className="px-2 py-1 text-xs font-semibold text-[var(--text-secondary)] uppercase">Theme</p>
                <button
                  onClick={() => { setTheme('light'); setIsDropdownOpen(false); }}
                  className={clsx("w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors", theme === 'light' ? "bg-gray-100 dark:bg-gray-800" : "hover:bg-gray-50 dark:hover:bg-gray-800/50")}
                >
                  <Sun className="w-4 h-4" /> Light
                </button>
                <button
                  onClick={() => { setTheme('dark'); setIsDropdownOpen(false); }}
                  className={clsx("w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors mt-1", theme === 'dark' ? "bg-gray-100 dark:bg-gray-800" : "hover:bg-gray-50 dark:hover:bg-gray-800/50")}
                >
                  <Moon className="w-4 h-4" /> Dark
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
