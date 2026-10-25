import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { exhaustSound } from '../../utils/exhaustAudio';

interface Props {
  onOpenAbout?: () => void;
  onOpenContact?: () => void;
  onOpenCompare?: () => void;
  comparisonCount?: number;
}

export function Navbar({ onOpenAbout, onOpenContact, onOpenCompare, comparisonCount = 0 }: Props) {
  const { user, isAdmin, isDemo, logout } = useAuth();
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
    <nav className="sticky top-0 z-40 backdrop-blur-2xl bg-white/90 border-b border-slate-200/80 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 py-3">
          {/* Logo & Dealership Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-600 to-blue-600 flex items-center justify-center text-xl shadow-md shadow-teal-500/20">
              🏎️
            </div>
            <div>
              <span className="font-black text-xl tracking-tight text-slate-900 flex items-center gap-1.5">
                KATA <span className="text-teal-600 font-bold text-base">MOTORS</span>
              </span>
              <p className="text-[10px] text-slate-500 tracking-wider uppercase font-semibold">
                Car Dealership Inventory System
              </p>
            </div>
          </div>

          {/* Center Navigation Links (About, Contact, Hotline) */}
          <div className="hidden md:flex items-center gap-6 text-xs font-semibold">
            {!isAdmin && (
              <button
                type="button"
                onClick={onOpenCompare}
                className={`transition-colors flex items-center gap-1.5 ${
                  comparisonCount > 0
                    ? 'text-teal-600 font-bold'
                    : 'text-slate-600 hover:text-teal-600'
                }`}
              >
                <span>⚖️</span> Specifications
                {comparisonCount > 0 && (
                  <span className="w-5 h-5 rounded-full bg-teal-600 text-white text-[10px] font-black flex items-center justify-center">
                    {comparisonCount}
                  </span>
                )}
              </button>
            )}
            <button
              type="button"
              onClick={onOpenAbout}
              className="text-slate-600 hover:text-teal-600 transition-colors"
            >
              About Heritage
            </button>
            <button
              type="button"
              onClick={onOpenContact}
              className="text-slate-600 hover:text-teal-600 transition-colors flex items-center gap-1.5"
            >
              <span>📞</span> Contact & Support
            </button>
            <a
              href="tel:+18005552739"
              className="text-teal-600 hover:text-teal-700 font-bold flex items-center gap-1"
              title="Direct Toll-Free Line"
            >
              <span>📱</span> +1 (800) 555-KATA
            </a>
          </div>

          {/* Right Controls & User Capsule */}
          <div className="flex items-center gap-3">
            {/* Audio Toggle */}
            <button
              onClick={toggleSound}
              className={`p-2 rounded-xl text-xs border backdrop-blur-md transition-all flex items-center gap-1.5 ${
                isMuted
                  ? 'bg-slate-100 border-slate-200 text-slate-500 hover:text-slate-800'
                  : 'bg-teal-50 border-teal-200 text-teal-700 shadow-sm'
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
              className="md:hidden p-2 rounded-xl text-xs border border-slate-200 bg-slate-100 text-slate-600"
              title="Contact Support"
            >
              📞
            </button>

            {/* User Capsule */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs">
              <span className={`w-2 h-2 rounded-full ${isDemo ? 'bg-cyan-500' : 'bg-emerald-500'} animate-pulse`}></span>
              <span className="text-slate-700 font-medium">{user?.username || user?.email}</span>
              {isAdmin && (
                <span className="badge-glass bg-amber-100 text-amber-800 border-amber-300 text-[10px] py-0 px-1.5 font-bold">
                  ADMIN
                </span>
              )}
              {isDemo && (
                <span className="badge-glass bg-cyan-100 text-cyan-800 border-cyan-300 text-[10px] py-0.5 px-2 font-bold">
                  DEMO (VIEW-ONLY)
                </span>
              )}
            </div>

            {isDemo && (
              <button
                type="button"
                onClick={() => {
                  handleLogout();
                  navigate('/login');
                }}
                className="btn-primary text-xs py-1.5 px-3 font-semibold shadow-teal-500/20"
              >
                Log In
              </button>
            )}

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="btn-glass text-xs hover:border-rose-300 hover:text-rose-600 py-2 px-3.5"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
