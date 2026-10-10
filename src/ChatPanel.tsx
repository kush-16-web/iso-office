import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { Download, File, Files, Hash, MessageSquare, Paperclip, Phone, Search, Send, Settings, Smile, Users, Video, X } from 'lucide-react';
import { useStore } from './store';
import { userById } from './data';
import type { Attachment, Message, OfficeWindow } from './types';
import { Avatar } from './components/Avatar';
import { IconButton } from './components/IconButton';
import { WindowFrame } from './components/WindowFrame';

const EMPTY_MESSAGES: Message[] = [];
const tabs = [{ name: 'Messages', icon: MessageSquare }, { name: 'Files', icon: Files }, { name: 'Calls', icon: Phone }, { name: 'Members', icon: Users }] as const;
type Tab = typeof tabs[number]['name'];
export const fileSize = (bytes: number) => bytes < 1024 ? `${bytes} B` : bytes < 1024 * 1024 ? `${(bytes / 1024).toFixed(1)} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`;
export function FileAttachment({ file, thumbnail = false }: { file: Attachment; thumbnail?: boolean }) {
  return <div className={`attachment-card ${thumbnail && file.preview ? 'attachment--image' : ''}`}>
    <button className="attachment-open" onClick={() => useStore.getState().openWindow('file', file.id, file.name)} aria-label={`Preview ${file.name}`}>
      {thumbnail && file.preview ? <img src={file.preview} alt={file.name}/> : <span className="file-symbol"><File size={22}/></span>}
      <span><strong>{file.name}</strong><small>{fileSize(file.size)} · {file.mime.startsWith('image') ? 'Design' : 'File'}</small></span>
    </button>
    <a className="icon-button" href={file.url} download={file.name} title={`Download ${file.name}`} aria-label={`Download ${file.name}`}><Download size={17}/></a>
  </div>;
}
export function ChatPanel({ window: win }: { window: OfficeWindow }) {
  const isChannel = win.kind === 'channel';
  const channel = useStore(s => s.channels.find(c => c.id === win.targetId));
  const messages = useStore(s => s.messages[win.id] ?? EMPTY_MESSAGES);
  const draft = useStore(s => s.drafts[win.id] ?? '');
  const call = useStore(s => s.call), history = useStore(s => s.callHistory);
  const [activeTab, setTab] = useState<Tab>('Messages');
  const [searchOpen, setSearchOpen] = useState(false), [query, setQuery] = useState('');
  const [emojiOpen, setEmojiOpen] = useState(false), [pending, setPending] = useState<Attachment[]>([]);
  const [fileError, setFileError] = useState('');
  const fileInput = useRef<HTMLInputElement>(null), scroller = useRef<HTMLDivElement>(null), pendingRef = useRef<Attachment[]>([]);
  const user = userById(win.targetId);
  const members = isChannel ? (channel?.memberIds ?? []) : ['me', win.targetId];
  const attachments = messages.flatMap(message => message.attachments ?? []).filter((file, i, all) => all.findIndex(other => other.id === file.id) === i);
  useEffect(() => { pendingRef.current = pending; }, [pending]);
  useEffect(() => () => { pendingRef.current.forEach(file => URL.revokeObjectURL(file.url)); }, []);
  useEffect(() => { if (scroller.current && messages.at(-1)?.authorId === 'me' && messages.at(-1)?.id.length === 36) scroller.current.scrollTop = scroller.current.scrollHeight; }, [messages]);
  const send = () => {
    if (useStore.getState().sendMessage(win.id, pending)) { pendingRef.current = []; setPending([]); setEmojiOpen(false); setFileError(''); }
  };
  const attach = (event: ChangeEvent<HTMLInputElement>) => {
    const picked: Attachment[] = [];
    for (const file of Array.from(event.target.files ?? [])) {
      if (file.size > 10 * 1024 * 1024) { setFileError('Please choose a file smaller than 10 MB.'); continue; }
      if (pending.length + picked.length >= 5) { setFileError('Attach up to 5 files per message.'); break; }
      const url = URL.createObjectURL(file);
      picked.push({ id: crypto.randomUUID(), name: file.name, size: file.size, mime: file.type || 'application/octet-stream', url, preview: /^image\/(png|jpeg|gif|webp)$/.test(file.type) ? url : undefined });
    }
    setPending(files => [...files, ...picked]);
    event.target.value = '';
  };
  const startCall = (kind: 'audio' | 'video') => useStore.getState().joinCall(isChannel ? `# ${channel?.name}` : user.name, members, kind);
  return <WindowFrame window={win} leading={isChannel ? <span className="channel-symbol"><Hash size={24}/></span> : <Avatar user={user} size={36}/>}
    subtitle={isChannel ? `${members.length} members` : user.status === 'online' ? 'Online' : user.status.replace('-', ' ')}
    actions={<>
      {isChannel && <><IconButton label={`Search ${win.title}`} onClick={() => { setSearchOpen(!searchOpen); setTab('Messages'); }}><Search size={17}/></IconButton><IconButton className="secondary-header-action" label={`Show ${win.title} members`} onClick={() => setTab('Members')}><Users size={17}/></IconButton></>}
      <IconButton label={`Start demo audio call with ${win.title}`} onClick={() => startCall('audio')}><Phone size={17}/></IconButton>
      {!isChannel && <IconButton label={`Start demo video call with ${win.title}`} onClick={() => startCall('video')}><Video size={18}/></IconButton>}
      {isChannel && <IconButton className="secondary-header-action" label={`${win.title} settings`} onClick={() => useStore.getState().openWindow('settings', win.targetId, `${win.title} settings`)}><Settings size={17}/></IconButton>}
    </>}>
    {isChannel && <div role="tablist" aria-label={`${win.title} tabs`} className="chat-tabs">{tabs.map(({ name, icon: Icon }) => <button key={name} role="tab" id={`${win.id}-tab-${name}`} aria-controls={`${win.id}-panel`} aria-selected={activeTab === name} onClick={() => setTab(name)} className={activeTab === name ? 'is-active' : ''}><Icon size={14}/>{name}</button>)}</div>}
    {searchOpen && <label className="message-search"><Search size={15}/><input autoFocus aria-label={`Search messages in ${win.title}`} placeholder="Search this conversation…" value={query} onChange={event => setQuery(event.target.value)}/><IconButton label="Close message search" onClick={() => { setSearchOpen(false); setQuery(''); }}><X size={14}/></IconButton></label>}
    <div className="chat-content" role={isChannel ? 'tabpanel' : undefined} id={`${win.id}-panel`} aria-labelledby={isChannel ? `${win.id}-tab-${activeTab}` : undefined}>
      {activeTab === 'Messages' && <>
        <div className="message-list" ref={scroller} aria-label={`${win.title} messages`}>
          {messages.filter(message => !query || `${message.text} ${userById(message.authorId).name} ${(message.attachments ?? []).map(file => file.name).join(' ')}`.toLowerCase().includes(query.toLowerCase())).map(message => {
            const author = userById(message.authorId);
            return <article className="message" key={message.id}>
              <button className="message-avatar" aria-label={`View ${author.name}'s profile`} onClick={() => useStore.getState().selectProfile(author.id)}><Avatar user={author} size={35}/></button>
              <div className="message-body"><div className="message-byline"><strong>{author.name}</strong><time>{message.time}</time></div>
                {message.text && <p>{message.text}</p>}
                {message.attachments?.map(file => <FileAttachment key={file.id} file={file} thumbnail={isChannel && file.mime.startsWith('image')}/>)}
                <div className="message-reactions">{Object.entries(message.reactions ?? {}).filter(([, value]) => value.count > 0).map(([emoji, value]) => <button key={emoji} className={value.mine ? 'is-selected' : ''} aria-pressed={value.mine} aria-label={`${emoji} reaction, ${value.count}`} onClick={() => useStore.getState().react(win.id, message.id, emoji)}>{emoji}<span>{value.count}</span></button>)}
                  <button className="add-reaction" title="React with thumbs up" aria-label={`React to ${author.name}'s message with thumbs up`} onClick={() => useStore.getState().react(win.id, message.id, '👍')}><Smile size={14}/><PlusSmall/></button>
                </div>
              </div>
            </article>;
          })}
          {!messages.length && <div className="empty-state"><MessageSquare size={30}/><h3>Start a conversation</h3><p>Say hello to {isChannel ? `#${win.title}` : user.name.split(' ')[0]}.</p></div>}
          {query && !messages.some(message => `${message.text} ${userById(message.authorId).name} ${(message.attachments ?? []).map(file => file.name).join(' ')}`.toLowerCase().includes(query.toLowerCase())) && <p className="no-results">No messages match “{query}”.</p>}
        </div>
        <div className="composer-area">
          <div className="typing-status" aria-live="polite">{draft ? <><span className="typing-dots"><i/><i/><i/></span> You are typing · local preview</> : <><span className="local-dot"/> Demo conversation · only on this page</>}</div>
          {pending.length > 0 && <div className="pending-files">{pending.map(file => <span key={file.id}><Paperclip size={12}/>{file.name}<IconButton label={`Remove attachment ${file.name}`} onClick={() => { URL.revokeObjectURL(file.url); setPending(files => files.filter(f => f.id !== file.id)); }}><X size={13}/></IconButton></span>)}</div>}
          {fileError && <p role="alert" className="form-error">{fileError}</p>}
          {emojiOpen && <div className="emoji-picker" aria-label="Emoji picker">{['😊', '👍', '❤️', '🙌', '🚀', '☕'].map(emoji => <button key={emoji} aria-label={`Insert ${emoji}`} onClick={() => { useStore.getState().setDraft(win.id, draft + emoji); setEmojiOpen(false); }}>{emoji}</button>)}</div>}
          <form className="message-composer" onSubmit={event => { event.preventDefault(); send(); }}>
            <input ref={fileInput} type="file" multiple hidden onChange={attach} aria-label={`Attach files to ${win.title}`}/>
            <IconButton label={`Attach a file to ${win.title}`} onClick={() => fileInput.current?.click()}><Paperclip size={20}/></IconButton>
            <IconButton label={`Choose emoji for ${win.title}`} aria-expanded={emojiOpen} onClick={() => setEmojiOpen(!emojiOpen)}><Smile size={20}/></IconButton>
            <textarea rows={1} maxLength={4000} value={draft} aria-label={`Message ${win.title}`} placeholder="Type a message…" onChange={event => useStore.getState().setDraft(win.id, event.target.value)} onKeyDown={event => { if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) { event.preventDefault(); send(); } }}/>
            <button type="submit" className="send-button" title="Send locally" aria-label={`Send message to ${win.title}`} disabled={!draft.trim() && !pending.length}><Send size={20}/></button>
          </form>
        </div>
      </>}
      {activeTab === 'Files' && <div className="tab-content"><p className="tab-caption">Shared in this conversation · local demo</p>{attachments.length ? attachments.map(file => <FileAttachment key={file.id} file={file}/>) : <div className="empty-state"><Files size={30}/><h3>No files yet</h3><p>Attach a file from the Messages tab.</p></div>}</div>}
      {activeTab === 'Members' && <div className="tab-content"><p className="tab-caption">{members.length} members in this channel</p>{members.map(id => <div className="member-row" key={id}><Avatar user={userById(id)} size={38}/><button onClick={() => useStore.getState().selectProfile(id)}><strong>{userById(id).name}{id === 'me' ? ' (you)' : ''}</strong><small>{userById(id).role}</small></button>{id !== 'me' && <IconButton label={`Message ${userById(id).name}`} onClick={() => useStore.getState().openWindow('dm', id)}><MessageSquare size={17}/></IconButton>}</div>)}</div>}
      {activeTab === 'Calls' && <div className="tab-content"><div className="call-intro"><span className="call-emblem"><Video size={28}/></span><h3>A quick conversation?</h3><p>Bring the channel together in a demo meeting.</p><button className="primary-button" onClick={() => startCall('video')}>Join demo meeting</button><small>No audio or video is transmitted.</small></div>{call && <p className="tab-caption">Current demo call: {call.name}</p>}{history.map((entry, i) => <div key={i} className="call-history"><Phone size={16}/><span>{entry.action}<small>{entry.name}</small></span><time>{entry.time}</time></div>)}</div>}
    </div>
  </WindowFrame>;
}
function PlusSmall() { return <span className="plus-small">+</span>; }
