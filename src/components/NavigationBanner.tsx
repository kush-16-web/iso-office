import { FastForward, Footprints, X } from 'lucide-react';
import { useStore } from '../store';

export function NavigationBanner() {
  const navigation = useStore((s) => s.navigation);

  if (!navigation.isNavigating) return null;

  return (
    <aside className="navigation-travel-banner" role="status" aria-label="Walking in progress">
      <div className="travel-indicator">
        <Footprints className="travel-icon" size={16} />
        <span>
          Walking to <strong>{navigation.targetName || 'coworker'}</strong>…
        </span>
      </div>
      <div className="travel-actions">
        <button
          className="travel-skip-btn"
          onClick={() => useStore.getState().skipNavigation()}
          title="Instantly arrive at destination"
        >
          <FastForward size={14} />
          <span>Skip Travel</span>
        </button>
        <button
          className="travel-cancel-btn"
          onClick={() => useStore.getState().cancelNavigation()}
          title="Stop walking"
          aria-label="Cancel walking"
        >
          <X size={14} />
        </button>
      </div>
    </aside>
  );
}
