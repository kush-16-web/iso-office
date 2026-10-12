import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { useStore } from './store';
import { users } from './data';
import { clampWorldPoint, WORLD_POSITIONS } from './world';
import {
  buildCharacters,
  buildOfficeArchitecture,
  buildOfficeFurniture,
  buildOfficeLighting,
  loadOfficeAssets,
} from './world/officeBuilder';
import { CharacterMovementManager } from './world/characterController';

export function IsoCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#1c232f');

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    } catch {
      useStore.getState().setSceneState('unavailable');
      return;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;

    renderer.domElement.setAttribute(
      'aria-label',
      '3D office. Drag to pan, scroll to zoom, or select a coworker. Arrow keys pan the camera.'
    );
    renderer.domElement.setAttribute('role', 'application');
    renderer.domElement.tabIndex = 0;
    container.appendChild(renderer.domElement);

    const d = 15;
    const camera = new THREE.OrthographicCamera(-d, d, d, -d, 0.1, 400);
    const initial = useStore.getState().camera;
    // Classic isometric angle
    camera.position.set(initial.target.x + 28, 28, initial.target.z + 28);
    camera.zoom = initial.zoom;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(initial.target.x, 0, initial.target.z);
    controls.enableRotate = false;
    controls.screenSpacePanning = false;
    controls.minZoom = 0.65;
    controls.maxZoom = 2.4;
    controls.mouseButtons.LEFT = THREE.MOUSE.PAN;
    controls.mouseButtons.RIGHT = THREE.MOUSE.PAN;
    controls.touches.ONE = THREE.TOUCH.PAN;
    controls.touches.TWO = THREE.TOUCH.DOLLY_PAN;
    controls.update();

    // 1. Build Base Architecture and Lighting
    buildOfficeArchitecture(scene);
    buildOfficeLighting(scene);

    // 2. Selection indicator ring
    const ringGeom = new THREE.RingGeometry(0.7, 0.78, 36);
    const ringMat = new THREE.MeshBasicMaterial({
      color: '#38bdf8',
      transparent: true,
      opacity: 0.85,
      side: THREE.DoubleSide,
    });
    const ring = new THREE.Mesh(ringGeom, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.set(WORLD_POSITIONS.me.x, 0.16, WORLD_POSITIONS.me.z);
    ring.visible = false;
    scene.add(ring);

    // 3. Entity & Character references for raycasting and animation
    const characters: THREE.Group[] = [];
    let isDisposed = false;
    const movementManager = new CharacterMovementManager();

    // Load assets and build furniture + characters
    loadOfficeAssets()
      .then((cache) => {
        if (isDisposed) return;
        buildOfficeFurniture(scene, cache);
        const built = buildCharacters(scene, cache, users, movementManager);
        characters.push(...built.characters);
        useStore.getState().setSceneState('ready');
      })
      .catch((err) => {
        console.error('Error populating 3D office:', err);
        useStore.getState().setSceneState('ready');
      });

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const ground = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const projected = new THREE.Vector3();

    const projectProfile = (userId: string) => {
      const character = characters.find((mesh) => mesh.userData.userId === userId);
      if (!character) return null;
      character.getWorldPosition(projected);
      projected.y += 2.2;
      projected.project(camera);
      return {
        x: (projected.x * 0.5 + 0.5) * container.clientWidth + 18,
        y: (projected.y * -0.5 + 0.5) * container.clientHeight - 185,
      };
    };

    const updateProfile = () => {
      const selection = useStore.getState().selectedProfile;
      if (!selection) {
        ring.visible = false;
        return;
      }
      const charMesh = characters.find((mesh) => mesh.userData.userId === selection.userId);
      if (charMesh) {
        ring.position.set(charMesh.position.x, 0.16, charMesh.position.z);
        ring.visible = true;
      } else {
        const charPos = WORLD_POSITIONS[selection.userId];
        if (charPos) {
          ring.position.set(charPos.x, 0.16, charPos.z);
          ring.visible = true;
        }
      }
      if (!selection.anchored) return;
      const point = projectProfile(selection.userId);
      if (point && (Math.abs(point.x - selection.x) > 0.5 || Math.abs(point.y - selection.y) > 0.5)) {
        useStore.getState().moveProfile(point);
      }
    };

    const updateFootprint = () => {
      camera.updateMatrixWorld();
      const points = [
        [-1, -1],
        [1, -1],
        [1, 1],
        [-1, 1],
      ].map(([x, y]) => {
        raycaster.setFromCamera(new THREE.Vector2(x, y), camera);
        const hit = raycaster.ray.intersectPlane(ground, new THREE.Vector3());
        return { x: hit?.x ?? 0, z: hit?.z ?? 0 };
      });
      useStore.getState().setCameraFootprint(points);
      updateProfile();
    };

    let syncing = false;
    const onControlChange = () => {
      if (syncing) return;
      if (useStore.getState().cameraMode === 'follow') {
        useStore.getState().setCameraMode('overview');
      }
      const point = clampWorldPoint({ x: controls.target.x, z: controls.target.z });
      const dx = point.x - controls.target.x;
      const dz = point.z - controls.target.z;
      camera.position.x += dx;
      camera.position.z += dz;
      controls.target.set(point.x, 0, point.z);
      useStore.setState((state) => ({
        camera: { target: point, zoom: camera.zoom, revision: state.camera.revision },
      }));
      updateFootprint();
    };
    controls.addEventListener('change', onControlChange);

    const unsubscribe = useStore.subscribe((state, previous) => {
      if (state.camera.revision !== previous.camera.revision) {
        syncing = true;
        const dx = state.camera.target.x - controls.target.x;
        const dz = state.camera.target.z - controls.target.z;
        camera.position.x += dx;
        camera.position.z += dz;
        controls.target.set(state.camera.target.x, 0, state.camera.target.z);
        camera.zoom = state.camera.zoom;
        camera.updateProjectionMatrix();
        controls.update();
        syncing = false;
        updateFootprint();
      }
      if (state.selectedProfile?.userId !== previous.selectedProfile?.userId) {
        updateProfile();
      }
      // Handle Go to Person navigation triggers
      if (state.navigation.isNavigating && !previous.navigation.isNavigating && state.navigation.targetUserId) {
        movementManager.navigateToPerson(state.navigation.targetUserId, () => {
          useStore.getState().completeNavigation();
        });
      } else if (!state.navigation.isNavigating && previous.navigation.isNavigating) {
        if (state.cameraMode === 'focus') {
          movementManager.skipTravel();
        } else if (movementManager.isNavigating()) {
          movementManager.cancelTravel();
        }
      }
    });

    let pointerStart = { x: 0, y: 0 };
    const onPointerDown = (event: PointerEvent) => {
      pointerStart = { x: event.clientX, y: event.clientY };
    };

    const onClick = (event: MouseEvent) => {
      if (Math.hypot(event.clientX - pointerStart.x, event.clientY - pointerStart.y) > 5) return;
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.set(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        -((event.clientY - rect.top) / rect.height) * 2 + 1
      );
      raycaster.setFromCamera(mouse, camera);

      let picked: THREE.Object3D | null = raycaster.intersectObjects(characters, true)[0]?.object ?? null;
      while (picked && !picked.userData.userId) picked = picked.parent;
      if (picked?.userData.userId) {
        const point = projectProfile(picked.userData.userId);
        useStore.getState().selectProfile(picked.userData.userId, point ?? undefined);
      } else {
        useStore.getState().selectProfile(null);
      }
    };

    const onKey = (event: KeyboardEvent) => {
      const state = useStore.getState();
      const point = state.camera.target;
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) {
        event.preventDefault();
        state.focusWorld({
          x: point.x + (event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0),
          z: point.z + (event.key === 'ArrowDown' ? 1 : event.key === 'ArrowUp' ? -1 : 0),
        });
      }
      if (event.key === '+' || event.key === '-') {
        event.preventDefault();
        state.focusWorld(point, state.camera.zoom + (event.key === '+' ? 0.2 : -0.2));
      }
    };

    const onContextLost = (event: Event) => {
      event.preventDefault();
      useStore.getState().setSceneState('unavailable');
    };

    renderer.domElement.addEventListener('pointerdown', onPointerDown);
    renderer.domElement.addEventListener('click', onClick);
    renderer.domElement.addEventListener('keydown', onKey);
    renderer.domElement.addEventListener('webglcontextlost', onContextLost);

    const resize = () => {
      const width = Math.max(1, container.clientWidth);
      const height = Math.max(1, container.clientHeight);
      const aspect = width / height;
      camera.left = -d * aspect;
      camera.right = d * aspect;
      camera.top = d;
      camera.bottom = -d;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      updateFootprint();
    };

    const observer = new ResizeObserver(resize);
    observer.observe(container);
    resize();

    let frame = 0;
    const clock = new THREE.Clock();

    const animate = () => {
      frame = requestAnimationFrame(animate);
      if (document.hidden) return;
      const delta = Math.min(clock.getDelta(), 0.1);

      // Update movement manager (skeletal animations + path traversal + ambient life)
      movementManager.update(delta);

      // Smooth camera follow in Follow Avatar mode
      const camMode = useStore.getState().cameraMode;
      if (camMode === 'follow') {
        const avatarPos = movementManager.getLocalAvatarPosition();
        const factor = 1 - Math.exp(-4.5 * delta);
        controls.target.x += (avatarPos.x - controls.target.x) * factor;
        controls.target.z += (avatarPos.z - controls.target.z) * factor;
        camera.position.x = controls.target.x + 28;
        camera.position.z = controls.target.z + 28;
        controls.update();
        updateFootprint();
      }

      // Pulsing effect for selection ring
      if (ring.visible) {
        const time = clock.getElapsedTime();
        ring.scale.setScalar(1 + Math.sin(time * 3) * 0.05);
      }
      renderer.render(scene, camera);
    };

    animate();

    return () => {
      isDisposed = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      unsubscribe();
      controls.dispose();
      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      renderer.domElement.removeEventListener('click', onClick);
      renderer.domElement.removeEventListener('keydown', onKey);
      renderer.domElement.removeEventListener('webglcontextlost', onContextLost);

      const geometries = new Set<THREE.BufferGeometry>();
      const materials = new Set<THREE.Material>();
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          geometries.add(object.geometry);
          (Array.isArray(object.material) ? object.material : [object.material]).forEach((material) =>
            materials.add(material)
          );
        }
      });
      geometries.forEach((geometry) => geometry.dispose());
      materials.forEach((material) => material.dispose());
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return <div className="iso-canvas" ref={containerRef} />;
}
