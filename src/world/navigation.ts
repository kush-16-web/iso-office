import type { Point } from '../types';

export interface OfficeAnchor {
  id: string;
  userId: string;
  type: 'seated' | 'standing';
  position: { x: number; y: number; z: number };
  rotation: number;
  approachPoint: Point;
  activity: 'desk_work' | 'meeting' | 'lounge' | 'standing_chat' | 'reading';
}

// Fixed, deterministic anchor placements matching actual desks, chairs, and conversation zones
export const OFFICE_ANCHORS: Record<string, OfficeAnchor> = {
  me: {
    id: 'anchor_me',
    userId: 'me',
    type: 'seated',
    position: { x: 2, y: 0.42, z: 3.35 },
    rotation: Math.PI, // Facing workstation screens at z: 2.6
    approachPoint: { x: 2, z: 4.3 },
    activity: 'desk_work',
  },
  gregoria: {
    id: 'anchor_gregoria',
    userId: 'gregoria',
    type: 'seated',
    position: { x: 0, y: 0.42, z: -1.15 },
    rotation: Math.PI, // Facing workstation screens at z: -1.9
    approachPoint: { x: 0, z: -0.1 },
    activity: 'desk_work',
  },
  christeen: {
    id: 'anchor_christeen',
    userId: 'christeen',
    type: 'seated',
    position: { x: 5.55, y: 0.42, z: 3 },
    rotation: -Math.PI / 2, // Facing workstation screens at x: 4.8
    approachPoint: { x: 5.55, z: 4.2 },
    activity: 'desk_work',
  },
  deane: {
    id: 'anchor_deane',
    userId: 'deane',
    type: 'seated',
    position: { x: -3.25, y: 0.42, z: 4.8 },
    rotation: Math.PI / 2, // Facing workstation screens at x: -2.5
    approachPoint: { x: -3.25, z: 3.6 },
    activity: 'desk_work',
  },
  elisa: {
    id: 'anchor_elisa',
    userId: 'elisa',
    type: 'seated',
    position: { x: -10.8, y: 0.42, z: 2 },
    rotation: -Math.PI / 2, // Facing meeting conference table at x: -12
    approachPoint: { x: -9.5, z: 2 },
    activity: 'meeting',
  },
  wilbert: {
    id: 'anchor_wilbert',
    userId: 'wilbert',
    type: 'seated',
    position: { x: -13.2, y: 0.42, z: 2 },
    rotation: Math.PI / 2, // Facing meeting conference table at x: -12
    approachPoint: { x: -14.5, z: 2 },
    activity: 'meeting',
  },
  kaeya: {
    id: 'anchor_kaeya',
    userId: 'kaeya',
    type: 'seated',
    position: { x: -12, y: 0.42, z: -3.8 },
    rotation: Math.PI, // Facing round collaboration table at z: -5
    approachPoint: { x: -10.5, z: -3.8 },
    activity: 'meeting',
  },
  edgar: {
    id: 'anchor_edgar',
    userId: 'edgar',
    type: 'seated',
    position: { x: -12, y: 0.42, z: -6.2 },
    rotation: 0, // Facing round collaboration table at z: -5
    approachPoint: { x: -10.5, z: -6.2 },
    activity: 'meeting',
  },
  arturo: {
    id: 'anchor_arturo',
    userId: 'arturo',
    type: 'seated',
    position: { x: 5.1, y: 0.42, z: -4 },
    rotation: -Math.PI / 2, // Facing lounge coffee table at x: 4, z: -4
    approachPoint: { x: 4.0, z: -2.6 },
    activity: 'lounge',
  },
  keely: {
    id: 'anchor_keely',
    userId: 'keely',
    type: 'standing',
    position: { x: 2.2, y: 0.12, z: -4.8 },
    rotation: Math.PI / 4, // Standing conversation posture facing Arturo & table
    approachPoint: { x: 2.2, z: -3.8 },
    activity: 'standing_chat',
  },
  sephora: {
    id: 'anchor_sephora',
    userId: 'sephora',
    type: 'seated',
    position: { x: 4, y: 0.42, z: -10.5 },
    rotation: -Math.PI / 4, // Relaxed reading chair facing center of archive
    approachPoint: { x: 2.8, z: -10.5 },
    activity: 'reading',
  },
  vanessa: {
    id: 'anchor_vanessa',
    userId: 'vanessa',
    type: 'seated',
    position: { x: -2, y: 0.42, z: -12 },
    rotation: Math.PI / 4, // Relaxed lounge chair in library
    approachPoint: { x: -0.8, z: -12 },
    activity: 'reading',
  },
  denise: {
    id: 'anchor_denise',
    userId: 'denise',
    type: 'standing',
    position: { x: -5, y: 0.12, z: 1 },
    rotation: Math.PI / 3, // Welcoming near hallway partition
    approachPoint: { x: -4, z: 1 },
    activity: 'standing_chat',
  },
};

