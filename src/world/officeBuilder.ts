import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js';
import type { User } from '../types';
import { WORLD_POSITIONS } from '../world';
import { OFFICE_ANCHORS } from './navigation';
import type { CharacterMovementManager } from './characterController';
import {
  createShelfBookRow,
  createBookStack,
  createSingleBook,
  createCoffeeMug,
  createNotebook,
  createWhiteboard,
  createWaterDispenser,
  createDeskDivider,
} from './officeProps';

export interface OfficeAssetCache {
  furniture: Record<string, THREE.Group>;
  characters: Record<string, { scene: THREE.Group; animations: THREE.AnimationClip[] }>;
}

export const USER_MODELS: Record<string, string> = {
  me: '/models/characters/character-male-f.glb',
  gregoria: '/models/characters/character-female-a.glb',
  christeen: '/models/characters/character-female-b.glb',
  deane: '/models/characters/character-male-a.glb',
  elisa: '/models/characters/character-female-c.glb',
  wilbert: '/models/characters/character-male-b.glb',
  sephora: '/models/characters/character-female-d.glb',
  vanessa: '/models/characters/character-female-e.glb',
  arturo: '/models/characters/character-male-c.glb',
  denise: '/models/characters/character-female-f.glb',
  kaeya: '/models/characters/character-male-d.glb',
  edgar: '/models/characters/character-male-e.glb',
  keely: '/models/characters/character-female-a.glb',
};

const FURNITURE_NAMES = [
  'desk',
  'deskCorner',
  'chairDesk',
  'chairModernCushion',
  'chairRounded',
  'computerScreen',
  'computerKeyboard',
  'computerMouse',
  'laptop',
  'table',
  'tableRound',
  'tableCoffeeGlass',
  'tableCoffeeSquare',
  'loungeDesignSofa',
  'loungeDesignChair',
  'loungeChairRelax',
  'cardboardBoxClosed',
  'cardboardBoxOpen',
  'speakerSmall',
  'pillow',
  'pillowBlue',
  'pillowLong',
  'pillowBlueLong',
  'bookcaseOpen',
  'bookcaseOpenLow',
  'bookcaseClosedWide',
  'bookcaseClosedDoors',
  'sideTableDrawers',
  'paneling',
  'radio',
  'bear',
  'benchCushionLow',
  'kitchenFridgeSmall',
  'kitchenMicrowave',
  'televisionModern',
  'lampSquareTable',
  'books',
  'lampRoundFloor',
  'lampSquareFloor',
  'lampRoundTable',
  'pottedPlant',
  'plantSmall1',
  'plantSmall2',
  'plantSmall3',
  'rugRound',
  'rugRectangle',
  'kitchenCoffeeMachine',
  'kitchenCabinet',
  'trashcan',
  'speaker',
  'coatRackStanding',
  'wallWindow',
  'doorway',
];

export async function loadOfficeAssets(): Promise<OfficeAssetCache> {
  const loader = new GLTFLoader();
  const cache: OfficeAssetCache = {
    furniture: {},
    characters: {},
  };

  // 1. Load furniture
  const furnPromises = FURNITURE_NAMES.map(async (name) => {
    try {
      const gltf = await loader.loadAsync(`/models/furniture/${name}.glb`);
      gltf.scene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          if (child.material) {
            child.material.roughness = Math.min(child.material.roughness, 0.85);
          }
        }
      });
      cache.furniture[name] = gltf.scene;
    } catch (e) {
      console.warn(`Failed to load furniture asset: ${name}`, e);
    }
  });

  // 2. Load characters (unique URLs)
  const uniqueCharUrls = Array.from(new Set(Object.values(USER_MODELS)));
  const charPromises = uniqueCharUrls.map(async (url) => {
    try {
      const gltf = await loader.loadAsync(url);
      gltf.scene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
      cache.characters[url] = {
        scene: gltf.scene,
        animations: gltf.animations,
      };
    } catch (e) {
      console.warn(`Failed to load character asset: ${url}`, e);
    }
  });

  await Promise.all([...furnPromises, ...charPromises]);
  return cache;
}

