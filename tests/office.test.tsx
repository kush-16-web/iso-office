import './setup';
import { afterEach, beforeEach, test } from 'node:test';
import assert from 'node:assert/strict';
import { act } from 'react';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { useStore } from '../src/store';
import { ChatPanel } from '../src/ChatPanel';
import { Sidebar } from '../src/Sidebar';
import { RewardWidget } from '../src/RewardWidget';
import { BottomBar } from '../src/BottomBar';
import { ProfileCard } from '../src/ProfileCard';
import { Minimap } from '../src/Minimap';
import { UtilityWindow } from '../src/components/UtilityWindow';
import { WindowDock } from '../src/components/WindowFrame';
import { clampRect, displayRect } from '../src/lib/windows';
import { mapToWorld, worldToMap, WORLD_POSITIONS } from '../src/world';

const baseline = useStore.getInitialState();
beforeEach(() => { useStore.setState(baseline, true); });
afterEach(() => cleanup());
function Windows() {
  const windows = useStore(s => s.windows);
  return <>{windows.map(window => window.kind === 'dm' || window.kind === 'channel' ? <ChatPanel key={window.id} window={window}/> : <UtilityWindow key={window.id} window={window}/>)}<WindowDock/></>;
}
const state = () => useStore.getState();

test('windows stay inside the stage and reserve the bottom controls', () => {
  const bounds = { width: 900, height: 700 };
  for (const rect of [{ x: -100, y: -200, width: 30, height: 10 }, { x: 5000, y: 5000, width: 400, height: 500 }, { x: 0, y: 0, width: 4000, height: 6000 }]) {
    const fit = clampRect(rect, bounds);
    assert.ok(fit.x >= 12 && fit.y >= 12);
    assert.ok(fit.x + fit.width <= bounds.width - 12);
    assert.ok(fit.y + fit.height <= bounds.height - 100);
  }
});
test('reopening a conversation deduplicates it and raises focus', () => {
  state().openWindow('dm', 'gregoria'); state().openWindow('dm', 'elisa'); state().openWindow('dm', 'gregoria');
  assert.equal(state().windows.filter(win => win.id === 'dm:gregoria').length, 1);
  assert.equal(state().windows.find(win => win.id === 'dm:gregoria')!.z, state().nextZ - 1);
});
test('maximized windows survive minimize/restore and recover their floating geometry', () => {
  const rect = { ...state().windows[1].rect };
  state().maximizeWindow('channel:development'); state().minimizeWindow('channel:development'); state().restoreWindow('channel:development');
  const win = state().windows.find(win => win.id === 'channel:development')!;
  assert.equal(win.mode, 'maximized');
  assert.equal(displayRect(win, state().bounds).x, 12);
  state().maximizeWindow(win.id);
  assert.deepEqual(state().windows.find(w => w.id === win.id)!.rect, rect);
});
test('responsive bounds constrain every window after a desktop viewport shrink', () => {
  state().setBounds({ width: 1182, height: 1024 });
  state().setBounds({ width: 720, height: 600 });
  for (const win of state().windows) { assert.ok(win.rect.x + win.rect.width <= 708); assert.ok(win.rect.y + win.rect.height <= 500); }
});
test('a narrow screen shows only the focused conversation and can switch via the dock', () => {
  state().setBounds({ width: 390, height: 844 }); render(<Windows/>);
  assert.equal(screen.getAllByRole('dialog').length, 1);
  assert.ok(screen.getByRole('dialog', { name: 'Development channel' }));
  fireEvent.click(screen.getByTitle('Restore Elisa Lona'));
  assert.equal(screen.getAllByRole('dialog').length, 1);
  assert.ok(screen.getByRole('dialog', { name: 'Elisa Lona direct message' }));
});
test('profiles open as accessible windows on narrow screens', () => {
  state().setBounds({ width: 390, height: 844 }); state().selectProfile('gregoria'); render(<Windows/>);
  assert.ok(screen.getByRole('dialog', { name: 'Gregoria Comacho profile' }));
  assert.equal(state().selectedProfile, null);
});
test('window headers support keyboard movement and viewport clamping', () => {
  render(<Windows/>);
  const previous = state().windows[1].rect.x;
  fireEvent.keyDown(screen.getByLabelText('Move Development window with arrow keys'), { key: 'ArrowLeft' });
  assert.equal(state().windows.find(w => w.id === 'channel:development')!.rect.x, previous - 16);
});
test('pointer dragging moves a window without losing bounds', () => {
  render(<Windows/>);
  const header = screen.getByLabelText('Move Development window with arrow keys').parentElement!;
  const start = state().windows[1].rect.x;
  fireEvent.pointerDown(header, { button: 0, clientX: 700, clientY: 250, pointerId: 1 });
  fireEvent.pointerMove(header, { clientX: 600, clientY: 250, pointerId: 1 });
  fireEvent.pointerUp(header, { pointerId: 1 });
  assert.equal(state().windows.find(w => w.id === 'channel:development')!.rect.x, start - 100);
});
test('a draft survives minimize, restore, close, and reopen', () => {
  render(<Windows/>);
  fireEvent.change(screen.getByLabelText('Message Development'), { target: { value: 'Keep my draft' } });
  fireEvent.click(screen.getByRole('button', { name: 'Minimize Development', exact: true }));
  assert.equal(screen.queryByRole('dialog', { name: 'Development channel' }), null);
  fireEvent.click(screen.getByTitle('Restore Development'));
  assert.equal((screen.getByLabelText('Message Development') as HTMLTextAreaElement).value, 'Keep my draft');
  fireEvent.click(screen.getByRole('button', { name: 'Close Development', exact: true }));
  act(() => state().openWindow('channel', 'development'));
  assert.equal((screen.getByLabelText('Message Development') as HTMLTextAreaElement).value, 'Keep my draft');
});
test('sending through the composer appends a local message and clears the draft', () => {
  render(<Windows/>);
  fireEvent.change(screen.getByLabelText('Message Development'), { target: { value: 'A new local message' } });
  fireEvent.click(screen.getByRole('button', { name: 'Send message to Development' }));
  assert.equal(state().messages['channel:development'].at(-1)!.text, 'A new local message');
  assert.equal(state().drafts['channel:development'], '');
  assert.ok(screen.getByText('A new local message'));
});
test('blank messages cannot be sent', () => {
  state().setDraft('channel:development', '   ');
  const count = state().messages['channel:development'].length;
  assert.equal(state().sendMessage('channel:development'), false);
  assert.equal(state().messages['channel:development'].length, count);
});
test('attachments can be sent without text and are previewable locally', () => {
  render(<Windows/>);
  const file = new File(['sample image'], 'sample.png', { type: 'image/png' });
  fireEvent.change(screen.getByLabelText('Attach files to Development'), { target: { files: [file] } });
  fireEvent.click(screen.getByRole('button', { name: 'Send message to Development' }));
  assert.equal(state().messages['channel:development'].at(-1)!.attachments![0].name, 'sample.png');
  fireEvent.click(screen.getByRole('button', { name: 'Preview sample.png' }));
  const preview = screen.getByRole('dialog', { name: 'sample.png file' });
  assert.ok(within(preview).getByRole('img', { name: 'sample.png' }));
  assert.equal(within(preview).getByRole('link', { name: 'Download a copy' }).getAttribute('download'), 'sample.png');
});
test('message search filters the displayed conversation', () => {
  render(<Windows/>);
  fireEvent.click(screen.getByRole('button', { name: 'Search Development' }));
  fireEvent.change(screen.getByLabelText('Search messages in Development'), { target: { value: 'updated designs' } });
  const conversation = screen.getByRole('dialog', { name: 'Development channel' });
  assert.ok(within(conversation).getByText('Here are the updated designs'));
  assert.equal(within(conversation).queryByText('Hey team, pushed the new build 🚀'), null);
});
test('channel files and members tabs expose their real local contents', () => {
  render(<Windows/>);
  fireEvent.click(screen.getByRole('tab', { name: 'Files', exact: true }));
  assert.ok(within(screen.getByRole('tabpanel')).getByText('build-v1.2.3.txt'));
  fireEvent.click(screen.getByRole('tab', { name: 'Members', exact: true }));
  assert.ok(within(screen.getByRole('tabpanel')).getByText('12 members in this channel'));
  fireEvent.click(within(screen.getByRole('tabpanel')).getByRole('button', { name: 'Message Gregoria Comacho' }));
  assert.ok(screen.getByRole('dialog', { name: 'Gregoria Comacho direct message' }));
});
test('reactions are reversible and do not keep incrementing on repeated clicks', () => {
  render(<Windows/>);
  fireEvent.click(screen.getByRole('button', { name: '👍 reaction, 4' }));
  assert.equal(state().messages['channel:development'].at(-1)!.reactions!['👍'].count, 5);
  fireEvent.click(screen.getByRole('button', { name: '👍 reaction, 5' }));
  assert.deepEqual(state().messages['channel:development'].at(-1)!.reactions!['👍'], { count: 4, mine: false });
});
test('reward UI records the chosen recipient and decrements the balance once', () => {
  render(<RewardWidget/>);
  for (let i = 0; i < 3; i++) fireEvent.click(screen.getByRole('button', { name: 'Increase reward' }));
  fireEvent.change(screen.getByLabelText('Reward recipient'), { target: { value: 'arturo' } });
  fireEvent.click(screen.getByRole('button', { name: 'Give 3 demo coins' }));
  assert.equal(state().rewardBalance, 397);
  assert.deepEqual(state().rewardHistory, [{ recipient: 'arturo', amount: 3 }]);
  assert.equal(state().sendReward('arturo', 398), false);
});
test('reward boundaries reject invalid numbers, self rewards, and missing recipients', () => {
  for (const amount of [-1, 0, 401, 1.5, NaN, Infinity]) assert.equal(state().sendReward('gregoria', amount), false);
  assert.equal(state().sendReward('unknown', 1), false); assert.equal(state().sendReward('me', 1), false);
  assert.equal(state().rewardBalance, 400);
  assert.equal(state().sendReward('gregoria', 400), true); assert.equal(state().sendReward('gregoria', 1), false);
  assert.equal(state().rewardBalance, 0);
});
test('demo media controls change preview state without invoking media devices', () => {
  render(<BottomBar/>);
  fireEvent.click(screen.getByRole('button', { name: 'Unmute demo microphone' }));
  fireEvent.click(screen.getByRole('button', { name: 'Start camera demo camera' }));
  fireEvent.click(screen.getByRole('button', { name: 'Share screen demo screen sharing' }));
  assert.equal(state().isMuted, false); assert.equal(state().isCameraOn, true); assert.equal(state().isScreenSharing, true);
  fireEvent.click(screen.getByRole('button', { name: 'Leave demo call' }));
  assert.equal(state().call, null); assert.equal(state().isMuted, true); assert.equal(state().isCameraOn, false); assert.equal(state().isScreenSharing, false);
  assert.equal((screen.getByRole('button', { name: 'Unmute demo microphone' }) as HTMLButtonElement).disabled, true);
});
test('a call continues when conversations open, minimize, and close', () => {
  state().joinCall('Team Standup', ['gregoria', 'elisa'], 'audio');
  const call = state().call;
  state().openWindow('dm', 'arturo'); state().minimizeWindow('dm:arturo'); state().closeWindow('dm:arturo');
  assert.deepEqual(state().call, call);
});
test('profile Chat opens a DM and Go to updates the shared camera target', () => {
  render(<ProfileCard/>);
  fireEvent.click(screen.getByRole('button', { name: 'Chat', exact: true }));
  assert.ok(state().windows.some(win => win.id === 'dm:gregoria'));
  fireEvent.click(screen.getByRole('button', { name: 'Go to' }));
  assert.deepEqual(state().camera.target, WORLD_POSITIONS.gregoria);
});
test('minimap uses reversible world coordinates and directs the actual camera state', () => {
  for (const value of [-16, -3.5, 0, 8]) assert.ok(Math.abs(mapToWorld(worldToMap(value)) - value) < .00001);
  render(<Minimap/>);
  fireEvent.click(screen.getByRole('button', { name: 'Center camera on Elisa Lona' }));
  assert.deepEqual(state().camera.target, WORLD_POSITIONS.elisa);
  fireEvent.click(screen.getByRole('button', { name: 'Zoom in office' }));
  assert.equal(state().camera.zoom, 1.2);
  fireEvent.click(screen.getByRole('button', { name: 'Reset office camera' }));
  assert.deepEqual(state().camera.target, { x: -3, z: -3 });
});
test('sidebar opens channels and filters coworkers', () => {
  render(<Sidebar/>);
  fireEvent.click(screen.getByRole('button', { name: 'General', exact: true }).closest('.channel-row')!);
  assert.ok(state().windows.some(win => win.id === 'channel:general'));
  fireEvent.click(screen.getByRole('button', { name: 'Find a coworker' }));
  fireEvent.change(screen.getByLabelText('Search coworkers'), { target: { value: 'Gregoria' } });
  assert.ok(screen.getByRole('button', { name: 'Message Gregoria Comacho' }));
  assert.equal(screen.queryByRole('button', { name: 'Message Elisa Lona' }), null);
});
test('new demo channels are unique and open as conversations', () => {
  assert.equal(state().createChannel('   '), null); assert.equal(state().createChannel('development'), null);
  const id = state().createChannel('Project Aurora');
  assert.ok(id); assert.equal(state().windows.at(-1)!.targetId, id);
  assert.deepEqual(state().channels.at(-1)!.memberIds, ['me']);
});
