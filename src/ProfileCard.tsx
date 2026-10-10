import { useState } from 'react';
import { ChevronDown, Gift, MessageSquare, Navigation, Phone, UserRound, X } from 'lucide-react';
import { useStore } from './store';
import { userById } from './data';
import { WORLD_POSITIONS } from './world';
import { Avatar } from './components/Avatar';
import { IconButton } from './components/IconButton';
export function ProfileCard() {
  const selection = useStore(s => s.selectedProfile), bounds = useStore(s => s.bounds);
  const [more, setMore] = useState(false);
  if (!selection) return null;
  const user = userById(selection.userId);
  return <section className="profile-card" aria-label={`${user.name} profile card`} style={{ left: Math.max(12, Math.min(selection.x, bounds.width - 288)), top: Math.max(12, Math.min(selection.y, bounds.height - 300)) }}>
    <IconButton className="profile-close" label="Close profile card" onClick={() => useStore.getState().selectProfile(null)}><X size={13}/></IconButton>
    <div className="profile-summary"><div><h2>{user.name}</h2><p>{user.role}</p><span className="department-label">↗ {user.department}</span></div><Avatar user={user} size={58}/></div>
    <div className="profile-primary-actions"><button className="primary-button" onClick={() => useStore.getState().openWindow('profile', user.id, user.name)}><UserRound size={16}/>Profile</button><button className="secondary-button" onClick={() => { useStore.getState().focusWorld(WORLD_POSITIONS[user.id]); useStore.getState().notify(`Camera centered on ${user.name}. Avatar walking isn’t available yet.`); }}><Navigation size={16}/>Go to</button></div>
    <div className="profile-secondary-actions"><button className="secondary-button" onClick={() => useStore.getState().openWindow('dm', user.id)}><MessageSquare size={14}/>Chat</button><button className="secondary-button" onClick={() => useStore.getState().joinCall(user.name, [user.id], 'audio')}><Phone size={15}/>Call</button><button className="secondary-button" aria-expanded={more} onClick={() => setMore(!more)}>More<ChevronDown size={13}/></button></div>
    {more && <div className="profile-more"><button onClick={() => { useStore.getState().showReward(user.id); setMore(false); }}><Gift size={15}/>Give a demo reward</button><button onClick={() => { useStore.getState().openWindow('directory', 'members', 'Office members'); setMore(false); }}><UserRound size={15}/>Office directory</button></div>}
  </section>;
}
