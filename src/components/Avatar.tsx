import type { User } from '../types';

export function Avatar({
  user,
  size = 34,
  status = true,
  className = '',
}: {
  user: User;
  size?: number;
  status?: boolean;
  className?: string;
}) {
  const p = user.portrait;
  return (
    <span className={`avatar ${className}`} style={{ width: size, height: size }}>
      {user.avatarUrl ? (
        <img
          src={user.avatarUrl}
          alt={user.name}
          className="avatar-photo"
          style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', display: 'block' }}
        />
      ) : (
        <svg viewBox="0 0 64 64" role="img" aria-label={user.name}>
          <circle cx="32" cy="32" r="32" fill={p.background} />
          {p.longHair && <path d="M15 48V27Q14 5 33 6Q52 8 50 29L52 50Z" fill={p.hair} />}
          <path d="M8 64V57Q9 44 25 43H39Q55 46 56 64" fill={p.shirt} />
          <path d="M27 38V46Q32 53 38 46V37" fill={p.skin} />
          <ellipse cx="32" cy="28" rx="14" ry="18" fill={p.skin} />
          <path
            d={
              p.longHair
                ? 'M17 32Q9 7 33 7Q51 7 47 30L43 20Q33 23 26 15Q24 26 17 32'
                : 'M18 26Q12 10 24 9Q39 2 47 16L45 27L40 18Q29 23 21 19Z'
            }
            fill={p.hair}
          />
          <path d="M24 28h4m9 0h4" stroke={p.hair} strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="26" cy="31" r="1.25" fill="#343339" />
          <circle cx="39" cy="31" r="1.25" fill="#343339" />
          <path d="M32 31l-1 5h3" stroke="#a97658" fill="none" strokeLinecap="round" />
          {p.beard && (
            <path
              d="M19 33Q24 40 27 37Q32 34 37 37Q42 38 45 32Q44 47 32 48Q20 46 19 33"
              fill={p.hair}
            />
          )}
          <path
            d="M28 39q4 4 9 0"
            stroke={p.beard ? '#f0c9a6' : '#9e5b52'}
            strokeWidth="1.7"
            fill="none"
            strokeLinecap="round"
          />
          <path d="M22 48l10 8 10-8" fill="none" stroke="#ffffff" strokeOpacity=".25" strokeWidth="2" />
        </svg>
      )}
      {status && (
        <span
          className={`presence presence--${user.status}`}
          title={user.status.replace('-', ' ')}
          aria-label={user.status.replace('-', ' ')}
        />
      )}
    </span>
  );
}
