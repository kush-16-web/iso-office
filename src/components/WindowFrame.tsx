import { useRef, useState, type PointerEvent, type ReactNode } from 'react';
import { Maximize2, Minimize2, Minus, X, Grip } from 'lucide-react';
import { useStore } from '../store';
import { displayRect, MOBILE_WIDTH } from '../lib/windows';
import { userById } from '../data';
import type { OfficeWindow, Rect } from '../types';
import { IconButton } from './IconButton';
import { Avatar } from './Avatar';

export function WindowFrame({
  window: win,
  children,
  leading,
  subtitle,
  actions,
}: {
  window: OfficeWindow;
  children: ReactNode;
  leading?: ReactNode;
  subtitle?: string;
  actions?: ReactNode;
}) {
  const bounds = useStore((s) => s.bounds);
  const topId = useStore((s) =>
    s.windows
      .filter((w) => w.mode !== 'minimized')
      .reduce<OfficeWindow | undefined>((top, w) => (!top || w.z > top.z ? w : top), undefined)?.id
  );
  const gesture = useRef<{ x: number; y: number; rect: Rect; resize: boolean } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const rect = displayRect(win, bounds);
  const mobile = bounds.width < MOBILE_WIDTH;

  const begin = (event: PointerEvent<HTMLElement>, resize = false) => {
    if (win.mode !== 'floating' || mobile || event.button !== 0) return;
    if (!resize && (event.target as HTMLElement).closest('button, input, select, a')) return;
    event.preventDefault();
    gesture.current = { x: event.clientX, y: event.clientY, rect: win.rect, resize };
    setIsDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const move = (event: PointerEvent<HTMLElement>) => {
    const g = gesture.current;
    if (!g) return;
    const dx = event.clientX - g.x,
      dy = event.clientY - g.y;
    useStore.getState().setWindowRect(
      win.id,
      g.resize
        ? { ...g.rect, width: g.rect.width + dx, height: g.rect.height + dy }
        : { ...g.rect, x: g.rect.x + dx, y: g.rect.y + dy }
    );
  };

  const end = () => {
    gesture.current = null;
    setIsDragging(false);
  };

  if (win.mode === 'minimized') return null;

  return (
    <section
      role="dialog"
      aria-modal="false"
      aria-label={`${win.title} ${win.kind === 'dm' ? 'direct message' : win.kind}`}
      className={`office-window window--${win.kind} ${win.mode === 'maximized' ? 'is-maximized' : ''} ${
        topId === win.id ? 'is-focused' : ''
      } ${isDragging ? 'is-dragging' : ''}`}
      data-window-id={win.id}
      hidden={mobile && topId !== win.id}
      style={{ left: rect.x, top: rect.y, width: rect.width, height: rect.height, zIndex: 100 + win.z }}
      onPointerDownCapture={() => useStore.getState().focusWindow(win.id)}
      onFocusCapture={() => useStore.getState().focusWindow(win.id)}
      onKeyDown={(event) => {
        if (event.key === 'Escape' && !(event.target as HTMLElement).matches('input, textarea')) {
          useStore.getState().closeWindow(win.id);
        }
      }}
    >
      <header
        className="window-header"
        onPointerDown={(event) => begin(event)}
        onPointerMove={move}
        onPointerUp={end}
        onPointerCancel={end}
        onDoubleClick={(event) => {
          if (!(event.target as HTMLElement).closest('button')) useStore.getState().maximizeWindow(win.id);
        }}
      >
        <div
          className="window-heading"
          tabIndex={mobile ? -1 : 0}
          aria-label={`Move ${win.title} window with arrow keys`}
          onKeyDown={(event) => {
            if (
              !mobile &&
              win.mode === 'floating' &&
              ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)
            ) {
              event.preventDefault();
              useStore.getState().setWindowRect(win.id, {
                ...win.rect,
                x: win.rect.x + (event.key === 'ArrowRight' ? 16 : event.key === 'ArrowLeft' ? -16 : 0),
                y: win.rect.y + (event.key === 'ArrowDown' ? 16 : event.key === 'ArrowUp' ? -16 : 0),
              });
            }
          }}
        >
          {leading}
          <div>
            <h2>{win.title}</h2>
            {subtitle && <p>{subtitle}</p>}
          </div>
        </div>
        <div className="window-actions">
          {actions}
          <IconButton label={`Minimize ${win.title}`} onClick={() => useStore.getState().minimizeWindow(win.id)}>
            <Minus size={16} />
          </IconButton>
          <IconButton
            label={`${win.mode === 'maximized' ? 'Restore' : 'Maximize'} ${win.title}`}
            className="maximize-button"
            onClick={() => useStore.getState().maximizeWindow(win.id)}
          >
            {win.mode === 'maximized' ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
          </IconButton>
          <IconButton label={`Close ${win.title}`} onClick={() => useStore.getState().closeWindow(win.id)}>
            <X size={17} />
          </IconButton>
        </div>
      </header>
      {children}
      {!mobile && win.mode === 'floating' && (
        <button
          className="resize-handle"
          aria-label={`Resize ${win.title} with arrow keys`}
          title="Drag to resize"
          onPointerDown={(event) => begin(event, true)}
          onPointerMove={move}
          onPointerUp={end}
          onPointerCancel={end}
          onKeyDown={(event) => {
            if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) {
              event.preventDefault();
              useStore.getState().setWindowRect(win.id, {
                ...win.rect,
                width: win.rect.width + (event.key === 'ArrowRight' ? 20 : event.key === 'ArrowLeft' ? -20 : 0),
                height: win.rect.height + (event.key === 'ArrowDown' ? 20 : event.key === 'ArrowUp' ? -20 : 0),
              });
            }
          }}
        >
          <Grip size={12} />
        </button>
      )}
    </section>
  );
}

export function WindowDock() {
  const windows = useStore((s) => s.windows);
  const mobile = useStore((s) => s.bounds.width < MOBILE_WIDTH);
  const docked = windows.filter((win) => mobile || win.mode === 'minimized');
  if (!docked.length) return null;
  return (
    <nav className="window-dock" aria-label="Open conversations">
      {docked.map((win) => (
        <div key={win.id} className="dock-item">
          <button
            onClick={() =>
              win.mode === 'minimized'
                ? useStore.getState().restoreWindow(win.id)
                : useStore.getState().focusWindow(win.id)
            }
            title={`Restore ${win.title}`}
          >
            {win.kind === 'dm' ? (
              <Avatar user={userById(win.targetId)} size={18} status={false} />
            ) : (
              <span className="dock-hash">#</span>
            )}
            <span className="dock-text">{win.title}</span>
          </button>
          <IconButton
            label={`Close minimized ${win.title}`}
            onClick={() => useStore.getState().closeWindow(win.id)}
          >
            <X size={13} />
          </IconButton>
        </div>
      ))}
    </nav>
  );
}
