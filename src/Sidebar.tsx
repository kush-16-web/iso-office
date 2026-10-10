import { useState } from 'react';
import { Settings, SlidersHorizontal, Hash, Plus, MessageSquare, Volume2, LockKeyhole, ChevronDown, ChevronRight, Check, Gift, PanelLeftClose, Search } from 'lucide-react';
import { useStore } from './store';
import { Avatar } from './components/Avatar';
import { IconButton } from './components/IconButton';

export function Sidebar() {
  const currentUser = useStore(s => s.currentUser), coworkers = useStore(s => s.coworkers);
  const channels = useStore(s => s.channels), office = useStore(s => s.office);
  const open = useStore(s => s.sidebarOpen);
  const activeChannel = useStore(s => s.windows.filter(w => w.kind === 'channel' && w.mode !== 'minimized').sort((a, b) => b.z - a.z)[0]?.targetId);
  const [officeMenu, setOfficeMenu] = useState(false), [channelForm, setChannelForm] = useState(false);
  const [channelName, setChannelName] = useState(''), [error, setError] = useState('');
  const [searchVisible, setSearchVisible] = useState(false), [query, setQuery] = useState('');
  return <>
    {open && <button className="sidebar-scrim" aria-label="Close sidebar" onClick={() => useStore.getState().setSidebarOpen(false)}/>}
    <aside className={`sidebar ${open ? 'is-open' : ''}`} aria-label="Office sidebar">
      <header className="sidebar-profile">
        <button className="identity-button" onClick={() => setOfficeMenu(!officeMenu)} aria-expanded={officeMenu} aria-label="Switch office">
          <Avatar user={currentUser} size={38}/><span><strong>{currentUser.name}</strong><small>@markverona <ChevronDown size={11}/></small></span>
        </button>
        <IconButton label="Office settings" onClick={() => useStore.getState().openWindow('settings', 'office', 'Office settings')}><Settings size={20}/></IconButton>
        <IconButton label="Sidebar controls" onClick={() => setSearchVisible(!searchVisible)}><SlidersHorizontal size={18}/></IconButton>
        <IconButton label="Close office sidebar" className="mobile-sidebar-close" onClick={() => useStore.getState().setSidebarOpen(false)}><PanelLeftClose size={18}/></IconButton>
      </header>
      {officeMenu && <div className="office-menu">
        <span className="eyebrow">YOUR OFFICES</span>
        <button onClick={() => setOfficeMenu(false)}><span className="office-monogram">io</span><span><strong>{office.name}</strong><small>Private office · Owner</small></span><Check size={16}/></button>
        <button onClick={() => { useStore.getState().openWindow('settings', 'office', 'Office settings'); setOfficeMenu(false); }}><Plus size={16}/> Create or join an office</button>
      </div>}
      <div className="sidebar-scroll">
        <section className="sidebar-section">
          <div className="section-label"><h2>Public chats</h2><IconButton label="Create a demo channel" onClick={() => setChannelForm(!channelForm)}><Plus size={15}/></IconButton></div>
          {channelForm && <form className="channel-form" onSubmit={event => { event.preventDefault(); const id = useStore.getState().createChannel(channelName); if (id) { setChannelForm(false); setChannelName(''); setError(''); } else setError('Choose a unique channel name.'); }}>
            <input aria-label="New channel name" autoFocus maxLength={32} placeholder="Channel name" value={channelName} onChange={event => setChannelName(event.target.value)}/><button className="primary-button" type="submit">Create</button>{error && <small role="alert">{error}</small>}
          </form>}
          {channels.map(channel => <button key={channel.id} className={`channel-row ${activeChannel === channel.id ? 'is-active' : ''}`} onClick={() => useStore.getState().openWindow('channel', channel.id)}>
            <Hash size={19}/><span>{channel.name}</span>{channel.unread > 0 && <span className="unread-badge" aria-label={`${channel.unread} unread demo messages`}>{channel.unread}</span>}
          </button>)}
        </section>
        <section className="sidebar-section people-section">
          <div className="section-label"><h2>Direct messages</h2><IconButton label="Find a coworker" onClick={() => { setSearchVisible(!searchVisible); setQuery(''); }}><Plus size={18}/></IconButton></div>
          {searchVisible && <label className="people-search"><Search size={15}/><input aria-label="Search coworkers" placeholder="Find someone…" value={query} onChange={event => setQuery(event.target.value)}/></label>}
          {coworkers.filter(user => query ? user.name.toLowerCase().includes(query.toLowerCase()) : user.id !== 'keely').map(user => <div key={user.id} className="person-row">
            <button className="person-avatar" aria-label={`View ${user.name}'s profile`} onClick={() => { useStore.getState().selectProfile(user.id); useStore.getState().setSidebarOpen(false); }}><Avatar user={user} size={32}/></button>
            <button className="person-name" onClick={() => useStore.getState().openWindow('dm', user.id)}>{user.name}</button>
            <IconButton label={`Message ${user.name}`} onClick={() => useStore.getState().openWindow('dm', user.id)}><MessageSquare size={12}/></IconButton>
          </div>)}
          {query && !coworkers.some(user => user.name.toLowerCase().includes(query.toLowerCase())) && <p className="muted no-results">No coworkers found.</p>}
        </section>
        <section className="sidebar-section voice-section">
          <div className="section-label"><h2>Voice rooms</h2><IconButton label="View voice rooms" onClick={() => useStore.getState().openWindow('directory', 'rooms', 'Voice rooms')}><Plus size={18}/></IconButton></div>
          {[{ name: 'General', count: 3, ids: ['gregoria', 'keely'] }, { name: 'Team Standup', count: 5, ids: ['gregoria', 'elisa', 'arturo', 'wilbert'] }, { name: 'Design Review', count: 0, ids: ['christeen', 'keely'] }].map((room, i) => <button key={room.name} className="voice-row" onClick={() => useStore.getState().joinCall(room.name, room.ids, 'audio')}><span className={i === 0 ? 'voice-icon is-green' : 'voice-icon'}><Volume2 size={20}/></span><span>{room.name}</span>{room.count > 0 && <small>{room.count}<ChevronRight size={12}/></small>}</button>)}
          <button className="voice-row" onClick={() => useStore.getState().notify('This private room is invitation only in the demo.')}><span className="voice-icon"><LockKeyhole size={19}/></span><span>Private Room</span><LockKeyhole size={12}/></button>
        </section>
      </div>
      <footer className="sidebar-footer"><button className="demo-label" onClick={() => useStore.getState().openWindow('settings', 'demo', 'About this demo')}><span/>Local demo <span className="demo-label-detail">· resets on reload</span></button><IconButton label="Open rewards" onClick={() => useStore.getState().showReward()}><Gift size={16}/></IconButton></footer>
    </aside>
  </>;
}