export function buildOfficeArchitecture(scene: THREE.Scene) {
  const root = new THREE.Group();
  root.name = 'office_architecture';

  // 1. Sleek architectural foundation slab / podium (expanded to fill viewport edges naturally)
  const baseGeom = new THREE.BoxGeometry(56, 0.8, 52);
  const baseMat = new THREE.MeshStandardMaterial({
    color: '#222834',
    roughness: 0.7,
    metalness: 0.15,
  });
  const baseMesh = new THREE.Mesh(baseGeom, baseMat);
  baseMesh.position.set(-4, -0.45, -3);
  baseMesh.receiveShadow = true;
  root.add(baseMesh);

  // Extended perimeter architectural floor (soft warm slate border)
  const perimeterGeom = new THREE.BoxGeometry(48, 0.08, 44);
  const perimeterMat = new THREE.MeshStandardMaterial({
    color: '#dbe3ec',
    roughness: 0.8,
  });
  const perimeterFloor = new THREE.Mesh(perimeterGeom, perimeterMat);
  perimeterFloor.position.set(-4, 0.01, -3);
  perimeterFloor.receiveShadow = true;
  root.add(perimeterFloor);

  // 2. Floor zones
  // Zone A: Main Open Office Floor (clean modern warm off-white/light-slate)
  const openGeom = new THREE.BoxGeometry(16, 0.15, 16);
  const openMat = new THREE.MeshStandardMaterial({
    color: '#edf2f7',
    roughness: 0.65,
  });
  const openFloor = new THREE.Mesh(openGeom, openMat);
  openFloor.position.set(0, 0.05, 0);
  openFloor.receiveShadow = true;
  root.add(openFloor);

  // Zone B: Central Royal Blue Runner Pathway (like in reference image!)
  // Diagonal / curving walkway connecting desk bays to entrance and rooms
  const pathMat = new THREE.MeshStandardMaterial({
    color: '#3478d8',
    roughness: 0.5,
  });
  // Central walkway strip 1
  const path1 = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.03, 15.5), pathMat);
  path1.position.set(1.5, 0.14, 0);
  path1.receiveShadow = true;
  root.add(path1);

  // Walkway diagonal branch towards meeting room
  const path2 = new THREE.Mesh(new THREE.BoxGeometry(7, 0.03, 3), pathMat);
  path2.position.set(-4.5, 0.14, 2);
  path2.receiveShadow = true;
  root.add(path2);

  // Walkway branch towards lounge
  const path3 = new THREE.Mesh(new THREE.BoxGeometry(3, 0.03, 6), pathMat);
  path3.position.set(0, 0.14, -8);
  path3.receiveShadow = true;
  root.add(path3);

  // Zone C: Meeting Rooms Floor (west wing, sleek warm stone)
  const meetGeom = new THREE.BoxGeometry(8, 0.15, 16);
  const meetMat = new THREE.MeshStandardMaterial({
    color: '#dce4ec',
    roughness: 0.6,
  });
  const meetFloor = new THREE.Mesh(meetGeom, meetMat);
  meetFloor.position.set(-12, 0.05, 0);
  meetFloor.receiveShadow = true;
  root.add(meetFloor);

  // Zone D: Amber / Crimson Warm Collaboration Lounge (south-east / meeting nook)
  // Rich warm red carpet matching the warm glowing room in the reference image
  const amberGeom = new THREE.BoxGeometry(7.5, 0.16, 7.5);
  const amberMat = new THREE.MeshStandardMaterial({
    color: '#9e2d24',
    roughness: 0.85,
  });
  const amberFloor = new THREE.Mesh(amberGeom, amberMat);
  amberFloor.position.set(4, 0.06, -4);
  amberFloor.receiveShadow = true;
  root.add(amberFloor);

  // Zone E: Executive Library & Archive (north wing, rich warm honey wood parquet)
  const libGeom = new THREE.BoxGeometry(16, 0.15, 8);
  const libMat = new THREE.MeshStandardMaterial({
    color: '#a76a3e',
    roughness: 0.45,
  });
  const libFloor = new THREE.Mesh(libGeom, libMat);
  libFloor.position.set(0, 0.05, -12);
  libFloor.receiveShadow = true;
  root.add(libFloor);

  // Zone F: Lounge & Patio Garden (north-west, warm slate parquet)
  const loungeGeom = new THREE.BoxGeometry(8, 0.15, 8);
  const loungeMat = new THREE.MeshStandardMaterial({
    color: '#e4dcce',
    roughness: 0.7,
  });
  const loungeFloor = new THREE.Mesh(loungeGeom, loungeMat);
  loungeFloor.position.set(-12, 0.05, -12);
  loungeFloor.receiveShadow = true;
  root.add(loungeFloor);

  // 3. Glass Walls & Mullion Partitions
  // Translucent architectural glass material with subtle reflections
  const glassMat = new THREE.MeshPhysicalMaterial({
    color: '#d4ebf8',
    transparent: true,
    opacity: 0.28,
    roughness: 0.08,
    transmission: 0.7,
    ior: 1.5,
  });
  const frameMat = new THREE.MeshStandardMaterial({
    color: '#2d3748',
    roughness: 0.4,
    metalness: 0.6,
  });

  // Helper to create a sleek framed glass partition
  function createGlassWall(width: number, height = 2.4, depth = 0.08) {
    const wall = new THREE.Group();
    // Glass pane
    const pane = new THREE.Mesh(new THREE.BoxGeometry(width, height - 0.1, depth), glassMat);
    pane.position.y = height / 2;
    wall.add(pane);

    // Frame top and bottom
    const topFrame = new THREE.Mesh(new THREE.BoxGeometry(width + 0.04, 0.08, depth + 0.04), frameMat);
    topFrame.position.y = height;
    topFrame.castShadow = true;
    wall.add(topFrame);

    const botFrame = new THREE.Mesh(new THREE.BoxGeometry(width + 0.04, 0.08, depth + 0.04), frameMat);
    botFrame.position.y = 0.04;
    wall.add(botFrame);

    // Vertical posts
    const postCount = Math.max(2, Math.round(width / 2));
    for (let i = 0; i < postCount; i++) {
      const px = -width / 2 + (width / (postCount - 1)) * i;
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.06, height, depth + 0.04), frameMat);
      post.position.set(px, height / 2, 0);
      post.castShadow = true;
      wall.add(post);
    }
    return wall;
  }

  // Meeting room glass enclosure (along x = -8 from z = -8 to 8, with doorway gap)
  const meetWall1 = createGlassWall(6, 2.5);
  meetWall1.position.set(-8, 0.1, 4.8);
  meetWall1.rotation.y = Math.PI / 2;
  root.add(meetWall1);

  const meetWall2 = createGlassWall(6, 2.5);
  meetWall2.position.set(-8, 0.1, -4);
  meetWall2.rotation.y = Math.PI / 2;
  root.add(meetWall2);

  const meetWallSouth = createGlassWall(7.6, 2.5);
  meetWallSouth.position.set(-12, 0.1, 7.8);
  root.add(meetWallSouth);

  // Warm collaboration room glass enclosure (framing amber room)
  const amberWall1 = createGlassWall(7, 2.2);
  amberWall1.position.set(7.6, 0.1, -4);
  amberWall1.rotation.y = Math.PI / 2;
  root.add(amberWall1);

  const amberWall2 = createGlassWall(7, 2.2);
  amberWall2.position.set(4, 0.1, -0.4);
  root.add(amberWall2);

  // Library back wall (solid stylish dark charcoal accent wall)
  const libBackWall = new THREE.Mesh(
    new THREE.BoxGeometry(22, 3.2, 0.3),
    new THREE.MeshStandardMaterial({ color: '#252a33', roughness: 0.85 })
  );
  libBackWall.position.set(0, 1.6, -15.8);
  libBackWall.castShadow = true;
  libBackWall.receiveShadow = true;
  root.add(libBackWall);

  // West wing outer architectural wall behind meeting rooms
  const westWall = new THREE.Mesh(
    new THREE.BoxGeometry(0.3, 3.2, 28),
    new THREE.MeshStandardMaterial({ color: '#252a33', roughness: 0.85 })
  );
  westWall.position.set(-16.2, 1.6, -2);
  westWall.castShadow = true;
  westWall.receiveShadow = true;
  root.add(westWall);

  scene.add(root);
}

