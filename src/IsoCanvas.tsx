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
    const geoOpen = new THREE.BoxGeometry(16, 0.5, 16);
    const matOpen = new THREE.MeshStandardMaterial({ color: 0x93c5fd });
    const meshOpen = new THREE.Mesh(geoOpen, matOpen);
    meshOpen.position.set(0, -0.25, 0);
    meshOpen.receiveShadow = true;
    floorGroup.add(meshOpen);

    // Zone 2: Meeting Rooms (Gray/White)
    const geoMeeting = new THREE.BoxGeometry(8, 0.5, 16);
    const matMeeting = new THREE.MeshStandardMaterial({ color: 0xe5e7eb });
    const meshMeeting = new THREE.Mesh(geoMeeting, matMeeting);
    meshMeeting.position.set(-12, -0.25, 0);
    meshMeeting.receiveShadow = true;
    floorGroup.add(meshMeeting);

    // Zone 3: Lounge / Library (Amber)
    const geoLounge = new THREE.BoxGeometry(16, 0.5, 8);
    const matLounge = new THREE.MeshStandardMaterial({ color: 0xfcd34d });
    const meshLounge = new THREE.Mesh(geoLounge, matLounge);
    meshLounge.position.set(0, -0.25, -12);
    meshLounge.receiveShadow = true;
    floorGroup.add(meshLounge);

    // Furniture
    const createDesk = (x: number, z: number, rotationY: number = 0) => {
      const deskGroup = new THREE.Group();
      deskGroup.position.set(x, 0, z);
      deskGroup.rotation.y = rotationY;

      const topGeo = new THREE.BoxGeometry(2, 0.1, 1);
      const topMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
      const top = new THREE.Mesh(topGeo, topMat);
      top.position.y = 0.8;
      top.castShadow = true;
      top.receiveShadow = true;
      deskGroup.add(top);

      const legGeo = new THREE.BoxGeometry(0.1, 0.8, 0.1);
      const legMat = new THREE.MeshStandardMaterial({ color: 0x9ca3af });

      const leg1 = new THREE.Mesh(legGeo, legMat); leg1.position.set(-0.9, 0.4, -0.4); leg1.castShadow = true; deskGroup.add(leg1);
      const leg2 = new THREE.Mesh(legGeo, legMat); leg2.position.set(0.9, 0.4, -0.4); leg2.castShadow = true; deskGroup.add(leg2);
      const leg3 = new THREE.Mesh(legGeo, legMat); leg3.position.set(-0.9, 0.4, 0.4); leg3.castShadow = true; deskGroup.add(leg3);
      const leg4 = new THREE.Mesh(legGeo, legMat); leg4.position.set(0.9, 0.4, 0.4); leg4.castShadow = true; deskGroup.add(leg4);

      return deskGroup;
    };

    floorGroup.add(createDesk(2, 2.5));
    floorGroup.add(createDesk(0, -1.5));
    floorGroup.add(createDesk(4.5, 3, Math.PI / 2));
    floorGroup.add(createDesk(-2.5, 5, Math.PI / 2));

    const createMeetingTable = (x: number, z: number) => {
      const tableGroup = new THREE.Group();
      tableGroup.position.set(x, 0, z);

      const topGeo = new THREE.BoxGeometry(3, 0.1, 1.5);
      const topMat = new THREE.MeshStandardMaterial({ color: 0xd1d5db });
      const top = new THREE.Mesh(topGeo, topMat);
      top.position.y = 0.8;
      top.castShadow = true;
      top.receiveShadow = true;
      tableGroup.add(top);

      const baseGeo = new THREE.CylinderGeometry(0.3, 0.4, 0.8, 16);
      const baseMat = new THREE.MeshStandardMaterial({ color: 0x4b5563 });
      const base = new THREE.Mesh(baseGeo, baseMat);
      base.position.y = 0.4;
      base.castShadow = true;
      tableGroup.add(base);

      return tableGroup;
    };

    floorGroup.add(createMeetingTable(-12, 2));
    floorGroup.add(createMeetingTable(-12, -4));

    const createBookshelf = (x: number, z: number, rotationY: number) => {
      const shelfGroup = new THREE.Group();
      shelfGroup.position.set(x, 0, z);
      shelfGroup.rotation.y = rotationY;

      const geo = new THREE.BoxGeometry(2, 3, 0.5);
      const mat = new THREE.MeshStandardMaterial({ color: 0xd97706 });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.y = 1.5;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      shelfGroup.add(mesh);
      return shelfGroup;
    };

    floorGroup.add(createBookshelf(2, -15, 0));
    floorGroup.add(createBookshelf(-2, -15, 0));

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
    const characters: THREE.Group[] = [];
    const animatables: { mesh: THREE.Group, offset: number }[] = [];
    const bodyGeo = new THREE.CapsuleGeometry(0.3, 0.5, 4, 8);
    const headGeo = new THREE.SphereGeometry(0.25, 16, 16);

    const createCharacter = (user: User, x: number, z: number, color: number, pose: 'idle' | 'working' | 'meeting' = 'idle') => {
      const charGroup = new THREE.Group();

      const mat = new THREE.MeshStandardMaterial({ color });
      const body = new THREE.Mesh(bodyGeo, mat);
      body.castShadow = true;

      const head = new THREE.Mesh(headGeo, new THREE.MeshStandardMaterial({ color: 0xffccaa }));
      head.position.y = 0.65;
      head.castShadow = true;

      charGroup.add(body);
      charGroup.add(head);

      // Posturing
      if (pose === 'working') {
        // Sitting lower, slightly leaned forward
        charGroup.position.set(x, 0.4, z);
        body.rotation.x = 0.1;
      } else {
        // Standing
        charGroup.position.set(x, 0.6, z);
      }

      charGroup.userData = { user }; // Store user data for raycasting

      // Status dot
      const statusColor = user.status === 'online' ? 0x22c55e : user.status === 'in-call' ? 0x3b82f6 : 0x9ca3af;
      const dotGeo = new THREE.SphereGeometry(0.1);
      const dotMat = new THREE.MeshBasicMaterial({ color: statusColor });
      const dot = new THREE.Mesh(dotGeo, dotMat);
      dot.position.set(0, 1.2, 0); // Above head
      charGroup.add(dot);

      scene.add(charGroup);
      characters.push(charGroup);
      animatables.push({ mesh: charGroup, offset: Math.random() * Math.PI * 2 });
      return charGroup;
    };

    // Current User
    const meMesh = createCharacter(currentUser, 2, 2, 0x1f2937, 'working'); // Dark gray, at desk

    // Proximity Ring (around current user)
    const ringGeo = new THREE.RingGeometry(4, 4.2, 32);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x94a3b8, transparent: true, opacity: 0.3, side: THREE.DoubleSide });
    const proximityRing = new THREE.Mesh(ringGeo, ringMat);
    proximityRing.rotation.x = -Math.PI / 2;
    proximityRing.position.y = -0.3; // Offset to match sitting height
    meMesh.add(proximityRing); // Attach to player

    // Clustering logic for meeting rooms
    const clusterCharacters = (users: User[], centerX: number, centerZ: number, radius: number) => {
      users.forEach((user, index) => {
        const angle = (index / users.length) * Math.PI * 2;
        const x = centerX + Math.cos(angle) * radius;
        const z = centerZ + Math.sin(angle) * radius;
        // Determine color based on user index or fixed colors for demo
        const colors = [0xf59e0b, 0x8b5cf6, 0xec4899, 0x06b6d4];
        const color = colors[index % colors.length];
        const charMesh = createCharacter(user, x, z, color, 'meeting');
        // Face the center of the table
        charMesh.lookAt(centerX, charMesh.position.y, centerZ);
      });
    };

    // Coworkers (working at desks)
    createCharacter(coworkers[0], 0, -1.5, 0xef4444, 'working'); // Red
    createCharacter(coworkers[1], 4.5, 3, 0x3b82f6, 'working'); // Blue
    createCharacter(coworkers[2], -2.5, 5, 0x10b981, 'working'); // Green

    // Coworkers (clustered in meeting room)
    const meetingUsers = [coworkers[3], coworkers[4]];
    clusterCharacters(meetingUsers, -12, 2, 1.5);

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

      const time = performance.now() * 0.001;

      // Subtle idle bobbing animation
      animatables.forEach((anim) => {
        // Adjust the bobbing magnitude slightly based on pose
        const magnitude = anim.mesh.position.y > 0.5 ? 0.05 : 0.02; // standing vs sitting
        const baseY = anim.mesh.position.y > 0.5 ? 0.6 : 0.4;
        anim.mesh.position.y = baseY + Math.sin(time * 2 + anim.offset) * magnitude;
      });

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
