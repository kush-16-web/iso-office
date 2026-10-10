import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { useStore } from './store';
import { users } from './data';
import { clampWorldPoint, WORLD_FLOORS, WORLD_POSITIONS } from './world';

// Pass 1 preserves the prototype's floors, desks, tables, bookshelves and character
// geometry. The reference's detailed architecture and rigged humans belong to Pass 2.
export function IsoCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#303845');
    let renderer: THREE.WebGLRenderer;
    try { renderer = new THREE.WebGLRenderer({ antialias: true }); }
    catch { useStore.getState().setSceneState('unavailable'); return; }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.domElement.setAttribute('aria-label', '3D office. Drag to pan, scroll to zoom, or select a coworker. Arrow keys pan the camera.');
    renderer.domElement.setAttribute('role', 'application');
    renderer.domElement.tabIndex = 0;
    container.appendChild(renderer.domElement);
    const d = 15;
    const camera = new THREE.OrthographicCamera(-d, d, d, -d, .1, 300);
    const initial = useStore.getState().camera;
    camera.position.set(initial.target.x + 24, 24, initial.target.z + 24);
    camera.zoom = initial.zoom;
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(initial.target.x, 0, initial.target.z);
    controls.enableRotate = false;
    controls.screenSpacePanning = false;
    controls.minZoom = .65; controls.maxZoom = 2.4;
    controls.mouseButtons.LEFT = THREE.MOUSE.PAN;
    controls.mouseButtons.RIGHT = THREE.MOUSE.PAN;
    controls.touches.ONE = THREE.TOUCH.PAN;
    controls.touches.TWO = THREE.TOUCH.DOLLY_PAN;
    controls.update();
    scene.add(new THREE.AmbientLight(0xffffff, 1.5));
    const sun = new THREE.DirectionalLight(0xfff4df, 2.2);
    sun.position.set(-5, 24, 12); sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    Object.assign(sun.shadow.camera, { left: -24, right: 24, top: 24, bottom: -24 });
    sun.shadow.normalBias = .035;
    scene.add(sun);
    const floorGroup = new THREE.Group();
    for (const floor of WORLD_FLOORS) {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(floor.width, .5, floor.depth), new THREE.MeshStandardMaterial({ color: floor.color, roughness: .9 }));
      mesh.position.set(floor.x, -.25, floor.z); mesh.receiveShadow = true; floorGroup.add(mesh);
    }
    const deskTopGeometry = new THREE.BoxGeometry(2, .1, 1);
    const deskLegGeometry = new THREE.BoxGeometry(.1, .8, .1);
    const deskMaterial = new THREE.MeshStandardMaterial({ color: '#f8fafb' });
    const metalMaterial = new THREE.MeshStandardMaterial({ color: '#8995a5', roughness: .55 });
    const createDesk = (x: number, z: number, rotation = 0) => {
      const group = new THREE.Group(); group.position.set(x, 0, z); group.rotation.y = rotation;
      const top = new THREE.Mesh(deskTopGeometry, deskMaterial); top.position.y = .8; top.castShadow = true; top.receiveShadow = true; group.add(top);
      for (const lx of [-.9, .9]) for (const lz of [-.4, .4]) { const leg = new THREE.Mesh(deskLegGeometry, metalMaterial); leg.position.set(lx, .4, lz); leg.castShadow = true; group.add(leg); }
      return group;
    };
    floorGroup.add(createDesk(2, 2.5), createDesk(0, -1.5), createDesk(4.5, 3, Math.PI / 2), createDesk(-2.5, 5, Math.PI / 2));
    const tableGeometry = new THREE.BoxGeometry(3, .1, 1.5), baseGeometry = new THREE.CylinderGeometry(.3, .4, .8, 16);
    for (const z of [2, -4]) {
      const group = new THREE.Group(); group.position.set(-12, 0, z);
      const top = new THREE.Mesh(tableGeometry, deskMaterial); top.position.y = .8; top.castShadow = true; group.add(top);
      const base = new THREE.Mesh(baseGeometry, metalMaterial); base.position.y = .4; base.castShadow = true; group.add(base); floorGroup.add(group);
    }
    const shelfGeometry = new THREE.BoxGeometry(2, 3, .5), shelfMaterial = new THREE.MeshStandardMaterial({ color: '#d97706' });
    for (const x of [-2, 2]) { const shelf = new THREE.Mesh(shelfGeometry, shelfMaterial); shelf.position.set(x, 1.5, -15); shelf.castShadow = true; floorGroup.add(shelf); }
    scene.add(floorGroup);
    const glass = new THREE.Mesh(new THREE.BoxGeometry(8, 2, .2), new THREE.MeshPhysicalMaterial({ color: '#dcebf3', transparent: true, opacity: .3, roughness: .1, transmission: .5 }));
    glass.position.set(-12, 1, 8); scene.add(glass);
    const bodyGeometry = new THREE.CapsuleGeometry(.3, .5, 4, 8), headGeometry = new THREE.SphereGeometry(.25, 16, 16), statusGeometry = new THREE.SphereGeometry(.09, 8, 8);
    const characters: THREE.Group[] = [];
    users.forEach((user, i) => {
      const position = WORLD_POSITIONS[user.id], group = new THREE.Group();
      const body = new THREE.Mesh(bodyGeometry, new THREE.MeshStandardMaterial({ color: user.portrait.shirt })); body.castShadow = true;
      const head = new THREE.Mesh(headGeometry, new THREE.MeshStandardMaterial({ color: user.portrait.skin })); head.position.y = .65; head.castShadow = true;
      const status = new THREE.Mesh(statusGeometry, new THREE.MeshBasicMaterial({ color: user.status === 'online' ? '#00a77b' : user.status === 'in-call' ? '#418bed' : '#a3a7ad' })); status.position.y = 1.15;
      group.add(body, head, status); group.position.set(position.x, .6, position.z);
      group.userData = { userId: user.id, offset: i * 1.2 };
      scene.add(group); characters.push(group);
    });
    const ring = new THREE.Mesh(new THREE.RingGeometry(4, 4.08, 48), new THREE.MeshBasicMaterial({ color: '#dce7f6', transparent: true, opacity: .3, side: THREE.DoubleSide }));
    ring.rotation.x = -Math.PI / 2; ring.position.set(WORLD_POSITIONS.me.x, .015, WORLD_POSITIONS.me.z); scene.add(ring);
    const raycaster = new THREE.Raycaster(), mouse = new THREE.Vector2(), ground = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const projected = new THREE.Vector3();
    const projectProfile = (userId: string) => {
      const character = characters.find(mesh => mesh.userData.userId === userId);
      if (!character) return null;
      character.getWorldPosition(projected); projected.y += 1.2; projected.project(camera);
      return { x: (projected.x * .5 + .5) * container.clientWidth + 18, y: (projected.y * -.5 + .5) * container.clientHeight - 185 };
    };
    const updateProfile = () => {
      const selection = useStore.getState().selectedProfile;
      if (!selection?.anchored) return;
      const point = projectProfile(selection.userId);
      if (point && (Math.abs(point.x - selection.x) > .5 || Math.abs(point.y - selection.y) > .5)) useStore.getState().moveProfile(point);
    };
    const updateFootprint = () => {
      camera.updateMatrixWorld();
      const points = [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([x, y]) => {
        raycaster.setFromCamera(new THREE.Vector2(x, y), camera);
        const hit = raycaster.ray.intersectPlane(ground, new THREE.Vector3());
        return { x: hit?.x ?? 0, z: hit?.z ?? 0 };
      });
      useStore.getState().setCameraFootprint(points); updateProfile();
    };
    let syncing = false;
    const onControlChange = () => {
      if (syncing) return;
      const point = clampWorldPoint({ x: controls.target.x, z: controls.target.z });
      const dx = point.x - controls.target.x, dz = point.z - controls.target.z;
      camera.position.x += dx; camera.position.z += dz; controls.target.set(point.x, 0, point.z);
      useStore.setState(state => ({ camera: { target: point, zoom: camera.zoom, revision: state.camera.revision } }));
      updateFootprint();
    };
    controls.addEventListener('change', onControlChange);
    const unsubscribe = useStore.subscribe((state, previous) => {
      if (state.camera.revision !== previous.camera.revision) {
        syncing = true;
        const dx = state.camera.target.x - controls.target.x, dz = state.camera.target.z - controls.target.z;
        camera.position.x += dx; camera.position.z += dz;
        controls.target.set(state.camera.target.x, 0, state.camera.target.z); camera.zoom = state.camera.zoom; camera.updateProjectionMatrix(); controls.update(); syncing = false;
        updateFootprint();
      }
    });
    let pointerStart = { x: 0, y: 0 };
    const onPointerDown = (event: PointerEvent) => { pointerStart = { x: event.clientX, y: event.clientY }; };
    const onClick = (event: MouseEvent) => {
      if (Math.hypot(event.clientX - pointerStart.x, event.clientY - pointerStart.y) > 5) return;
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.set((event.clientX - rect.left) / rect.width * 2 - 1, -(event.clientY - rect.top) / rect.height * 2 + 1);
      raycaster.setFromCamera(mouse, camera);
      // Groups do not raycast themselves. Recurse into meshes and walk to the user group.
      let picked: THREE.Object3D | null = raycaster.intersectObjects(characters, true)[0]?.object ?? null;
      while (picked && !picked.userData.userId) picked = picked.parent;
      if (picked?.userData.userId) { const point = projectProfile(picked.userData.userId); useStore.getState().selectProfile(picked.userData.userId, point ?? undefined); }
      else useStore.getState().selectProfile(null);
    };
    const onKey = (event: KeyboardEvent) => {
      const state = useStore.getState(), point = state.camera.target;
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) { event.preventDefault(); state.focusWorld({ x: point.x + (event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0), z: point.z + (event.key === 'ArrowDown' ? 1 : event.key === 'ArrowUp' ? -1 : 0) }); }
      if (event.key === '+' || event.key === '-') { event.preventDefault(); state.focusWorld(point, state.camera.zoom + (event.key === '+' ? .2 : -.2)); }
    };
    const onContextLost = (event: Event) => { event.preventDefault(); useStore.getState().setSceneState('unavailable'); };
    renderer.domElement.addEventListener('pointerdown', onPointerDown);
    renderer.domElement.addEventListener('click', onClick);
    renderer.domElement.addEventListener('keydown', onKey);
    renderer.domElement.addEventListener('webglcontextlost', onContextLost);
    const resize = () => {
      const width = Math.max(1, container.clientWidth), height = Math.max(1, container.clientHeight), aspect = width / height;
      camera.left = -d * aspect; camera.right = d * aspect; camera.top = d; camera.bottom = -d; camera.updateProjectionMatrix();
      renderer.setSize(width, height); updateFootprint();
    };
    const observer = new ResizeObserver(resize); observer.observe(container); resize();
    let frame = 0;
    const animate = () => {
      frame = requestAnimationFrame(animate);
      if (document.hidden) return;
      const time = performance.now() * .001;
      characters.forEach(character => { character.position.y = .6 + Math.sin(time * 2 + character.userData.offset) * .02; });
      renderer.render(scene, camera);
    };
    animate(); useStore.getState().setSceneState('ready');
    return () => {
      cancelAnimationFrame(frame); observer.disconnect(); unsubscribe(); controls.dispose();
      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      renderer.domElement.removeEventListener('click', onClick);
      renderer.domElement.removeEventListener('keydown', onKey);
      renderer.domElement.removeEventListener('webglcontextlost', onContextLost);
      const geometries = new Set<THREE.BufferGeometry>(), materials = new Set<THREE.Material>();
      scene.traverse(object => { if (object instanceof THREE.Mesh) { geometries.add(object.geometry); (Array.isArray(object.material) ? object.material : [object.material]).forEach(material => materials.add(material)); } });
      geometries.forEach(geometry => geometry.dispose()); materials.forEach(material => material.dispose());
      sun.shadow.map?.dispose(); renderer.dispose(); renderer.domElement.remove();
    };
  }, []);
  return <div className="iso-canvas" ref={containerRef}/>;
}
