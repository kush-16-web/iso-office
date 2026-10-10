import { useEffect, useState } from 'react';
import { Maximize, Mic, MicOff, Minimize, MonitorUp, PhoneOff, Video, VideoOff } from 'lucide-react';
import { useStore, nearbyCount } from './store';
export function BottomBar() {
  const call = useStore(s => s.call), muted = useStore(s => s.isMuted), camera = useStore(s => s.isCameraOn), sharing = useStore(s => s.isScreenSharing);
  const [fullscreen, setFullscreen] = useState(Boolean(document.fullscreenElement));
  useEffect(() => { const update = () => setFullscreen(Boolean(document.fullscreenElement)); document.addEventListener('fullscreenchange', update); return () => document.removeEventListener('fullscreenchange', update); }, []);
  const toggleFullscreen = async () => { try { if (document.fullscreenElement) await document.exitFullscreen(); else if (document.documentElement.requestFullscreen) await document.documentElement.requestFullscreen(); else useStore.getState().notify('Fullscreen isn’t available in this browser.'); } catch { useStore.getState().notify('Your browser couldn’t enter fullscreen.'); } };
  const controls = [
    { label: muted ? 'Unmute' : 'Mute', description: 'demo microphone', icon: muted ? MicOff : Mic, active: !muted, action: () => useStore.getState().toggleMedia('mic'), disabled: !call },
    { label: camera ? 'Stop preview' : 'Start camera', description: 'demo camera', icon: camera ? Video : VideoOff, active: camera, action: () => useStore.getState().toggleMedia('camera'), disabled: !call },
    { label: sharing ? 'Stop preview' : 'Share screen', description: 'demo screen sharing', icon: MonitorUp, active: sharing, action: () => useStore.getState().toggleMedia('screen'), disabled: !call },
    { label: fullscreen ? 'Exit fullscreen' : 'Enter fullscreen', description: '', icon: fullscreen ? Minimize : Maximize, active: fullscreen, action: toggleFullscreen, disabled: false },
  ];
  return <div className="bottom-bar" aria-label="Office controls"><div className="space-info"><strong>{call?.name ?? 'Public space'}</strong><span>{nearbyCount()} people around you</span></div><div className="bottom-controls">{controls.map(({ label, description, icon: Icon, active, action, disabled }) => <button key={description || 'fullscreen'} className={`control-button ${active ? 'is-active' : ''}`} title={`${label} ${description}`.trim()} aria-label={`${label} ${description}`.trim()} aria-pressed={active} disabled={disabled} onClick={action}><span><Icon size={20}/></span><small>{label}</small></button>)}{call && <button className="leave-call" title="Leave demo call" aria-label="Leave demo call" onClick={() => useStore.getState().leaveCall()}><PhoneOff size={17}/></button>}</div></div>;
}
