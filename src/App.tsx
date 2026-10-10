import { lazy, Suspense, useEffect, useRef } from 'react';
import { Menu, Users, X } from 'lucide-react';
import { Sidebar } from './Sidebar';
const IsoCanvas = lazy(() => import('./IsoCanvas').then(module => ({ default: module.IsoCanvas })));
import { BottomBar } from './BottomBar';
import { VideoTiles } from './VideoTiles';
import { Minimap } from './Minimap';
import { ProfileCard } from './ProfileCard';
import { RewardWidget } from './RewardWidget';
import { ChatPanel } from './ChatPanel';
import { UtilityWindow } from './components/UtilityWindow';
import { WindowDock } from './components/WindowFrame';
import { IconButton } from './components/IconButton';
import { useStore } from './store';
import './App.css';
function Windows() {
  const windows = useStore(s => s.windows);
  return <div className="windows-layer">{windows.map(win => win.kind === 'channel' || win.kind === 'dm' ? <ChatPanel key={win.id} window={win}/> : <UtilityWindow key={win.id} window={win}/>)}</div>;
}
function Notice() {
  const notice = useStore(s => s.notice);
  useEffect(() => { if (!notice) return; const timer = window.setTimeout(() => useStore.getState().clearNotice(), 5500); return () => window.clearTimeout(timer); }, [notice]);
  return notice ? <div className="toast" role="status"><span>{notice.text}</span><IconButton label="Dismiss notification" onClick={() => useStore.getState().clearNotice()}><X size={15}/></IconButton></div> : null;
}
function App() {
  const stage = useRef<HTMLElement>(null);
  const hasWindows = useStore(s => s.windows.some(win => win.mode !== 'minimized'));
  const sceneState = useStore(s => s.sceneState);
  useEffect(() => {
    if (!stage.current) return;
    const observer = new ResizeObserver(entries => { const { width, height } = entries[0].contentRect; if (width && height) useStore.getState().setBounds({ width, height }); });
    observer.observe(stage.current); return () => observer.disconnect();
  }, []);
  return <div className={`office-app ${hasWindows ? 'has-conversation' : ''}`}>
    <a href="#office-world" className="skip-link">Skip to office</a>
    <Sidebar/>
    <main ref={stage} id="office-world" className="office-stage" tabIndex={-1} aria-label="Interactive IsoOffice">
      <Suspense fallback={<span className="scene-loading">Opening your office…</span>}><IsoCanvas/></Suspense>
      {sceneState === 'unavailable' && <div className="scene-fallback"><h1>Your office is ready.</h1><p>The 3D view needs WebGL. You can still use all the demo conversations and controls.</p></div>}
      <IconButton className="sidebar-toggle" label="Open office sidebar" onClick={() => useStore.getState().setSidebarOpen(true)}><Menu size={21}/></IconButton>
      <VideoTiles/>
      <RewardWidget/>
      <ProfileCard/>
      <Windows/>
      <Minimap/>
      <button className="world-directory" onClick={() => useStore.getState().openWindow('directory', 'members', 'Office members')}><Users size={15}/><span>People</span></button>
      <WindowDock/>
      <BottomBar/>
      <Notice/>
    </main>
  </div>;
}
export default App;