export function buildOfficeFurniture(scene: THREE.Scene, cache: OfficeAssetCache) {
  const root = new THREE.Group();
  root.name = 'office_furniture';

  const place = (name: string, x: number, z: number, y = 0.12, rotY = 0, scale = 2.0) => {
    const tmpl = cache.furniture[name];
    if (!tmpl) return null;
    const item = tmpl.clone();
    item.position.set(x, y, z);
    item.rotation.y = rotY;
    item.scale.setScalar(scale);
    root.add(item);
    return item;
  };

  // Helper: Assemble a high-fidelity workstation cluster with divider, peripherals, mugs, and notebooks
  const addWorkstation = (
    x: number,
    z: number,
    rotY = 0,
    options: {
      dual?: boolean;
      plant?: boolean;
      laptop?: boolean;
      mugColor?: string;
      noteColor?: string;
      dividerColor?: string;
    } = {}
  ) => {
    // 1. Desk
    place('desk', x, z, 0.12, rotY, 2.1);

    // Direction vectors for rotation
    const cos = Math.cos(rotY);
    const sin = Math.sin(rotY);
    const deskY = 0.92;

    // Acoustic fabric privacy divider at rear of desk
    const divider = createDeskDivider(1.6, 0.48, options.dividerColor || '#475569');
    divider.position.set(x - sin * 0.46, deskY, z - cos * 0.46);
    divider.rotation.y = rotY;
    root.add(divider);

    // Chair placed behind desk facing it
    const chairDist = 0.75;
    const chairX = x + sin * chairDist;
    const chairZ = z + cos * chairDist;
    place('chairDesk', chairX, chairZ, 0.12, rotY + Math.PI, 2.0);

    // Screen(s) & peripherals on desk
    if (options.laptop) {
      place('laptop', x, z, deskY, rotY, 1.6);
    } else if (options.dual) {
      // Screen 1
      place('computerScreen', x - cos * 0.35, z + sin * 0.35, deskY, rotY + 0.15, 1.8);
      // Screen 2
      place('computerScreen', x + cos * 0.35, z - sin * 0.35, deskY, rotY - 0.15, 1.8);
      // Keyboard & mouse
      place('computerKeyboard', x, z + sin * 0.25, deskY, rotY, 1.8);
      place('computerMouse', x + cos * 0.35, z + sin * 0.25, deskY, rotY, 1.8);
    } else {
      place('computerScreen', x, z, deskY, rotY, 1.9);
      place('computerKeyboard', x, z + sin * 0.22, deskY, rotY, 1.8);
      place('computerMouse', x + cos * 0.3, z + sin * 0.22, deskY, rotY, 1.8);
    }

    // Ceramic coffee mug on desk
    const mug = createCoffeeMug(options.mugColor || '#ffffff');
    mug.position.set(x + cos * 0.55 + sin * 0.18, deskY, z - sin * 0.55 + cos * 0.18);
    root.add(mug);

    // Hardcover notebook & pen
    const notebook = createNotebook(options.noteColor || '#1e3a5f');
    notebook.position.set(x - cos * 0.48 + sin * 0.22, deskY, z + sin * 0.48 + cos * 0.22);
    notebook.rotation.y = rotY + 0.12;
    root.add(notebook);

    // Optional desk accessory
    if (options.plant) {
      place('plantSmall1', x - cos * 0.55, z + sin * 0.05, deskY, rotY, 1.7);
    } else {
      place('lampRoundTable', x + cos * 0.55, z - sin * 0.1, deskY, rotY, 1.5);
    }

    // Trash can under/beside desk
    place('trashcan', x - cos * 0.85, z - sin * 0.85, 0.12, rotY, 1.6);
  };

  // --- 1. OPEN PLAN WORKSPACE ---
  // Workstation A (Me / Mark Verona: target x: 2, z: 2)
  addWorkstation(2, 2.6, 0, {
    dual: true,
    plant: true,
    mugColor: '#2563eb',
    noteColor: '#1e293b',
    dividerColor: '#3b82f6',
  });

  // Workstation B (Gregoria Comacho: target x: 0, z: -1.5)
  addWorkstation(0, -1.9, 0, {
    dual: true,
    mugColor: '#f97316',
    noteColor: '#0f766e',
    dividerColor: '#475569',
  });

  // Workstation C (Christeen Violette: target x: 4.5, z: 3)
  addWorkstation(4.8, 3, Math.PI / 2, {
    laptop: true,
    plant: true,
    mugColor: '#ec4899',
    noteColor: '#4338ca',
    dividerColor: '#6366f1',
  });

  // Workstation D (Deane Chadburn: target x: -2.5, z: 5)
  addWorkstation(-2.5, 4.8, -Math.PI / 2, {
    dual: true,
    mugColor: '#10b981',
    noteColor: '#b45309',
    dividerColor: '#059669',
  });

  // Extra aesthetic desks to create a real, dense office environment
  addWorkstation(-2.5, 2.5, -Math.PI / 2, {
    dual: false,
    plant: true,
    mugColor: '#eab308',
    dividerColor: '#64748b',
  });
  addWorkstation(0, 5, 0, {
    laptop: true,
    mugColor: '#8b5cf6',
    dividerColor: '#475569',
  });
  addWorkstation(4.8, 5.5, Math.PI / 2, {
    dual: true,
    mugColor: '#06b6d4',
    dividerColor: '#334155',
  });

  // Decorative plants & floor lighting between desk clusters
  place('pottedPlant', 3.4, 0.5, 0.12, 0, 2.2);
  place('pottedPlant', -1.2, 0.5, 0.12, 0, 2.0);
  place('pottedPlant', -4.2, 4.0, 0.12, 0, 2.2);
  place('lampRoundFloor', -4.5, 6.2, 0.12, 0, 2.0);

  // --- 2. MEETING ROOM (west wing, around x: -12, z: 2) ---
  // Large conference table
  place('table', -12, 2, 0.12, 0, 2.2);
  // Chairs around meeting table
  place('chairModernCushion', -10.8, 2, 0.12, -Math.PI / 2, 2.0); // Elisa Lona sits here
  place('chairModernCushion', -13.2, 2, 0.12, Math.PI / 2, 2.0); // Wilbert Prewitt sits here
  place('chairModernCushion', -12, 3.1, 0.12, Math.PI, 2.0);
  place('chairModernCushion', -12, 0.9, 0.12, 0, 2.0);

  // Laptops and accessories on conference table
  place('laptop', -12, 1.3, 0.9, 0, 1.6);
  place('laptop', -12, 2.7, 0.9, Math.PI, 1.6);
  place('plantSmall2', -12.8, 2, 0.9, 0, 1.5);

  const confNote1 = createNotebook('#1e293b');
  confNote1.position.set(-11.4, 0.9, 2);
  root.add(confNote1);

  const confNote2 = createNotebook('#0f766e');
  confNote2.position.set(-12.6, 0.9, 2);
  root.add(confNote2);

  const confMug1 = createCoffeeMug('#ffffff');
  confMug1.position.set(-11.3, 0.9, 2.4);
  root.add(confMug1);

  const confMug2 = createCoffeeMug('#2563eb');
  confMug2.position.set(-12.7, 0.9, 1.6);
  root.add(confMug2);

  // Mounted Agile Whiteboard with architecture roadmap on west wall
  const whiteboard = createWhiteboard(3.6, 2.0);
  whiteboard.position.set(-15.8, 1.9, 2);
  whiteboard.rotation.y = Math.PI / 2;
  root.add(whiteboard);

  // Large presentation screen display on east partition frame
  place('televisionModern', -8.1, 2, 1.15, -Math.PI / 2, 2.2);

  // Secondary meeting pod (around x: -12, z: -5)
  place('tableRound', -12, -5, 0.12, 0, 2.0);
  place('chairRounded', -12, -3.8, 0.12, Math.PI, 1.9); // Kaeya Furlong sits here
  place('chairRounded', -12, -6.2, 0.12, 0, 1.9); // Edgar Enríquez sits here
  place('chairRounded', -10.8, -5, 0.12, -Math.PI / 2, 1.9);
  place('plantSmall3', -12, -5, 0.88, 0, 1.6);

  const podNote = createNotebook('#b45309');
  podNote.position.set(-11.7, 0.88, -4.7);
  root.add(podNote);

  const podMug = createCoffeeMug('#3b82f6');
  podMug.position.set(-12.3, 0.88, -5.3);
  root.add(podMug);

  // Corner storage & plants in meeting room
  place('sideTableDrawers', -15.2, -0.5, 0.12, 0, 2.0);
  place('cardboardBoxClosed', -15.2, -0.5, 1.05, 0.1, 1.5);
  place('pottedPlant', -15.2, 6.8, 0.12, 0, 2.4);
  place('pottedPlant', -15.2, -6.8, 0.12, 0, 2.2);
  place('lampSquareFloor', -8.8, -6.5, 0.12, 0, 2.0);

  // --- 3. AMBER / CRIMSON WARM COLLABORATION ROOM (south-east, x: 4, z: -4) ---
  // The signature glowing room matching the reference image!
  place('rugRound', 4, -4, 0.16, 0, 2.6);
  place('tableCoffeeGlass', 4, -4, 0.17, 0, 2.4);

  // 4 red/warm accent chairs around the table
  place('chairRounded', 5.1, -4, 0.16, -Math.PI / 2, 2.0); // Arturo Hirst
  place('chairRounded', 2.9, -4, 0.16, Math.PI / 2, 2.0);
  place('chairRounded', 4, -2.9, 0.16, Math.PI, 2.0);
  place('chairRounded', 4, -5.1, 0.16, 0, 2.0); // Keely Jansen nearby

  // Decor and cushions in warm lounge
  place('pillow', 5.1, -4, 0.58, -Math.PI / 2, 1.5);
  place('pillowBlue', 2.9, -4, 0.58, Math.PI / 2, 1.5);
  place('books', 4.0, -4.0, 0.65, 0.25, 1.6);

  const warmMug1 = createCoffeeMug('#b91c1c');
  warmMug1.position.set(4.25, 0.65, -3.8);
  root.add(warmMug1);

  const warmMug2 = createCoffeeMug('#f59e0b');
  warmMug2.position.set(3.75, 0.65, -4.2);
  root.add(warmMug2);

  place('pottedPlant', 6.6, -1.2, 0.16, 0, 2.2);
  place('pottedPlant', 6.6, -6.8, 0.16, 0, 2.2);

  // --- 4. EXECUTIVE LIBRARY & ARCHIVE (north wing, z: -12 to -16) ---
  // Densely populated continuous wall of bookcases matching the reference image!
  place('bookcaseClosedDoors', -5.0, -15.2, 0.12, 0, 2.1);
  place('plantSmall3', -5.0, -15.2, 2.22, 0, 1.5);

  place('bookcaseOpen', -2.5, -15.2, 0.12, 0, 2.1);
  // Densely fill all 3 visible shelves of bookcaseOpen at -2.5:
  const libRow1 = createShelfBookRow(0.66, 0.22, { minHeight: 0.22, maxHeight: 0.32, colorSeed: 2 });
  libRow1.position.set(-2.5, 0.74, -15.2);
  root.add(libRow1);

  const libRow2 = createShelfBookRow(0.66, 0.22, { minHeight: 0.20, maxHeight: 0.28, colorSeed: 5 });
  libRow2.position.set(-2.5, 1.34, -15.2);
  root.add(libRow2);

  const libStack1 = createBookStack(4, 0.22, 0.26, 3);
  libStack1.position.set(-2.68, 1.94, -15.2);
  root.add(libStack1);

  const libBookLean = createSingleBook(0.06, 0.28, 0.2, '#742a2a');
  libBookLean.position.set(-2.34, 1.94, -15.2);
  libBookLean.rotation.z = -0.18;
  root.add(libBookLean);

  place('cardboardBoxOpen', -2.75, -15.2, 2.22, 0.08, 1.5);
  place('bear', -2.25, -15.2, 2.22, 0, 1.4); // Mascot trophy award!

  // Low central bookcase unit
  place('bookcaseOpenLow', 0.0, -15.2, 0.12, 0, 2.1);
  const libLowRow1 = createShelfBookRow(0.66, 0.22, { minHeight: 0.18, maxHeight: 0.26, colorSeed: 8 });
  libLowRow1.position.set(0.0, 0.42, -15.2);
  root.add(libLowRow1);

  const libLowStack = createBookStack(3, 0.2, 0.24, 7);
  libLowStack.position.set(-0.16, 0.92, -15.2);
  root.add(libLowStack);

  const libLowRow2 = createShelfBookRow(0.32, 0.22, { minHeight: 0.2, maxHeight: 0.25, colorSeed: 11 });
  libLowRow2.position.set(0.18, 0.92, -15.2);
  root.add(libLowRow2);

  place('radio', -0.15, -15.2, 1.25, 0, 1.5);
  place('plantSmall1', 0.2, -15.2, 1.25, 0, 1.5);

  // Second tall open bookcase at 2.5
  place('bookcaseOpen', 2.5, -15.2, 0.12, 0, 2.1);
  const libRow3 = createShelfBookRow(0.66, 0.22, { minHeight: 0.22, maxHeight: 0.3, colorSeed: 14 });
  libRow3.position.set(2.5, 0.74, -15.2);
  root.add(libRow3);

  const libStack2 = createBookStack(3, 0.22, 0.26, 10);
  libStack2.position.set(2.34, 1.34, -15.2);
  root.add(libStack2);

  const libRow3b = createShelfBookRow(0.34, 0.22, { minHeight: 0.22, maxHeight: 0.28, colorSeed: 17 });
  libRow3b.position.set(2.68, 1.34, -15.2);
  root.add(libRow3b);

  const libRow4 = createShelfBookRow(0.66, 0.22, { minHeight: 0.2, maxHeight: 0.26, colorSeed: 21 });
  libRow4.position.set(2.5, 1.94, -15.2);
  root.add(libRow4);

  place('cardboardBoxClosed', 2.3, -15.2, 2.22, -0.1, 1.6);
  place('plantSmall2', 2.75, -15.2, 2.22, 0, 1.5);

  // Closed storage cabinets along eastern wall of library
  place('bookcaseClosedWide', 5.0, -15.2, 0.12, 0, 2.1);
  place('cardboardBoxClosed', 4.8, -15.2, 2.22, 0.12, 1.6);
  place('cardboardBoxOpen', 5.3, -15.2, 2.22, -0.08, 1.6);

  place('bookcaseClosedDoors', 7.5, -15.2, 0.12, 0, 2.1);
  place('plantSmall1', 7.5, -15.2, 2.22, 0, 1.6);

  // Architectural bookcase divider near reading lounge (facing east)
  place('bookcaseOpenLow', -4.5, -10.0, 0.12, Math.PI / 2, 2.0);
  const divRow1 = createShelfBookRow(0.66, 0.22, { colorSeed: 25 });
  divRow1.rotation.y = Math.PI / 2;
  divRow1.position.set(-4.5, 0.42, -10.0);
  root.add(divRow1);

  const divRow2 = createShelfBookRow(0.66, 0.22, { colorSeed: 28 });
  divRow2.rotation.y = Math.PI / 2;
  divRow2.position.set(-4.5, 0.92, -10.0);
  root.add(divRow2);

  place('plantSmall2', -4.5, -10.0, 1.25, 0, 1.5);

  // Reading lounge in library
  place('rugRectangle', 1.5, -11.5, 0.14, 0, 2.4);
  place('loungeDesignChair', 4, -10.5, 0.14, -Math.PI / 4, 2.0); // Sephora Johnson sits here
  place('pillow', 4, -10.5, 0.58, -Math.PI / 4, 1.6);
  place('loungeChairRelax', -2, -12, 0.14, Math.PI / 4, 2.0); // Vanessa Brisker sits here
  place('tableCoffeeSquare', 1, -11.5, 0.14, 0, 2.0);
  place('books', 0.85, -11.5, 0.75, 0.2, 1.8);

  const readingMug = createCoffeeMug('#ffffff');
  readingMug.position.set(1.2, 0.75, -11.5);
  root.add(readingMug);

  const readingStack = createBookStack(2, 0.2, 0.24, 30);
  readingStack.position.set(1.0, 0.75, -11.3);
  root.add(readingStack);

  place('lampRoundFloor', -3.2, -14.2, 0.12, 0, 2.2);
  place('pottedPlant', 7, -13.5, 0.12, 0, 2.4);

  // --- 5. LOUNGE & BREAK PATIO (north-west, around x: -12, z: -12) ---
  place('rugRound', -12, -12, 0.14, 0, 2.8);
  place('loungeDesignSofa', -12, -13.2, 0.14, 0, 2.2);
  place('pillowLong', -12.7, -13.1, 0.62, 0.15, 1.6);
  place('pillowBlueLong', -11.3, -13.1, 0.62, -0.15, 1.6);
  place('loungeDesignChair', -10, -11, 0.14, -Math.PI / 3, 2.0);
  place('tableCoffeeGlass', -12, -11.5, 0.14, 0, 2.2);
  place('plantSmall3', -12, -11.5, 0.75, 0, 1.5);

  const patioMug = createCoffeeMug('#f8fafc');
  patioMug.position.set(-12.2, 0.65, -11.4);
  root.add(patioMug);

  place('books', -11.8, -11.5, 0.65, 0.4, 1.6);

  // Full kitchenette refreshment station
  place('kitchenCabinet', -15.2, -13.5, 0.12, Math.PI / 2, 2.0);
  place('kitchenCoffeeMachine', -15.2, -13.5, 1.2, Math.PI / 2, 1.8);
  place('kitchenFridgeSmall', -15.2, -15.0, 0.12, Math.PI / 2, 2.0);
  place('kitchenMicrowave', -15.2, -12.0, 1.2, Math.PI / 2, 1.6);

  const kitchenMug1 = createCoffeeMug('#3b82f6');
  kitchenMug1.position.set(-15.1, 1.2, -13.1);
  root.add(kitchenMug1);

  const kitchenMug2 = createCoffeeMug('#10b981');
  kitchenMug2.position.set(-15.1, 1.2, -13.9);
  root.add(kitchenMug2);

  // Potted indoor trees in lounge
  place('pottedPlant', -15.2, -10.5, 0.12, 0, 2.4);
  place('lampSquareFloor', -9.2, -13.8, 0.12, 0, 2.0);

  // --- 6. CONNECTING CORRIDORS & SHARED AMENITIES (around x: -5, z: 1) ---
  place('coatRackStanding', -5.8, 2.5, 0.12, 0, 2.0);
  place('pottedPlant', -5.8, -0.5, 0.12, 0, 2.2); // Denise Ricca is nearby at (-5, 1)
  place('speaker', -4.5, 0.5, 0.12, 0, 1.8);

  // Central corridor hydration station (Water cooler dispenser)
  const corridorWater = createWaterDispenser();
  corridorWater.position.set(-5.2, 0.12, -2.5);
  root.add(corridorWater);
  place('trashcan', -5.2, -1.8, 0.12, 0, 1.8);

  // Meeting wing hydration station
  const meetingWater = createWaterDispenser();
  meetingWater.position.set(-8.8, 0.12, 6.2);
  root.add(meetingWater);
  place('trashcan', -8.8, 5.5, 0.12, 0, 1.8);

  // Side console storage and boxes in open office periphery
  place('sideTableDrawers', 7.2, 1.5, 0.12, -Math.PI / 2, 2.0);
  place('plantSmall1', 7.2, 1.5, 1.05, 0, 1.5);
  place('cardboardBoxClosed', 7.2, 2.5, 0.12, 0.2, 1.6);

  scene.add(root);
}

