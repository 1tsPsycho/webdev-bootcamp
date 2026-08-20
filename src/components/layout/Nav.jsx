import { NavLink } from 'react-router-dom';
import { useAppData } from '../../state/AppDataContext';
import { levelForXP } from '../../lib/gamification';
import { RingIcon, FlameIcon } from '../ui/Icons';

const links = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/tasks', label: 'Tasks' },
  { to: '/history', label: 'Star Chart' },
  { to: '/analytics', label: 'Analytics' },
  { to: '/focus', label: 'Deep Focus' },
  { to: '/settings', label: 'Settings' },
];

export function Nav() {
  const { profile } = useAppData();
  const { level } = profile ? levelForXP(profile.xp) : { level: 1 };

  return (
    <header className="ff-surface border-x-0 border-t-0 sticky top-0 z-40">
      <nav className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4 flex-wrap">
        <NavLink to="/dashboard" className="flex items-center gap-2 shrink-0">
          <RingIcon className="text-gold" />
          <span className="font-display text-2xl text-parchment tracking-wide">FocusFlow</span>
        </NavLink>

        <div className="flex items-center gap-1 flex-wrap ff-scrollbar overflow-x-auto">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-colors ${
                  isActive ? 'text-gold border-b border-gold' : 'text-muted hover:text-parchment'
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </div>

        {profile && (
          <div className="flex items-center gap-3 shrink-0 font-data text-sm">
            <span className="flex items-center gap-1 text-warning" title="Current streak">
              <FlameIcon size={16} />
              {profile.currentStreak}
            </span>
            <span className="text-muted">Lv.{level}</span>
            <span className="text-parchment">{profile.displayName}</span>
          </div>
        )}
      </nav>
    </header>
  );
}