export interface NavNode {
  id: string;
  x: number;
  z: number;
  neighbors: string[];
}

// High-fidelity waypoint network covering all corridors, doors, and clear walkways
export const NAV_GRAPH: Record<string, NavNode> = {
  // Main Open Office Central Spine
  wp_open_center: { id: 'wp_open_center', x: 0, z: 1.5, neighbors: ['wp_open_north', 'wp_open_south', 'wp_open_east', 'wp_open_west'] },
  wp_open_north: { id: 'wp_open_north', x: 0, z: -0.2, neighbors: ['wp_open_center', 'wp_open_northeast', 'wp_open_northwest', 'wp_hall_lib_enter'] },
  wp_open_south: { id: 'wp_open_south', x: 0, z: 3.5, neighbors: ['wp_open_center', 'wp_open_southeast', 'wp_open_southwest'] },
  wp_open_east: { id: 'wp_open_east', x: 2, z: 1.5, neighbors: ['wp_open_center', 'wp_desk_me_front', 'wp_open_northeast', 'wp_open_southeast'] },
  wp_open_west: { id: 'wp_open_west', x: -3.5, z: 1.5, neighbors: ['wp_open_center', 'wp_corridor_door', 'wp_open_southwest', 'wp_open_northwest'] },

  // Open Office Sub-Zones & Workstation Clearances
  wp_open_northeast: { id: 'wp_open_northeast', x: 2, z: -0.2, neighbors: ['wp_open_north', 'wp_open_east', 'wp_amber_entry'] },
  wp_open_southeast: { id: 'wp_open_southeast', x: 2, z: 4.3, neighbors: ['wp_open_south', 'wp_open_east', 'wp_desk_christeen_approach'] },
  wp_open_southwest: { id: 'wp_open_southwest', x: -3.25, z: 3.6, neighbors: ['wp_open_south', 'wp_open_west', 'wp_desk_deane_approach'] },
  wp_open_northwest: { id: 'wp_open_northwest', x: -3.5, z: -0.2, neighbors: ['wp_open_north', 'wp_open_west'] },

  // Workstation approach nodes
  wp_desk_me_front: { id: 'wp_desk_me_front', x: 2, z: 4.3, neighbors: ['wp_open_east', 'wp_open_southeast'] },
  wp_desk_gregoria_approach: { id: 'wp_desk_gregoria_approach', x: 0, z: -0.1, neighbors: ['wp_open_north'] },
  wp_desk_christeen_approach: { id: 'wp_desk_christeen_approach', x: 5.55, z: 4.2, neighbors: ['wp_open_southeast', 'wp_east_aisle'] },
  wp_east_aisle: { id: 'wp_east_aisle', x: 5.55, z: 1.5, neighbors: ['wp_desk_christeen_approach', 'wp_amber_entry'] },
  wp_desk_deane_approach: { id: 'wp_desk_deane_approach', x: -3.25, z: 3.6, neighbors: ['wp_open_southwest'] },

  // Corridor connecting Open Office to West Meeting Room (Clearance through doorway at x: -8, z: 0.5)
  wp_corridor_door: { id: 'wp_corridor_door', x: -5, z: 0.8, neighbors: ['wp_open_west', 'wp_doorway_trans'] },
  wp_doorway_trans: { id: 'wp_doorway_trans', x: -8, z: 0.8, neighbors: ['wp_corridor_door', 'wp_meet_hall'] },
  wp_meet_hall: { id: 'wp_meet_hall', x: -10, z: 0.8, neighbors: ['wp_doorway_trans', 'wp_meet_center', 'wp_meet_south_aisle'] },

  // Meeting Room Interior (West Wing)
  wp_meet_center: { id: 'wp_meet_center', x: -10, z: 2, neighbors: ['wp_meet_hall', 'wp_meet_east_seat', 'wp_meet_north_pod'] },
  wp_meet_east_seat: { id: 'wp_meet_east_seat', x: -9.5, z: 2, neighbors: ['wp_meet_center'] },
  wp_meet_west_seat: { id: 'wp_meet_west_seat', x: -14.5, z: 2, neighbors: ['wp_meet_north_pod', 'wp_meet_south_pod'] },
  wp_meet_north_pod: { id: 'wp_meet_north_pod', x: -12, z: 4.5, neighbors: ['wp_meet_center', 'wp_meet_west_seat'] },
  wp_meet_south_aisle: { id: 'wp_meet_south_aisle', x: -10.5, z: -1.5, neighbors: ['wp_meet_hall', 'wp_meet_pod_center'] },
  wp_meet_pod_center: { id: 'wp_meet_pod_center', x: -10.5, z: -5.0, neighbors: ['wp_meet_south_aisle', 'wp_meet_kaeya_seat', 'wp_meet_edgar_seat', 'wp_patio_connect'] },
  wp_meet_kaeya_seat: { id: 'wp_meet_kaeya_seat', x: -10.5, z: -3.8, neighbors: ['wp_meet_pod_center'] },
  wp_meet_edgar_seat: { id: 'wp_meet_edgar_seat', x: -10.5, z: -6.2, neighbors: ['wp_meet_pod_center'] },

  // Patio Lounge & Coffee Station (Northwest wing: x: -12, z: -12)
  wp_patio_connect: { id: 'wp_patio_connect', x: -11, z: -8.5, neighbors: ['wp_meet_pod_center', 'wp_patio_center'] },
  wp_patio_center: { id: 'wp_patio_center', x: -12, z: -11.5, neighbors: ['wp_patio_connect', 'wp_patio_coffee', 'wp_lib_patio_bridge'] },
  wp_patio_coffee: { id: 'wp_patio_coffee', x: -14, z: -13, neighbors: ['wp_patio_center'] },

  // Amber Collaboration Room (South-East: x: 4, z: -4)
  wp_amber_entry: { id: 'wp_amber_entry', x: 2.2, z: -2.0, neighbors: ['wp_open_northeast', 'wp_amber_interior'] },
  wp_amber_interior: { id: 'wp_amber_interior', x: 3.5, z: -3.2, neighbors: ['wp_amber_entry', 'wp_amber_arturo_seat', 'wp_amber_keely_chat'] },
  wp_amber_arturo_seat: { id: 'wp_amber_arturo_seat', x: 4.0, z: -2.6, neighbors: ['wp_amber_interior'] },
  wp_amber_keely_chat: { id: 'wp_amber_keely_chat', x: 2.2, z: -3.8, neighbors: ['wp_amber_interior'] },

  // Executive Library & Archive (North Wing: z: -10 to -15)
  wp_hall_lib_enter: { id: 'wp_hall_lib_enter', x: 0, z: -5.5, neighbors: ['wp_open_north', 'wp_lib_foyer'] },
  wp_lib_foyer: { id: 'wp_lib_foyer', x: 0, z: -9.5, neighbors: ['wp_hall_lib_enter', 'wp_lib_center', 'wp_lib_west_aisle'] },
  wp_lib_center: { id: 'wp_lib_center', x: 1.5, z: -11.5, neighbors: ['wp_lib_foyer', 'wp_lib_sephora_seat', 'wp_lib_vanessa_seat'] },
  wp_lib_sephora_seat: { id: 'wp_lib_sephora_seat', x: 2.8, z: -10.5, neighbors: ['wp_lib_center'] },
  wp_lib_vanessa_seat: { id: 'wp_lib_vanessa_seat', x: -0.8, z: -12.0, neighbors: ['wp_lib_center'] },
  wp_lib_west_aisle: { id: 'wp_lib_west_aisle', x: -4.5, z: -11.5, neighbors: ['wp_lib_foyer', 'wp_lib_patio_bridge'] },
  wp_lib_patio_bridge: { id: 'wp_lib_patio_bridge', x: -8.0, z: -11.5, neighbors: ['wp_lib_west_aisle', 'wp_patio_center'] },
};

