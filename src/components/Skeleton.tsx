import type { CSSProperties } from 'react';

export function Skeleton({
  width,
  height,
  borderRadius = 8,
  className = '',
  style,
}: {
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      className={`skeleton-loader ${className}`}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
        borderRadius: typeof borderRadius === 'number' ? `${borderRadius}px` : borderRadius,
        ...style,
      }}
      aria-hidden="true"
    />
  );
}

export function ChatListSkeleton() {
  return (
    <div className="skeleton-chat-list" aria-label="Loading messages…">
      {[1, 2, 3].map((i) => (
        <div key={i} className="skeleton-message-row">
          <Skeleton width={32} height={32} borderRadius="50%" />
          <div className="skeleton-message-lines">
            <Skeleton width={110} height={12} />
            <Skeleton width="85%" height={14} style={{ marginTop: 4 }} />
            {i % 2 === 0 && <Skeleton width="60%" height={14} style={{ marginTop: 4 }} />}
          </div>
        </div>
      ))}
    </div>
  );
}

export function MembersListSkeleton() {
  return (
    <div className="skeleton-members-list" aria-label="Loading members…">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="skeleton-member-row">
          <Skeleton width={36} height={36} borderRadius="50%" />
          <div className="skeleton-member-lines">
            <Skeleton width={120} height={14} />
            <Skeleton width={80} height={11} style={{ marginTop: 4 }} />
          </div>
        </div>
      ))}
    </div>
  );
}