export function buildOfficeLighting(scene: THREE.Scene) {
  const root = new THREE.Group();
  root.name = 'office_lighting';

  // 1. Warm natural ambient fill
  const ambient = new THREE.AmbientLight(0xfff8ee, 1.5);
  root.add(ambient);

  // 2. Main directional isometric sun
  const sun = new THREE.DirectionalLight(0xfffaec, 2.4);
  sun.position.set(-10, 32, 18);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.left = -26;
  sun.shadow.camera.right = 26;
  sun.shadow.camera.top = 26;
  sun.shadow.camera.bottom = -26;
  sun.shadow.camera.near = 0.5;
  sun.shadow.camera.far = 100;
  sun.shadow.bias = -0.0005;
  sun.shadow.normalBias = 0.04;
  root.add(sun);

  // 3. Signature warm amber glowing light in the collaboration / conference room
  const amberPoint = new THREE.PointLight(0xff7028, 3.2, 16, 1.2);
  amberPoint.position.set(4, 3.2, -4);
  amberPoint.castShadow = true;
  root.add(amberPoint);

  // 4. Warm study light in executive library
  const libPoint = new THREE.PointLight(0xffab4e, 2.2, 18, 1.3);
  libPoint.position.set(1, 3.0, -12);
  root.add(libPoint);

  // 5. Cool modern task light in meeting room
  const meetPoint = new THREE.PointLight(0xe8f4ff, 2.0, 18, 1.4);
  meetPoint.position.set(-12, 3.2, 1);
  root.add(meetPoint);

  // 6. Cozy warm light in patio lounge
  const loungePoint = new THREE.PointLight(0xffd599, 1.8, 14, 1.5);
  loungePoint.position.set(-12, 2.8, -12);
  root.add(loungePoint);

  scene.add(root);
}