// Find closest navigation node to any point in the world
export function findClosestNavNode(point: Point): string {
  let closestId = 'wp_open_center';
  let minDistance = Infinity;

  for (const [id, node] of Object.entries(NAV_GRAPH)) {
    const dist = (node.x - point.x) ** 2 + (node.z - point.z) ** 2;
    if (dist < minDistance) {
      minDistance = dist;
      closestId = id;
    }
  }

  return closestId;
}

// A* Shortest Path Algorithm on NAV_GRAPH
export function calculateNavRoute(start: Point, target: Point): Point[] {
  const startNodeId = findClosestNavNode(start);
  const targetNodeId = findClosestNavNode(target);

  if (startNodeId === targetNodeId) {
    return [target];
  }

  const openSet = new Set<string>([startNodeId]);
  const cameFrom = new Map<string, string>();
  const gScore = new Map<string, number>();
  const fScore = new Map<string, number>();

  for (const id of Object.keys(NAV_GRAPH)) {
    gScore.set(id, Infinity);
    fScore.set(id, Infinity);
  }

  gScore.set(startNodeId, 0);
  const targetNode = NAV_GRAPH[targetNodeId];
  fScore.set(startNodeId, Math.hypot(NAV_GRAPH[startNodeId].x - targetNode.x, NAV_GRAPH[startNodeId].z - targetNode.z));

  while (openSet.size > 0) {
    // Find node with lowest fScore
    let current = '';
    let lowestF = Infinity;
    for (const id of openSet) {
      const f = fScore.get(id) ?? Infinity;
      if (f < lowestF) {
        lowestF = f;
        current = id;
      }
    }

    if (current === targetNodeId) {
      // Reconstruct path
      const path: Point[] = [];
      let currId: string | undefined = targetNodeId;
      while (currId) {
        const node = NAV_GRAPH[currId];
        path.unshift({ x: node.x, z: node.z });
        currId = cameFrom.get(currId);
      }
      // Replace final node with actual target endpoint
      path.push(target);
      return path;
    }

    openSet.delete(current);
    const currentNode = NAV_GRAPH[current];

    for (const neighborId of currentNode.neighbors) {
      const neighborNode = NAV_GRAPH[neighborId];
      if (!neighborNode) continue;

      const tentativeG = (gScore.get(current) ?? Infinity) + Math.hypot(currentNode.x - neighborNode.x, currentNode.z - neighborNode.z);

      if (tentativeG < (gScore.get(neighborId) ?? Infinity)) {
        cameFrom.set(neighborId, current);
        gScore.set(neighborId, tentativeG);
        fScore.set(neighborId, tentativeG + Math.hypot(neighborNode.x - targetNode.x, neighborNode.z - targetNode.z));
        openSet.add(neighborId);
      }
    }
  }

  // Fallback: direct line if no graph path found
  return [target];
}
