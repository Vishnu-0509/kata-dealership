import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export function LoginForm() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch {
      setError('Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fillQuickAccount = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950 relative overflow-hidden">
      {/* Background Glow */}
      <div className="ambient-glow" />

      <div className="glass-panel max-w-md w-full p-8 border border-cyan-500/30 shadow-2xl relative z-10 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-2xl mx-auto shadow-lg shadow-cyan-500/30">
            🏎️
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">APEX MOTORS</h1>
          <p className="text-xs text-slate-400">Sign in to your dealership client portal</p>
        </div>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 p-3 rounded-xl text-xs flex items-center gap-2">
            <span>⚠️</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
            <input
              type="email"
              className="glass-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
            <input
              type="password"
              className="glass-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <button type="submit" className="btn-primary w-full py-3 font-bold text-sm mt-2" disabled={loading}>
            {loading ? 'Authenticating…' : 'Sign In to Portal'}
          </button>
        </form>

        {/* Demo Credentials Quick-Fill Bar */}
        <div className="pt-2 border-t border-slate-800 text-center">
          <p className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold mb-2">Quick Demo Access</p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => fillQuickAccount('admin@dealership.com', 'admin123')}
              className="btn-glass flex-1 py-1 text-xs text-amber-300 border-amber-500/30 hover:border-amber-500/60"
            >
              👑 Admin Demo
            </button>
            <button
              type="button"
              onClick={() => fillQuickAccount('user@dealership.com', 'user123')}
              className="btn-glass flex-1 py-1 text-xs text-cyan-300 border-cyan-500/30 hover:border-cyan-500/60"
            >
              👤 Client Demo
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-slate-400 pt-1">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="text-cyan-400 font-semibold hover:underline">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}
