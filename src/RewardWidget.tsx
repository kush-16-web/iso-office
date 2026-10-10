import { useState } from 'react';
import { ChevronDown, Minus, Plus, X } from 'lucide-react';
import { useStore } from './store';
import { coworkers } from './data';
import { IconButton } from './components/IconButton';
export function RewardWidget() {
  const open = useStore(s => s.rewardOpen), balance = useStore(s => s.rewardBalance), recipient = useStore(s => s.rewardRecipient);
  const [amount, setAmount] = useState(0), [expanded, setExpanded] = useState(false);
  if (!open) return null;
  const send = () => { if (useStore.getState().sendReward(recipient, amount)) { setAmount(0); setExpanded(false); } };
  return <section className={`reward-widget ${expanded || amount > 0 ? 'is-expanded' : ''}`} aria-label="Demo rewards">
    <div className="reward-heading"><span aria-hidden="true">🥐</span><IconButton label="Close reward widget" onClick={() => useStore.getState().hideReward()}><X size={14}/></IconButton></div>
    <button className="reward-title" onClick={() => setExpanded(!expanded)} aria-expanded={expanded}><strong>Reward</strong><ChevronDown size={13}/></button>
    <p>You have {balance} coins left to give</p>
    <div className="reward-counter"><IconButton label="Decrease reward" disabled={amount <= 0} onClick={() => setAmount(Math.max(0, amount - 1))}><Minus size={12}/></IconButton><output aria-label="Reward amount">{amount}</output><IconButton label="Increase reward" disabled={amount >= balance} onClick={() => setAmount(Math.min(balance, amount + 1))}><Plus size={12}/></IconButton></div>
    {(expanded || amount > 0) && <div className="reward-form"><label>To<select aria-label="Reward recipient" value={recipient} onChange={event => useStore.getState().showReward(event.target.value)}>{coworkers.map(user => <option key={user.id} value={user.id}>{user.name}</option>)}</select></label><button className="reward-send" disabled={amount <= 0 || amount > balance} onClick={send}>Give {amount || ''} demo {amount === 1 ? 'coin' : 'coins'}</button><small>Local demo · no monetary value</small></div>}
  </section>;
}
