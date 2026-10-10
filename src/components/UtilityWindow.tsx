import { useEffect, useState } from 'react';
import { Building2, Check, Download, File, LockKeyhole, MessageSquare, Phone, Search, ShieldCheck, Users, Video } from 'lucide-react';
import { useStore } from '../store';
import { coworkers, currentUser, userById } from '../data';
import type { OfficeWindow } from '../types';
import { Avatar } from './Avatar';
import { WindowFrame } from './WindowFrame';
import { IconButton } from './IconButton';
import { fileSize } from '../ChatPanel';

export function UtilityWindow({ window: win }: { window: OfficeWindow }) {
  const messages = useStore(s => s.messages);
  const file = Object.values(messages).flat().flatMap(message => message.attachments ?? []).find(attachment => attachment.id === win.targetId);
  const office = useStore(s => s.office), channel = useStore(s => s.channels.find(c => c.id === win.targetId));
  const rewardHistory = useStore(s => s.rewardHistory);
  const [query, setQuery] = useState(''), [textPreview, setTextPreview] = useState('');
  useEffect(() => {
    if (win.kind !== 'file' || !file || !file.mime.startsWith('text/') || file.size > 1024 * 1024) return;
    const controller = new AbortController();
    fetch(file.url, { signal: controller.signal }).then(response => { if (!response.ok) throw new Error('Unavailable'); return response.text(); }).then(setTextPreview).catch(error => { if (error.name !== 'AbortError') setTextPreview('This file is no longer available.'); });
    return () => controller.abort();
  }, [win.kind, file]);
  const person = userById(win.targetId);
  return <WindowFrame window={win} leading={<span className="channel-symbol">{win.kind === 'settings' ? <Building2 size={23}/> : win.kind === 'directory' ? <Users size={23}/> : win.kind === 'file' ? <File size={23}/> : <Avatar user={person}/>}</span>}>
    <div className="utility-content">
      {win.kind === 'file' && (file ? <>
        <p className="tab-caption">{fileSize(file.size)} · local file preview</p>
        {file.preview ? <img className="file-preview-image" src={file.preview} alt={file.name}/> : file.mime.startsWith('text/') && file.size <= 1024 * 1024 ? <pre className="text-preview">{textPreview || 'Loading preview…'}</pre> : <div className="empty-state"><File size={42}/><p>Preview isn’t available for this file type.</p></div>}
        <a className="primary-button download-button" href={file.url} download={file.name}><Download size={17}/>Download a copy</a>
      </> : <p>This file is no longer available.</p>)}
      {win.kind === 'directory' && <>
        {win.targetId === 'rooms' ? <><p className="tab-caption">Voice rooms · demo connections only</p>{['General', 'Team Standup', 'Design Review'].map(name => <div key={name} className="room-card"><span><strong>{name}</strong><small>Private office room</small></span><button className="primary-button" onClick={() => useStore.getState().joinCall(name, ['gregoria', 'elisa'], 'audio')}>Join demo</button></div>)}</> : <>
          <label className="people-search"><Search size={16}/><input placeholder="Search people…" aria-label="Search office members" value={query} onChange={event => setQuery(event.target.value)}/></label>
          {coworkers.filter(user => user.name.toLowerCase().includes(query.toLowerCase())).map(user => <div className="member-row" key={user.id}><Avatar user={user} size={40}/><button onClick={() => useStore.getState().openWindow('profile', user.id, user.name)}><strong>{user.name}</strong><small>{user.role}</small></button><IconButton label={`Message ${user.name}`} onClick={() => useStore.getState().openWindow('dm', user.id)}><MessageSquare size={17}/></IconButton></div>)}
          {!coworkers.some(user => user.name.toLowerCase().includes(query.toLowerCase())) && <p>No people match your search.</p>}
        </>}
      </>}
      {win.kind === 'profile' && <div className="full-profile"><Avatar user={person} size={90}/><h3>{person.name}</h3><p>{person.role}</p><span className="department-label">{person.department}</span><dl><div><dt>Presence</dt><dd>{person.status.replace('-', ' ')}</dd></div><div><dt>Location</dt><dd>{person.location}</dd></div><div><dt>Office</dt><dd>{office.name}</dd></div></dl><div className="button-row"><button className="primary-button" onClick={() => useStore.getState().openWindow('dm', person.id)}><MessageSquare size={16}/>Chat</button><button className="secondary-button" onClick={() => useStore.getState().joinCall(person.name, [person.id], 'video')}><Video size={16}/>Demo call</button></div></div>}
      {win.kind === 'settings' && <>
        <div className="settings-intro"><span className="office-monogram">io</span><div><h3>{channel ? `# ${channel.name}` : office.name}</h3><p>{channel?.description ?? 'A private place to work, together.'}</p></div></div>
        <div className="settings-row"><span><LockKeyhole size={17}/>Private office</span><span className="status-pill">Invite & approval</span></div>
        <div className="settings-row"><span><ShieldCheck size={17}/>Your role</span><strong>Owner · demo</strong></div>
        <div className="settings-note"><h4>Office membership</h4><p>New offices use approval requests by default. Guests will see only their assigned channels, meetings, and resources.</p><p>Office creation, sign-in, invitations, and enforced permissions aren’t available in this local demo.</p></div>
        <div className="settings-note"><h4>Make yourself at home</h4><p>Drag a window by its header. Double-click to expand. Minimize conversations to the bottom tray. Use arrow keys on a focused header or resize handle.</p><button className="secondary-button" onClick={() => useStore.getState().resetLayout()}>Restore reference layout</button></div>
        <div className="settings-note"><h4>Local demo</h4><p>Messages, files, reactions, and rewards stay on this page and reset when you reload. Call controls are previews; no camera, microphone, or screen is captured.</p><button className="secondary-button" onClick={() => useStore.getState().setIncomingCall('gregoria')}><Phone size={15}/>Preview incoming call</button></div>
        {rewardHistory.length > 0 && <div className="settings-note"><h4>Demo reward history</h4>{rewardHistory.map((reward, i) => <p key={i}><Check size={13}/> {reward.amount} coins → {userById(reward.recipient).name}</p>)}</div>}
        <small className="muted">Signed in as {currentUser.name} in this sample office.</small>
      </>}
    </div>
  </WindowFrame>;
}
