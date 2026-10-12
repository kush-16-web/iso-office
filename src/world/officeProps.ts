import * as THREE from 'three';

// Palette of curated spine colors matching a refined architectural library
const BOOK_SPINE_COLORS = [
  '#2a4365', // Navy
  '#742a2a', // Crimson
  '#22543d', // Forest
  '#744210', // Amber
  '#4a5568', // Slate
  '#44337a', // Deep violet
  '#234e52', // Teal
  '#7b341e', // Terracotta
  '#1a202c', // Charcoal
  '#975a16', // Honey
  '#2b6cb0', // Cobalt
  '#c53030', // Ruby
];

// Helper to create a single book mesh
export function createSingleBook(
  width = 0.06,
  height = 0.26,
  depth = 0.2,
  color = '#2a4365'
): THREE.Group {
  const group = new THREE.Group();

  // Cover material
  const coverMat = new THREE.MeshStandardMaterial({
    color,
    roughness: 0.6,
  });

  // Pages material (creamy off-white paper block)
  const pagesMat = new THREE.MeshStandardMaterial({
    color: '#fdfbf7',
    roughness: 0.9,
  });

  // Main book block
  const cover = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), coverMat);
  cover.position.y = height / 2;
  cover.castShadow = true;
  cover.receiveShadow = true;
  group.add(cover);

  // Pages inset
  const pages = new THREE.Mesh(
    new THREE.BoxGeometry(width * 0.88, height * 0.94, depth * 0.94),
    pagesMat
  );
  pages.position.set(0, height / 2, depth * 0.02);
  group.add(pages);

  return group;
}

// Helper: Create a dense row of standing books for a shelf
export function createShelfBookRow(
  totalWidth = 0.65,
  shelfDepth = 0.22,
  options: { minHeight?: number; maxHeight?: number; colorSeed?: number } = {}
): THREE.Group {
  const row = new THREE.Group();
  const minH = options.minHeight ?? 0.22;
  const maxH = options.maxHeight ?? 0.32;
  let currentX = -totalWidth / 2;
  let seed = options.colorSeed ?? 0;

  while (currentX < totalWidth / 2 - 0.04) {
    const bookWidth = 0.035 + Math.sin(seed * 7.1) * 0.015 + 0.02; // 0.04 to 0.07m thick
    const bookHeight = minH + ((Math.cos(seed * 4.3) + 1) / 2) * (maxH - minH);
    const colorIndex = Math.abs(Math.floor(seed * 3.7)) % BOOK_SPINE_COLORS.length;
    const color = BOOK_SPINE_COLORS[colorIndex];

    const book = createSingleBook(bookWidth, bookHeight, shelfDepth * 0.85, color);
    book.position.x = currentX + bookWidth / 2;
    row.add(book);

    currentX += bookWidth + 0.004;
    seed += 1.37;
  }

  return row;
}

// Helper: Create a horizontal stack of books
export function createBookStack(
  count = 3,
  baseWidth = 0.22,
  baseDepth = 0.28,
  seed = 0
): THREE.Group {
  const stack = new THREE.Group();
  let currentY = 0;

  for (let i = 0; i < count; i++) {
    const bookHeight = 0.045 + (i % 2) * 0.015;
    const bookWidth = baseWidth - i * 0.015;
    const bookDepth = baseDepth - i * 0.02;
    const colorIndex = (Math.floor(seed * 2 + i)) % BOOK_SPINE_COLORS.length;

    const book = createSingleBook(bookWidth, bookHeight, bookDepth, BOOK_SPINE_COLORS[colorIndex]);
    book.position.set(0, currentY, 0);
    // Slight angle variance
    book.rotation.y = (Math.sin(seed + i) * 0.08);
    stack.add(book);

    currentY += bookHeight;
  }

  return stack;
}

// Ceramic coffee mug with liquid surface and handle
export function createCoffeeMug(color = '#ffffff'): THREE.Group {
  const mug = new THREE.Group();

  const bodyMat = new THREE.MeshStandardMaterial({
    color,
    roughness: 0.3,
  });
  const liquidMat = new THREE.MeshStandardMaterial({
    color: '#382212', // Rich dark roast espresso
    roughness: 0.2,
  });

  // Mug body
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.055, 0.12, 16), bodyMat);
  body.position.y = 0.06;
  body.castShadow = true;
  mug.add(body);

  // Dark coffee inside
  const liquid = new THREE.Mesh(new THREE.CircleGeometry(0.055, 16), liquidMat);
  liquid.rotation.x = -Math.PI / 2;
  liquid.position.y = 0.115;
  mug.add(liquid);

  // Handle
  const handleMat = bodyMat;
  const handle = new THREE.Mesh(
    new THREE.TorusGeometry(0.035, 0.01, 8, 16, Math.PI * 1.2),
    handleMat
  );
  handle.position.set(0.065, 0.06, 0);
  handle.rotation.z = -Math.PI / 2;
  mug.add(handle);

  return mug;
}

// Office notebook / planner with ribbon bookmark and pen
export function createNotebook(coverColor = '#2b4c6f'): THREE.Group {
  const note = new THREE.Group();

  const coverMat = new THREE.MeshStandardMaterial({ color: coverColor, roughness: 0.5 });
  const paperMat = new THREE.MeshStandardMaterial({ color: '#fefefe', roughness: 0.8 });

  // Notebook body
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.025, 0.32), coverMat);
  body.position.y = 0.0125;
  body.castShadow = true;
  note.add(body);

  // White paper edges
  const pages = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.02, 0.3), paperMat);
  pages.position.set(0.005, 0.0125, 0);
  note.add(pages);

  // Sleek pen resting on side
  const penMat = new THREE.MeshStandardMaterial({ color: '#1a1a1a', metalness: 0.7, roughness: 0.3 });
  const pen = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.26, 8), penMat);
  pen.rotation.z = Math.PI / 2;
  pen.position.set(0, 0.03, 0.08);
  note.add(pen);

  return note;
}

