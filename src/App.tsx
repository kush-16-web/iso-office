import { useEffect } from 'react';
import { TopNav } from './TopNav';
import { Sidebar } from './Sidebar';
import { BottomBar } from './BottomBar';
import { VideoTiles } from './VideoTiles';
import { IsoCanvas } from './IsoCanvas';
import { Minimap } from './Minimap';
import { useStore } from './store';
import clsx from 'clsx';

function App() {
  const { theme } = useStore();

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <div className={clsx("flex flex-col h-screen w-screen overflow-hidden text-sm", theme)}>
      <TopNav />
      <div className="flex flex-1 relative overflow-hidden">
        <Sidebar />
        <div className="flex-1 relative bg-[var(--bg-main)]">
           <IsoCanvas />
           <VideoTiles />
           <BottomBar />
           <Minimap />
        </div>
      </div>
    </div>
  );
}

export default App;
