import type { Channel, Message, User } from './types';
const portrait = (skin: string, hair: string, shirt: string, background: string, longHair = false, beard = false) => ({ skin, hair, shirt, background, longHair, beard });
export const currentUser: User = { id: 'me', name: 'Mark Verona', status: 'online', role: 'Frontend Developer', department: 'Tech', location: 'Public space', portrait: portrait('#f3bd99', '#ba4d31', '#384d67', '#f2e9e2', false, true) };
export const coworkers: User[] = [
  { id: 'gregoria', name: 'Gregoria Comacho', status: 'online', role: 'Data Analyst', department: 'Tech', location: 'Public space', portrait: portrait('#e0af88', '#49322d', '#176853', '#e5efe8', true) },
  { id: 'christeen', name: 'Christeen Violette', status: 'in-call', role: 'Product Designer', department: 'Design', location: 'Public space', portrait: portrait('#bb8265', '#25222c', '#5781ad', '#e5eaf1', true) },
  { id: 'deane', name: 'Deane Chadburn', status: 'away', role: 'Engineering Lead', department: 'Tech', location: 'Public space', portrait: portrait('#ca936e', '#4c362c', '#c7674d', '#f4dfd3', false, true) },
  { id: 'elisa', name: 'Elisa Lona', status: 'in-call', role: 'Product Manager', department: 'Product', location: 'Meeting rooms', portrait: portrait('#e5b08e', '#30282a', '#516573', '#e2ecee', true) },
  { id: 'wilbert', name: 'Wilbert Prewitt', status: 'in-call', role: 'Backend Developer', department: 'Tech', location: 'Meeting rooms', portrait: portrait('#ac795b', '#272222', '#354051', '#e8e1d8', false, true) },
  { id: 'sephora', name: 'Sephora Johnson', status: 'online', role: 'People Partner', department: 'People', location: 'Lounge & library', portrait: portrait('#e0b38e', '#817052', '#8ac8d6', '#e4f0f4') },
  { id: 'vanessa', name: 'Vanessa Brisker', status: 'in-call', role: 'UX Researcher', department: 'Design', location: 'Lounge & library', portrait: portrait('#efba9a', '#5e332b', '#b56358', '#f2e3da', true) },
  { id: 'arturo', name: 'Arturo Hirst', status: 'online', role: 'Visual Designer', department: 'Design', location: 'Public space', portrait: portrait('#c89673', '#31312e', '#557d92', '#e0ebf0', false, true) },
  { id: 'denise', name: 'Denise Ricca', status: 'online', role: 'Customer Success', department: 'Operations', location: 'Public space', portrait: portrait('#b58163', '#332926', '#64546a', '#eae7e1', true) },
  { id: 'kaeya', name: 'Kaeya Furlong', status: 'in-call', role: 'QA Engineer', department: 'Tech', location: 'Meeting rooms', portrait: portrait('#deac89', '#76613e', '#66a7b6', '#e2eced') },
  { id: 'edgar', name: 'Edgar Enríquez', status: 'offline', role: 'Operations Lead', department: 'Operations', location: 'Meeting rooms', portrait: portrait('#cf9b76', '#3a2928', '#a85248', '#eee3d9', false, true) },
  { id: 'keely', name: 'Keely Jansen', status: 'online', role: 'Creative Director', department: 'Design', location: 'Public space', portrait: portrait('#936045', '#241e20', '#2f4841', '#ede1d3', true) },
];
export const users = [currentUser, ...coworkers];
export const userById = (id: string) => users.find(user => user.id === id) ?? currentUser;
const memberIds = users.slice(0, 12).map(user => user.id);
export const initialChannels: Channel[] = [
  { id: 'general', name: 'General', unread: 0, memberIds, description: 'A little of everything, with everyone.' },
  { id: 'development', name: 'Development', unread: 3, memberIds, description: 'Build updates, ideas, and small wins from the engineering team.' },
  { id: 'design', name: 'Design', unread: 1, memberIds: ['me', 'christeen', 'arturo', 'keely', 'vanessa'], description: 'Make thoughtful things together.' },
  { id: 'random', name: 'Random', unread: 0, memberIds, description: 'The office water cooler.' },
  { id: 'announcements', name: 'Announcements', unread: 0, memberIds, description: 'The things everyone should know.' },
];
export const demoDesign = { id: 'design-file', name: 'workspace-layout.svg', size: 1519, mime: 'image/svg+xml', url: '/demo/workspace-layout.svg', preview: '/demo/workspace-layout.svg' };
export const demoBuild = { id: 'build-file', name: 'build-v1.2.3.txt', size: 278, mime: 'text/plain', url: '/demo/build-v1.2.3.txt' };
export const initialMessages: Record<string, Message[]> = {
  'channel:development': [
    { id: 'dev-1', authorId: 'me', text: 'Hey team, pushed the new build 🚀', time: '10:24 AM' },
    { id: 'dev-2', authorId: 'gregoria', text: 'Looks good! I’ll test it and share feedback.', time: '10:25 AM', attachments: [demoBuild] },
    { id: 'dev-3', authorId: 'keely', text: 'Nice! Let’s hop on a quick call to discuss.', time: '10:28 AM' },
    { id: 'dev-4', authorId: 'me', text: 'Joining now', time: '10:29 AM' },
    { id: 'dev-5', authorId: 'arturo', text: 'Here are the updated designs', time: '10:31 AM', attachments: [demoDesign], reactions: { '👍': { count: 4, mine: false }, '❤️': { count: 2, mine: false }, '🙌': { count: 1, mine: false } } },
  ],
  'dm:elisa': [
    { id: 'elisa-1', authorId: 'elisa', text: 'Hey, are you free for a quick sync?', time: '10:15 AM' },
    { id: 'elisa-2', authorId: 'me', text: 'Yeah, give me 5 minutes.', time: '10:16 AM' },
    { id: 'elisa-3', authorId: 'elisa', text: 'Joining a call?', time: '10:17 AM' },
    { id: 'elisa-4', authorId: 'me', text: 'Yep, I’ll start one.', time: '10:18 AM', attachments: [demoDesign] },
  ],
  'channel:general': [{ id: 'general-1', authorId: 'gregoria', text: 'Good morning, everyone! What are you working on today? ☀️', time: '9:04 AM' }],
  'channel:design': [{ id: 'design-1', authorId: 'arturo', text: 'A first look at our new workspace.', time: '9:42 AM', attachments: [demoDesign] }],
  'channel:random': [{ id: 'random-1', authorId: 'sephora', text: 'Coffee in the lounge? ☕', time: '9:45 AM' }],
  'channel:announcements': [{ id: 'announcements-1', authorId: 'me', text: 'Welcome to our office. This is a local demo — explore, open a chat, and make yourself at home.', time: '9:00 AM' }],
};
