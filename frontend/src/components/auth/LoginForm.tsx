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
      await login(email.trim().toLowerCase(), password);
      navigate('/');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { status?: number; data?: { message?: string } }; message?: string };
      if (axiosErr.response?.data?.message) {
        setError(axiosErr.response.data.message);
      } else if (axiosErr.response?.status === 401 || axiosErr.message === 'Unauthorized' || axiosErr.message?.toLowerCase().includes('invalid')) {
        setError('Invalid email or password. Please try again.');
      } else if (!axiosErr.response) {
        setError('Cannot connect to backend API server. Please ensure the backend server is running on port 3001.');
      } else {
        setError('Invalid email or password. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClientDemo = async () => {
    setEmail('demo@dealership.com');
    setPassword('demo123');
    setError('');
    setLoading(true);
    try {
      await login('demo@dealership.com', 'demo123');
      navigate('/');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { status?: number; data?: { message?: string } } };
      if (axiosErr.response?.data?.message) {
        setError(axiosErr.response.data.message);
      } else if (!axiosErr.response) {
        setError('Cannot connect to backend server. Please verify backend is running on port 3001.');
      } else {
        setError('Could not sign into Client Demo. Please verify backend is seeded.');
      }
    } finally {
      setLoading(false);
    }
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
          <h1 className="text-2xl font-black tracking-tight text-white">KATA MOTORS</h1>
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

        {/* Demo Client Access */}
        <div className="pt-2 border-t border-slate-800 text-center">
          <p className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold mb-2">Instant Exploration</p>
          <button
            type="button"
            onClick={handleClientDemo}
            disabled={loading}
            className="btn-glass w-full py-2.5 text-xs text-cyan-300 border-cyan-500/30 hover:border-cyan-500/60 flex items-center justify-center gap-2 font-semibold"
          >
            <span>👤</span> Explore as Client Demo
          </button>
          <p className="text-[10px] text-slate-400 mt-2">
            Demo client access is view-only. To purchase vehicles or manage inventory, sign in with your account.
          </p>
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
