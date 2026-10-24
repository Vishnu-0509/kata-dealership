import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { exhaustSound } from '../../utils/exhaustAudio';

interface Props {
  onOpenAbout?: () => void;
  onOpenContact?: () => void;
}

export function Navbar({ onOpenAbout, onOpenContact }: Props) {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [isMuted, setIsMuted] = useState(exhaustSound.getIsMuted());

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleSound = () => {
    const nextState = !isMuted;
    exhaustSound.setMuted(nextState);
    setIsMuted(nextState);
  };

  return (
    <nav className="sticky top-0 z-40 backdrop-blur-xl bg-slate-950/85 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 py-3">
          {/* Logo & Dealership Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-xl shadow-lg shadow-cyan-500/25">
              🏎️
            </div>
            <div>
              <span className="font-black text-xl tracking-tight text-white flex items-center gap-1.5">
                APEX <span className="text-cyan-400 font-light text-base">MOTORS</span>
              </span>
              <p className="text-[10px] text-slate-400 tracking-wider uppercase font-semibold">
                Dealership Inventory Portal
              </p>
            </div>
          </div>

          {/* Center Navigation Links (About, Contact, Hotline) */}
          <div className="hidden md:flex items-center gap-6 text-xs font-semibold">
            <button
              type="button"
              onClick={onOpenAbout}
              className="text-slate-300 hover:text-cyan-400 transition-colors"
            >
              About Heritage
            </button>
            <button
              type="button"
              onClick={onOpenContact}
              className="text-slate-300 hover:text-cyan-400 transition-colors flex items-center gap-1.5"
            >
              <span>📞</span> Contact & Support
            </button>
            <a
              href="tel:+18005552739"
              className="text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1"
              title="Direct Toll-Free Line"
            >
              <span>📱</span> +1 (800) 555-APEX
            </a>
          </div>

          {/* Right Controls & User Capsule */}
          <div className="flex items-center gap-3">
            {/* Audio Toggle */}
            <button
              onClick={toggleSound}
              className={`p-2 rounded-xl text-xs border backdrop-blur-md transition-all flex items-center gap-1.5 ${
                isMuted
                  ? 'bg-slate-900/60 border-slate-700/60 text-slate-400 hover:text-white'
                  : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300 shadow-sm shadow-cyan-500/20'
              }`}
              title={isMuted ? 'Unmute Exhaust Audio' : 'Mute Exhaust Audio'}
            >
              <span>{isMuted ? '🔇' : '🔊'}</span>
              <span className="hidden lg:inline text-[11px] font-semibold">
                {isMuted ? 'Muted' : 'Exhaust Sound On'}
              </span>
            </button>

            {/* Mobile Contact Quick Button */}
            <button
              type="button"
              onClick={onOpenContact}
              className="md:hidden p-2 rounded-xl text-xs border border-white/10 bg-white/5 text-slate-300"
              title="Contact Support"
            >
              📞
            </button>

            {/* User Capsule */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-slate-300 font-medium">{user?.email}</span>
              {isAdmin && (
                <span className="badge-glass bg-amber-500/20 text-amber-300 border-amber-500/40 text-[10px] py-0 px-1.5">
                  ADMIN
                </span>
              )}
            </div>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="btn-glass text-xs hover:border-rose-500/40 hover:text-rose-300 py-2 px-3.5"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
