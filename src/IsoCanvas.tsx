import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useStore, type User } from './store';
import { ProfileCard } from './ProfileCard';

export const IsoCanvas = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { coworkers, currentUser } = useStore();

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [cardPosition, setCardPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!containerRef.current) return;

    // --- Scene Setup ---
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf3f4f6); // Match bg-main

    // --- Isometric Camera Setup ---
    const aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
    const d = 15;
    const camera = new THREE.OrthographicCamera(-d * aspect, d * aspect, d, -d, 1, 1000);

    // Isometric angle: 45 deg Y, ~35.264 deg X
    camera.position.set(20, 20, 20);
    camera.lookAt(scene.position);

    // --- Renderer Setup ---
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    containerRef.current.appendChild(renderer.domElement);

    // --- Lighting ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(10, 20, 10);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.left = -20;
    dirLight.shadow.camera.right = 20;
    dirLight.shadow.camera.top = 20;
    dirLight.shadow.camera.bottom = -20;
    scene.add(dirLight);

    // --- Environment / Floors ---
    const floorGroup = new THREE.Group();

    // Zone 1: Central Open Space (Blue)
    const geoOpen = new THREE.PlaneGeometry(16, 16);
    const matOpen = new THREE.MeshStandardMaterial({ color: 0x93c5fd });
    const meshOpen = new THREE.Mesh(geoOpen, matOpen);
    meshOpen.rotation.x = -Math.PI / 2;
    meshOpen.position.set(0, 0, 0);
    meshOpen.receiveShadow = true;
    floorGroup.add(meshOpen);

    // Zone 2: Meeting Rooms (Gray/White)
    const geoMeeting = new THREE.PlaneGeometry(8, 16);
    const matMeeting = new THREE.MeshStandardMaterial({ color: 0xe5e7eb });
    const meshMeeting = new THREE.Mesh(geoMeeting, matMeeting);
    meshMeeting.rotation.x = -Math.PI / 2;
    meshMeeting.position.set(-12, 0, 0);
    meshMeeting.receiveShadow = true;
    floorGroup.add(meshMeeting);

    // Zone 3: Lounge / Library (Amber)
    const geoLounge = new THREE.PlaneGeometry(16, 8);
    const matLounge = new THREE.MeshStandardMaterial({ color: 0xfcd34d });
    const meshLounge = new THREE.Mesh(geoLounge, matLounge);
    meshLounge.rotation.x = -Math.PI / 2;
    meshLounge.position.set(0, 0, -12);
    meshLounge.receiveShadow = true;
    floorGroup.add(meshLounge);

    scene.add(floorGroup);

    // Walls for Meeting Rooms (Glass)
    const wallGeo = new THREE.BoxGeometry(8, 2, 0.2);
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff, transparent: true, opacity: 0.3, roughness: 0.1, transmission: 0.9
    });
    const wall1 = new THREE.Mesh(wallGeo, glassMat);
    wall1.position.set(-12, 1, 8);
    scene.add(wall1);

    // --- Characters ---
    const characters: THREE.Mesh[] = [];
    const characterGeo = new THREE.CapsuleGeometry(0.3, 0.6, 4, 8);

    const createCharacter = (user: User, x: number, z: number, color: number) => {
      const mat = new THREE.MeshStandardMaterial({ color });
      const mesh = new THREE.Mesh(characterGeo, mat);
      mesh.position.set(x, 0.6, z); // half height
      mesh.castShadow = true;
      mesh.userData = { user }; // Store user data for raycasting

      // Status dot
      const statusColor = user.status === 'online' ? 0x22c55e : user.status === 'in-call' ? 0x3b82f6 : 0x9ca3af;
      const dotGeo = new THREE.SphereGeometry(0.1);
      const dotMat = new THREE.MeshBasicMaterial({ color: statusColor });
      const dot = new THREE.Mesh(dotGeo, dotMat);
      dot.position.set(0, 1.2, 0); // Above head
      mesh.add(dot);

      scene.add(mesh);
      characters.push(mesh);
      return mesh;
    };

    // Current User
    const meMesh = createCharacter(currentUser, 2, 2, 0x1f2937); // Dark gray

    // Proximity Ring (around current user)
    const ringGeo = new THREE.RingGeometry(4, 4.2, 32);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x94a3b8, transparent: true, opacity: 0.3, side: THREE.DoubleSide });
    const proximityRing = new THREE.Mesh(ringGeo, ringMat);
    proximityRing.rotation.x = -Math.PI / 2;
    proximityRing.position.y = 0.01; // Slightly above ground
    meMesh.add(proximityRing); // Attach to player

    // Coworkers
    createCharacter(coworkers[0], 0, -2, 0xef4444); // Red
    createCharacter(coworkers[1], 4, 3, 0x3b82f6); // Blue
    createCharacter(coworkers[2], -2, 5, 0x10b981); // Green
    createCharacter(coworkers[3], -12, 2, 0xf59e0b); // Meeting room
    createCharacter(coworkers[4], -12, -2, 0x8b5cf6); // Meeting room

    // --- Raycaster Setup ---
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onMouseClick = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);

      // Intersect characters
      const intersects = raycaster.intersectObjects(characters, false);

      if (intersects.length > 0) {
        const clickedMesh = intersects[0].object as THREE.Mesh;
        const user = clickedMesh.userData.user as User;

        setSelectedUser(user);

        // Calculate 2D position for the HTML card
        const vec = new THREE.Vector3();
        clickedMesh.getWorldPosition(vec);
        vec.y += 1.5; // Offset above head
        vec.project(camera);

        const x = (vec.x * .5 + .5) * rect.width;
        const y = (vec.y * -.5 + .5) * rect.height;

        setCardPosition({ x, y });
      } else {
        setSelectedUser(null);
      }
    };

    renderer.domElement.addEventListener('click', onMouseClick);
    // Use pointer down/up logic later if we want to drag camera

    // --- Animation Loop ---
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // Update card position if a user is selected (in case we add camera panning later)
      if (selectedUser) {
        const selectedMesh = characters.find(c => c.userData.user.id === selectedUser.id);
        if (selectedMesh) {
          const vec = new THREE.Vector3();
          selectedMesh.getWorldPosition(vec);
          vec.y += 1.5;
          vec.project(camera);
          const rect = renderer.domElement.getBoundingClientRect();
          setCardPosition({
            x: (vec.x * .5 + .5) * rect.width,
            y: (vec.y * -.5 + .5) * rect.height
          });
        }
      }

      renderer.render(scene, camera);
    };
    animate();

    // --- Resize Handler ---
    const handleResize = () => {
      if (!containerRef.current) return;
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      const newAspect = width / height;

      camera.left = -d * newAspect;
      camera.right = d * newAspect;
      camera.top = d;
      camera.bottom = -d;
      camera.updateProjectionMatrix();

      renderer.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);

    // --- Cleanup ---
    const currentContainer = containerRef.current;
    const currentRenderer = renderer;
    return () => {
      window.removeEventListener('resize', handleResize);
      currentRenderer.domElement.removeEventListener('click', onMouseClick);
      cancelAnimationFrame(animationFrameId);
      if (currentContainer && currentContainer.contains(currentRenderer.domElement)) {
        currentContainer.removeChild(currentRenderer.domElement);
      }
      currentRenderer.dispose();
      // Need a more thorough dispose function in production
    };
  }, [selectedUser, currentUser, coworkers]); // dependency on selectedUser so closure has it for resize/clicks

  return (
    <div className="w-full h-full relative" ref={containerRef}>
      {selectedUser && (
        <ProfileCard
          user={selectedUser}
          position={cardPosition}
          onClose={() => setSelectedUser(null)}
        />
      )}
    </div>
  );
};
