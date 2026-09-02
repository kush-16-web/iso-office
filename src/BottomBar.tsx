
import { Mic, MicOff, Video, VideoOff, MonitorUp, Maximize, ChevronUp } from 'lucide-react';
import { useStore } from './store';
import clsx from 'clsx';

const ControlButton = ({ icon, label, isActive, onClick, hasDropdown = true }: any) => (
  <div className="flex flex-col items-center gap-1">
    <div className="flex items-center">
      <button
        onClick={onClick}
        className={clsx(
          "w-10 h-10 rounded-full flex items-center justify-center transition-colors shadow-sm border border-[var(--border-color)]",
          isActive ? "bg-white text-gray-800" : "bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
        )}
      >
        {icon}
      </button>
      {hasDropdown && (
        <button className="w-5 h-10 -ml-2 rounded-r-full flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors z-10">
          <ChevronUp className="w-3 h-3" />
        </button>
      )}
    </div>
    <span className="text-[10px] font-medium text-[var(--text-secondary)]">{label}</span>
  </div>
);

export const BottomBar = () => {
  const {
    activeRoom, coworkers,
    isMuted, toggleMute,
    isCameraOn, toggleCamera,
    isScreenSharing, toggleScreenShare,
    isFullscreen, toggleFullscreen
  } = useStore();

  const nearbyCount = coworkers.filter(c => c.isNearby).length;

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-[var(--bg-panel)] border border-[var(--border-color)] rounded-full px-6 py-2 shadow-xl z-20 flex items-center gap-6">

      {/* Location Info */}
      <div className="pr-6 border-r border-[var(--border-color)] flex flex-col">
        <span className="font-semibold text-sm text-[var(--text-primary)]">{activeRoom}</span>
        <span className="text-xs text-[var(--text-secondary)]">{nearbyCount} people around you</span>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4">
        <ControlButton
          icon={isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-green-600" />}
          label={isMuted ? "Unmute" : "Mute"}
          isActive={!isMuted}
          onClick={toggleMute}
        />
        <ControlButton
          icon={isCameraOn ? <Video className="w-4 h-4 text-green-600" /> : <VideoOff className="w-4 h-4" />}
          label={isCameraOn ? "Deactivate" : "Activate camera"}
          isActive={isCameraOn}
          onClick={toggleCamera}
        />
        <ControlButton
          icon={<MonitorUp className={clsx("w-4 h-4", isScreenSharing && "text-blue-600")} />}
          label="Share screen"
          isActive={isScreenSharing}
          onClick={toggleScreenShare}
          hasDropdown={false}
        />
        <ControlButton
          icon={<Maximize className={clsx("w-4 h-4", isFullscreen && "text-blue-600")} />}
          label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          isActive={isFullscreen}
          onClick={toggleFullscreen}
          hasDropdown={false}
        />
      </div>

    </div>
  );
};
