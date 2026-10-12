import { Loader2, Sparkles } from 'lucide-react';
import { useStore } from '../store';

export function SceneLoadingOverlay() {
  const sceneState = useStore((s) => s.sceneState);

  if (sceneState === 'ready') return null;
  if (sceneState === 'unavailable') return null;

  return (
    <div className="scene-loading-overlay" aria-live="polite">
      <div className="scene-loading-card">
        <div className="loading-badge">
          <Sparkles size={16} className="sparkle-icon" />
          <span>IsoOffice 3D</span>
        </div>
        <div className="loading-spinner-wrap">
          <Loader2 size={28} className="spinner-rotate" />
        </div>
        <h3>Populating Office World</h3>
        <p>Aligning workstations, character anchors & natural lighting…</p>
        <div className="loading-progress-bar">
          <div className="loading-progress-indeterminate" />
        </div>
      </div>
    </div>
  );
}
