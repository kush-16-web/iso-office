
import { useStore } from './store';

export const Minimap = () => {
  const { coworkers,   } = useStore();

  // Basic 2D representation mapping 3D coordinates to a 2D canvas
  // Assuming a rough mapping of -16 to 16 in 3D -> 0 to 100% in 2D

  const mapCoord = (val: number, range: number = 32) => {
    return `${((val + (range/2)) / range) * 100}%`;
  };

  return (
    <div className="absolute bottom-4 left-4 w-48 h-32 bg-[var(--bg-panel)] border border-[var(--border-color)] rounded z-10 p-2 shadow-lg">
      <div className="w-full h-full relative bg-gray-100 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 overflow-hidden">

        {/* Floor Plan (Approximate 2D version) */}
        {/* Main Blue */}
        <div className="absolute inset-0 bg-blue-100/50 dark:bg-blue-900/30"></div>
        {/* Meeting Rooms (Left side approx) */}
        <div className="absolute top-0 left-0 w-1/3 h-full bg-gray-200/50 dark:bg-gray-700/50 border-r border-gray-300 dark:border-gray-600"></div>
        {/* Library (Bottom approx) */}
        <div className="absolute bottom-0 left-1/3 right-0 h-1/2 bg-yellow-100/50 dark:bg-yellow-900/30 border-t border-gray-300 dark:border-gray-600"></div>

        {/* Current User */}
        <div
          className="absolute w-2 h-2 bg-gray-800 dark:bg-gray-200 rounded-full ring-2 ring-white transform -translate-x-1/2 -translate-y-1/2 z-10"
          style={{ left: mapCoord(2), top: mapCoord(2) }}
        />

        {/* Proximity Ring (Approximate) */}
         <div
          className="absolute w-8 h-8 rounded-full border border-blue-400/50 bg-blue-400/20 transform -translate-x-1/2 -translate-y-1/2"
          style={{ left: mapCoord(2), top: mapCoord(2) }}
        />

        {/* Coworkers */}
        {coworkers.map((c, i) => {
           // Mock positions matching 3D space
           const pos = [
             { x: 0, z: -2 },
             { x: 4, z: 3 },
             { x: -2, z: 5 },
             { x: -12, z: 2 },
             { x: -12, z: -2 }
           ][i] || { x: 0, z: 0 };

           const color = c.status === 'online' ? 'bg-green-500' : c.status === 'in-call' ? 'bg-blue-500' : 'bg-gray-400';

           return (
            <div
              key={c.id}
              className={`absolute w-1.5 h-1.5 ${color} rounded-full transform -translate-x-1/2 -translate-y-1/2`}
              style={{ left: mapCoord(pos.x), top: mapCoord(pos.z) }}
            />
           )
        })}
      </div>
    </div>
  );
};
