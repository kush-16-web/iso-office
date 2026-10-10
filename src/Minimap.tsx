import { LocateFixed, Minus, Plus } from 'lucide-react';
import { useStore } from './store';
import { users } from './data';
import { WORLD_FLOORS, WORLD_POSITIONS, WORLD_BOUNDS, mapToWorld, worldToMap } from './world';
import { IconButton } from './components/IconButton';
export function Minimap() {
  const camera = useStore(s => s.camera), footprint = useStore(s => s.cameraFootprint);
  const span = WORLD_BOUNDS.max - WORLD_BOUNDS.min;
  return <section className="minimap" aria-label="Office minimap"><h2>Minimap</h2><svg viewBox="0 0 100 100" preserveAspectRatio="none" role="img" aria-label="Office floor plan. Select a coworker to center the camera." onClick={event => { const rect = event.currentTarget.getBoundingClientRect(); useStore.getState().focusWorld({ x: mapToWorld((event.clientX - rect.left) / rect.width * 100), z: mapToWorld((event.clientY - rect.top) / rect.height * 100) }); }}>
    <rect width="100" height="100" fill="#202a34"/>
    {WORLD_FLOORS.map(floor => <rect key={floor.id} x={worldToMap(floor.x - floor.width / 2)} y={worldToMap(floor.z - floor.depth / 2)} width={floor.width / span * 100} height={floor.depth / span * 100} fill={floor.color} fillOpacity=".22" stroke="#d3e0e6" strokeOpacity=".35" strokeWidth=".6"/>)}
    {[2, -2].map(x => <rect key={x} x={worldToMap(x - 1)} y={worldToMap(-15.25)} width={2 / span * 100} height={.5 / span * 100} fill="#f9bf55"/>)}
    {[[2, 2.5], [0, -1.5], [4.5, 3], [-2.5, 5], [-12, 2], [-12, -4]].map(([x, z], i) => <rect key={i} x={worldToMap(x - 1)} y={worldToMap(z - .5)} width={2 / span * 100} height={1 / span * 100} rx=".3" fill="#e2edf4" fillOpacity=".6"/>)}
    <polygon className="minimap-viewport" points={footprint.map(point => `${worldToMap(point.x)},${worldToMap(point.z)}`).join(' ')} fill="white" fillOpacity=".025" stroke="#fff" strokeWidth=".75"/>
    {users.map(user => { const point = WORLD_POSITIONS[user.id]; return <g key={user.id} className="map-person" role="button" tabIndex={0} aria-label={`Center camera on ${user.name}`} onClick={event => { event.stopPropagation(); useStore.getState().focusWorld(point); }} onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); useStore.getState().focusWorld(point); } }}><circle cx={worldToMap(point.x)} cy={worldToMap(point.z)} r="3.2" fill="transparent"/><circle cx={worldToMap(point.x)} cy={worldToMap(point.z)} r={user.id === 'me' ? 1.8 : 1.2} fill={user.id === 'me' ? '#ffd20a' : user.status === 'offline' ? '#7b8290' : '#b8eddb'} stroke={user.id === 'me' ? '#fff3a0' : '#17222d'} strokeWidth=".45"/></g>; })}
  </svg><div className="map-controls"><IconButton label="Zoom in office" disabled={camera.zoom >= 2.4} onClick={() => useStore.getState().focusWorld(camera.target, camera.zoom + .2)}><Plus size={21}/></IconButton><IconButton label="Zoom out office" disabled={camera.zoom <= .65} onClick={() => useStore.getState().focusWorld(camera.target, camera.zoom - .2)}><Minus size={21}/></IconButton><IconButton label="Reset office camera" onClick={() => useStore.getState().focusWorld({ x: -3, z: -3 }, 1)}><LocateFixed size={19}/></IconButton></div><small>You <i/> · Click to look around</small></section>;
}