// Conference Room Whiteboard with realistic diagrams and notes
export function createWhiteboard(width = 3.6, height = 2.0): THREE.Group {
  const board = new THREE.Group();

  // Draw procedural agile diagram onto canvas texture
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 288;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, 512, 288);

  // Header line
  ctx.fillStyle = '#1e293b';
  ctx.font = 'bold 18px sans-serif';
  ctx.fillText('Project Aurora — Architecture & Roadmap', 24, 34);

  // Divider line
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(24, 46);
  ctx.lineTo(488, 46);
  ctx.stroke();

  // Architecture diagram blocks (blue, emerald, amber)
  const drawBlock = (x: number, y: number, w: number, h: number, label: string, color: string) => {
    ctx.fillStyle = color;
    ctx.roundRect(x, y, w, h, 6);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText(label, x + 8, y + h / 2 + 4);
  };

  drawBlock(28, 65, 110, 38, 'Web Client (Three)', '#2563eb');
  drawBlock(180, 65, 110, 38, 'API Gateway', '#059669');
  drawBlock(330, 65, 110, 38, 'State Engine', '#d97706');

  // Connecting arrows
  ctx.strokeStyle = '#64748b';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(138, 84);
  ctx.lineTo(180, 84);
  ctx.moveTo(290, 84);
  ctx.lineTo(330, 84);
  ctx.stroke();

  // Sticky notes (yellow, cyan, pink)
  const drawSticky = (x: number, y: number, text: string, color: string) => {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, 50, 48);
    ctx.fillStyle = '#1e293b';
    ctx.font = '8px sans-serif';
    ctx.fillText(text, x + 4, y + 26);
  };

  drawSticky(36, 128, 'Sprint 4', '#fef08a');
  drawSticky(94, 128, 'P0 Done', '#a7f3d0');
  drawSticky(152, 128, 'Review', '#bae6fd');
  drawSticky(210, 128, '99.9% SLO', '#fbcfe8');

  // Bar chart sketch
  ctx.fillStyle = '#3b82f6';
  ctx.fillRect(320, 190, 18, 45);
  ctx.fillRect(348, 165, 18, 70);
  ctx.fillRect(376, 145, 18, 90);
  ctx.fillRect(404, 125, 18, 110);
  ctx.fillRect(432, 110, 18, 125);

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;

  // Aluminum frame
  const frameMat = new THREE.MeshStandardMaterial({ color: '#334155', metalness: 0.8, roughness: 0.2 });
  const boardMat = new THREE.MeshStandardMaterial({ map: texture, roughness: 0.2 });

  const surface = new THREE.Mesh(new THREE.BoxGeometry(width, height, 0.04), boardMat);
  surface.castShadow = true;
  surface.receiveShadow = true;
  board.add(surface);

  // Outer frame borders
  const borderTop = new THREE.Mesh(new THREE.BoxGeometry(width + 0.08, 0.06, 0.06), frameMat);
  borderTop.position.y = height / 2;
  board.add(borderTop);

  const borderBottom = new THREE.Mesh(new THREE.BoxGeometry(width + 0.08, 0.06, 0.06), frameMat);
  borderBottom.position.y = -height / 2;
  board.add(borderBottom);

  // Marker tray at bottom
  const tray = new THREE.Mesh(new THREE.BoxGeometry(width * 0.7, 0.02, 0.12), frameMat);
  tray.position.set(0, -height / 2, 0.06);
  board.add(tray);

  return board;
}

// Office water cooler / hydration dispenser
export function createWaterDispenser(): THREE.Group {
  const dispenser = new THREE.Group();

  const whiteMat = new THREE.MeshStandardMaterial({ color: '#f8fafc', roughness: 0.4 });
  const bottleMat = new THREE.MeshPhysicalMaterial({
    color: '#38bdf8',
    transparent: true,
    opacity: 0.75,
    transmission: 0.85,
    roughness: 0.1,
  });

  // Base stand
  const base = new THREE.Mesh(new THREE.BoxGeometry(0.42, 1.0, 0.42), whiteMat);
  base.position.y = 0.5;
  base.castShadow = true;
  dispenser.add(base);

  // Water bottle on top
  const bottle = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.5, 16), bottleMat);
  bottle.position.y = 1.25;
  dispenser.add(bottle);

  const bottleCap = new THREE.Mesh(new THREE.SphereGeometry(0.16, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), bottleMat);
  bottleCap.position.y = 1.5;
  dispenser.add(bottleCap);

  return dispenser;
}

// Fabric acoustic desk divider partition
export function createDeskDivider(width = 1.6, height = 0.52, color = '#64748b'): THREE.Group {
  const divider = new THREE.Group();

  const fabricMat = new THREE.MeshStandardMaterial({ color, roughness: 0.9 });
  const bracketMat = new THREE.MeshStandardMaterial({ color: '#1e293b', metalness: 0.8, roughness: 0.3 });

  // Fabric panel
  const panel = new THREE.Mesh(new THREE.BoxGeometry(width, height, 0.04), fabricMat);
  panel.position.y = height / 2;
  panel.castShadow = true;
  panel.receiveShadow = true;
  divider.add(panel);

  // Mounting clamps
  for (const x of [-width * 0.35, width * 0.35]) {
    const clamp = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.08, 0.08), bracketMat);
    clamp.position.set(x, 0, 0);
    divider.add(clamp);
  }

  return divider;
}
