import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js';
import type { User } from '../types';
import { WORLD_POSITIONS } from '../world';

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
  'bookcaseOpen',
  'bookcaseClosedWide',
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

  // 1. Sleek architectural foundation slab / podium (dark charcoal bevel)
  const baseGeom = new THREE.BoxGeometry(32, 0.8, 30);
  const baseMat = new THREE.MeshStandardMaterial({
    color: '#222834',
    roughness: 0.7,
    metalness: 0.15,
  });
  const baseMesh = new THREE.Mesh(baseGeom, baseMat);
  baseMesh.position.set(-4, -0.45, -3);
  baseMesh.receiveShadow = true;
  root.add(baseMesh);

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

  // Library back wall (solid stylish dark wood accent wall)
  const libBackWall = new THREE.Mesh(
    new THREE.BoxGeometry(16, 3, 0.3),
    new THREE.MeshStandardMaterial({ color: '#2d333b', roughness: 0.85 })
  );
  libBackWall.position.set(0, 1.5, -15.8);
  libBackWall.castShadow = true;
  libBackWall.receiveShadow = true;
  root.add(libBackWall);

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

  // Helper: Assemble a high-fidelity workstation cluster
  const addWorkstation = (
    x: number,
    z: number,
    rotY = 0,
    options: { dual?: boolean; plant?: boolean; laptop?: boolean } = {}
  ) => {
    // 1. Desk
    place('desk', x, z, 0.12, rotY, 2.1);

    // Direction vectors for rotation
    const cos = Math.cos(rotY);
    const sin = Math.sin(rotY);
    const deskY = 0.92;

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

    // Optional desk accessory
    if (options.plant) {
      place('plantSmall1', x - cos * 0.55, z + sin * 0.1, deskY, rotY, 1.7);
    } else {
      place('lampRoundTable', x + cos * 0.55, z - sin * 0.1, deskY, rotY, 1.5);
    }

    // Trash can under/beside desk
    place('trashcan', x - cos * 0.85, z - sin * 0.85, 0.12, rotY, 1.6);
  };

  // --- 1. OPEN PLAN WORKSPACE ---
  // Workstation A (Me / Mark Verona: target x: 2, z: 2)
  addWorkstation(2, 2.6, 0, { dual: true, plant: true });

  // Workstation B (Gregoria Comacho: target x: 0, z: -1.5)
  addWorkstation(0, -1.9, 0, { dual: true });

  // Workstation C (Christeen Violette: target x: 4.5, z: 3)
  addWorkstation(4.8, 3, Math.PI / 2, { laptop: true, plant: true });

  // Workstation D (Deane Chadburn: target x: -2.5, z: 5)
  addWorkstation(-2.5, 4.8, -Math.PI / 2, { dual: true });

  // Extra aesthetic desks to create a real office environment
  addWorkstation(-2.5, 2.5, -Math.PI / 2, { dual: false, plant: true });
  addWorkstation(0, 5, 0, { laptop: true });
  addWorkstation(4.8, 5.5, Math.PI / 2, { dual: true });

  // Divider cabinets and potted plants between desk clusters
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

  // Accessories on conference table
  place('laptop', -12, 2, 0.9, 0, 1.6);
  place('plantSmall2', -12.8, 2, 0.9, 0, 1.5);

  // Secondary meeting pod (around x: -12, z: -5)
  place('tableRound', -12, -5, 0.12, 0, 2.0);
  place('chairRounded', -12, -3.8, 0.12, Math.PI, 1.9); // Kaeya Furlong
  place('chairRounded', -12, -6.2, 0.12, 0, 1.9); // Edgar Enríquez
  place('chairRounded', -10.8, -5, 0.12, -Math.PI / 2, 1.9);
  place('plantSmall3', -12, -5, 0.88, 0, 1.6);

  // Corner plants & floor lamp in meeting room
  place('pottedPlant', -15.2, 6.8, 0.12, 0, 2.4);
  place('pottedPlant', -15.2, -6.8, 0.12, 0, 2.2);
  place('lampSquareFloor', -8.8, -6.5, 0.12, 0, 2.0);

  // --- 3. AMBER / CRIMSON WARM COLLABORATION ROOM (south-east, x: 4, z: -4) ---
  // The glowing room matching the reference image!
  place('rugRound', 4, -4, 0.16, 0, 2.6);
  place('tableCoffeeGlass', 4, -4, 0.17, 0, 2.4);
  // 4 red/warm accent chairs around the table
  place('chairRounded', 5.1, -4, 0.16, -Math.PI / 2, 2.0); // Arturo Hirst
  place('chairRounded', 2.9, -4, 0.16, Math.PI / 2, 2.0);
  place('chairRounded', 4, -2.9, 0.16, Math.PI, 2.0);
  place('chairRounded', 4, -5.1, 0.16, 0, 2.0); // Keely Jansen nearby
  // Plants and warm lighting decor
  place('pottedPlant', 6.6, -1.2, 0.16, 0, 2.2);
  place('pottedPlant', 6.6, -6.8, 0.16, 0, 2.2);

  // --- 4. EXECUTIVE LIBRARY & ARCHIVE (north wing, z: -12 to -16) ---
  // Bookcases lined along the dark back wall
  place('bookcaseOpen', -2, -15.2, 0.12, 0, 2.1);
  place('bookcaseClosedWide', 1, -15.2, 0.12, 0, 2.1);
  place('bookcaseOpen', 4, -15.2, 0.12, 0, 2.1);
  place('bookcaseClosedWide', 6.5, -15.2, 0.12, 0, 2.1);

  // Reading lounge in library
  place('rugRectangle', 1.5, -11.5, 0.14, 0, 2.4);
  place('loungeDesignChair', 4, -10.5, 0.14, -Math.PI / 4, 2.0); // Sephora Johnson
  place('loungeChairRelax', -2, -12, 0.14, Math.PI / 4, 2.0); // Vanessa Brisker
  place('tableCoffeeSquare', 1, -11.5, 0.14, 0, 2.0);
  place('books', 1, -11.5, 0.75, 0.2, 1.8);
  place('lampRoundFloor', -3.2, -14.2, 0.12, 0, 2.2);
  place('pottedPlant', 7, -13.5, 0.12, 0, 2.4);

  // --- 5. LOUNGE & BREAK PATIO (north-west, around x: -12, z: -12) ---
  place('rugRound', -12, -12, 0.14, 0, 2.8);
  place('loungeDesignSofa', -12, -13.2, 0.14, 0, 2.2);
  place('loungeDesignChair', -10, -11, 0.14, -Math.PI / 3, 2.0);
  place('tableCoffeeGlass', -12, -11.5, 0.14, 0, 2.2);

  // Coffee & refreshment station
  place('kitchenCabinet', -15.2, -13.5, 0.12, Math.PI / 2, 2.0);
  place('kitchenCoffeeMachine', -15.2, -13.5, 1.2, Math.PI / 2, 1.8);

  // Potted indoor trees in lounge
  place('pottedPlant', -15.2, -10.5, 0.12, 0, 2.4);
  place('lampSquareFloor', -9.2, -13.8, 0.12, 0, 2.0);

  // --- 6. CONNECTING CORRIDORS & ENTRANCE (around x: -5, z: 1) ---
  place('coatRackStanding', -5.8, 2.5, 0.12, 0, 2.0);
  place('pottedPlant', -5.8, -0.5, 0.12, 0, 2.2); // Denise Ricca is nearby at (-5, 1)
  place('speaker', -4.5, 0.5, 0.12, 0, 1.8);

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
  users: User[]
): { characters: THREE.Group[]; entities: CharacterEntity[] } {
  const characters: THREE.Group[] = [];
  const entities: CharacterEntity[] = [];

  users.forEach((user, i) => {
    const pos = WORLD_POSITIONS[user.id] || { x: 0, z: 0 };
    const modelUrl = USER_MODELS[user.id] || USER_MODELS.me;
    const charData = cache.characters[modelUrl];

    const group = new THREE.Group();
    group.position.set(pos.x, 0.12, pos.z);
    group.rotation.y = USER_ROTATIONS[user.id] ?? 0;
    group.userData = { userId: user.id, offset: i * 0.7 };

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
      const idleClip = charData.animations.find((a) => a.name === 'idle') || charData.animations[0];
      if (idleClip) {
        const action = mixer.clipAction(idleClip);
        action.play();
        mixer.setTime(i * 0.85); // Stagger animations so they don't look cloned
      }
      entities.push({ userId: user.id, group, mixer });
    }

    // Overhead Status Badge (billboard sprite)
    const badge = createStatusSprite(user.status);
    badge.position.set(0, 2.15, 0);
    group.add(badge);

    scene.add(group);
    characters.push(group);
  });

  return { characters, entities };
}