export interface CharacterEntity {
  userId: string;
  group: THREE.Group;
  mixer: THREE.AnimationMixer;
}

// Create a sharp billboard status badge sprite
function createStatusSprite(status: string): THREE.Sprite {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;

  ctx.clearRect(0, 0, 128, 128);

  if (status === 'in-call') {
    // Blue rounded pill with white video camera icon
    ctx.fillStyle = '#2563eb';
    ctx.beginPath();
    ctx.arc(64, 64, 48, 0, Math.PI * 2);
    ctx.fill();

    // Camera body
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.roundRect(38, 48, 36, 32, 6);
    ctx.fill();
    // Camera lens
    ctx.beginPath();
    ctx.moveTo(76, 56);
    ctx.lineTo(92, 46);
    ctx.lineTo(92, 82);
    ctx.lineTo(76, 72);
    ctx.closePath();
    ctx.fill();
  } else if (status === 'online') {
    // Emerald green dot with crisp white border
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(64, 64, 34, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.arc(64, 64, 28, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // Away / offline amber or slate
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(64, 64, 30, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = status === 'away' ? '#f59e0b' : '#94a3b8';
    ctx.beginPath();
    ctx.arc(64, 64, 24, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  const material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthTest: false,
  });
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(0.65, 0.65, 1);
  return sprite;
}

const USER_ROTATIONS: Record<string, number> = {
  me: 0,
  gregoria: 0,
  christeen: Math.PI / 2,
  deane: -Math.PI / 2,
  elisa: -Math.PI / 2,
  wilbert: Math.PI / 2,
  sephora: -Math.PI / 4,
  vanessa: Math.PI / 4,
  arturo: -Math.PI / 2,
  denise: Math.PI / 3,
  kaeya: Math.PI,
  edgar: 0,
  keely: Math.PI / 4,
};

export function buildCharacters(
  scene: THREE.Scene,
  cache: OfficeAssetCache,
  users: User[],
  movementManager?: CharacterMovementManager
): { characters: THREE.Group[]; entities: CharacterEntity[] } {
  const characters: THREE.Group[] = [];
  const entities: CharacterEntity[] = [];

  users.forEach((user, i) => {
    const anchor = OFFICE_ANCHORS[user.id];
    const isSeated = anchor?.type === 'seated';
    const posX = anchor ? anchor.position.x : (WORLD_POSITIONS[user.id]?.x ?? 0);
    const posY = anchor ? anchor.position.y : 0.12;
    const posZ = anchor ? anchor.position.z : (WORLD_POSITIONS[user.id]?.z ?? 0);
    const rotY = anchor ? anchor.rotation : (USER_ROTATIONS[user.id] ?? 0);

    const modelUrl = USER_MODELS[user.id] || USER_MODELS.me;
    const charData = cache.characters[modelUrl];

    const group = new THREE.Group();
    group.position.set(posX, posY, posZ);
    group.rotation.y = rotY;
    group.userData = { userId: user.id, offset: i * 0.7, isSeated };

    if (charData) {
      // Properly clone skinned mesh and skeleton using SkeletonUtils
      const model = SkeletonUtils.clone(charData.scene);
      model.scale.setScalar(1.75); // 1.75 scale gives realistic human height next to 0.8 unit desks
      model.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          child.userData.userId = user.id;
        }
      });
      group.add(model);

      // Animation Mixer
      const mixer = new THREE.AnimationMixer(model);

      if (movementManager && anchor) {
        movementManager.registerCharacter(
          user.id,
          group,
          mixer,
          charData.animations,
          anchor,
          isSeated ? 'seated' : 'idle'
        );
      } else {
        const clipName = isSeated ? 'sit' : 'idle';
        const clip = charData.animations.find((a) => a.name === clipName) || charData.animations[0];
        if (clip) {
          const action = mixer.clipAction(clip);
          action.play();
          mixer.setTime(i * 0.85); // Stagger animations so they don't look cloned
        }
      }

      entities.push({ userId: user.id, group, mixer });
    }

    // Overhead Status Badge (positioned appropriately for seated vs standing height)
    const badge = createStatusSprite(user.status);
    badge.position.set(0, isSeated ? 1.85 : 2.15, 0);
    group.add(badge);

    scene.add(group);
    characters.push(group);
  });

  return { characters, entities };
}
