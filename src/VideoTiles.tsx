import { useState } from 'react';
import { MicOff, PhoneOff, Video, Volume2, X } from 'lucide-react';
import { useStore } from './store';
import { userById } from './data';
import { Avatar } from './components/Avatar';
import { IconButton } from './components/IconButton';
export function VideoTiles() {
  const call = useStore(s => s.call), incoming = useStore(s => s.incomingCall);
  const isCameraOn = useStore(s => s.isCameraOn), isMuted = useStore(s => s.isMuted);
  const [participants, setParticipants] = useState(false);
  return <>
    {call ? <div className="video-strip" aria-label="Demo call participants">
      <div className="call-status"><span/>Demo call · no media connected</div>
      {call.participantIds.slice(0, 3).map((id, i) => {
        const user = userById(id);
        return <button className={`video-tile video-tile--${i} ${id === 'me' ? 'is-you' : ''}`} key={id} onClick={() => useStore.getState().selectProfile(id)} aria-label={`View ${user.name}'s profile from demo call`}>
          <div className="video-portrait">
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.name} className="video-feed-img" />
            ) : (
              <Avatar user={user} size={i === 1 ? 66 : 136} status={false}/>
            )}
          </div>
          <span className="tile-top-icon">{i === 1 ? <Volume2 size={15}/> : <Video size={14}/>}</span><span className="tile-mic">{id === 'me' && !isMuted ? <Volume2 size={14}/> : <MicOff size={14}/>}</span>
          {id === 'me' && isCameraOn && <small className="camera-preview-label">Camera preview</small>}
          <span className="tile-name">{user.name}{id === 'me' && ' (You)'}</span>
        </button>;
      })}
      <button className="more-participants" onClick={() => setParticipants(!participants)} aria-expanded={participants} aria-label="Show call participants"><span className="stacked-avatars">{call.participantIds.slice(3, 5).map(id => <Avatar key={id} user={userById(id)} size={27} status={false}/>)}</span><span>{call.participantIds.length > 3 ? `+${call.participantIds.length - 3}` : 'People'}</span><MicOff size={13}/></button>
      {participants && <div className="participants-popover"><div className="popover-title"><strong>{call.name}</strong><IconButton label="Close participants" onClick={() => setParticipants(false)}><X size={15}/></IconButton></div><p className="muted">Demo call · {call.participantIds.length} participants</p>{call.participantIds.map(id => <div className="member-row" key={id}><Avatar user={userById(id)} size={30}/><span>{userById(id).name}</span></div>)}<button className="danger-button" onClick={() => { useStore.getState().leaveCall(); setParticipants(false); }}><PhoneOff size={16}/>Leave demo call</button></div>}
    </div> : <button className="join-call-chip" onClick={() => useStore.getState().joinCall('Public space', ['gregoria', 'keely', 'arturo', 'elisa'])}><Video size={17}/>Join a demo call</button>}
    {incoming && <div className="incoming-call" role="alert"><Avatar user={userById(incoming)} size={42}/><div><strong>{userById(incoming).name}</strong><small>Incoming call preview</small></div><button className="primary-button" onClick={() => useStore.getState().joinCall(userById(incoming).name, [incoming])}>Accept demo</button><IconButton label="Decline demo call" onClick={() => useStore.getState().setIncomingCall(null)}><PhoneOff size={19}/></IconButton></div>}
  </>;
}
