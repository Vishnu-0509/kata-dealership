import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export function LoginForm() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(identifier.trim().toLowerCase(), password);
      navigate('/');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { status?: number; data?: { message?: string } }; message?: string };
      if (axiosErr.response?.data?.message) {
        setError(axiosErr.response.data.message);
      } else if (axiosErr.response?.status === 401 || axiosErr.message === 'Unauthorized' || axiosErr.message?.toLowerCase().includes('invalid')) {
        setError('Invalid username/email or password. Please try again.');
      } else if (!axiosErr.response) {
        setError('Cannot connect to backend API server. Please ensure the backend server is running on port 3001.');
      } else {
        setError('Invalid username/email or password. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClientDemo = async () => {
    setIdentifier('demo');
    setPassword('demo123');
    setError('');
    setLoading(true);
    try {
      await login('demo', 'demo123');
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
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 relative overflow-hidden">
      {/* Background Glow */}
      <div className="ambient-glow" />

      <div className="glass-panel max-w-md w-full p-8 border border-slate-200 shadow-xl relative z-10 space-y-6 bg-white/95">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-teal-600 to-blue-600 flex items-center justify-center text-2xl mx-auto shadow-md shadow-teal-500/20 text-white">
            🏎️
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">KATA MOTORS</h1>
          <p className="text-xs text-slate-500">Sign in to your dealership client portal</p>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-xl text-xs flex items-center gap-2">
            <span>⚠️</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="usernameOrEmail" className="block text-xs font-semibold text-slate-700 mb-1">
              Username or Email
            </label>
            <input
              id="usernameOrEmail"
              type="text"
              className="glass-input"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="Enter username or email"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-xs font-semibold text-slate-700 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                className="glass-input pr-10"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors p-1 text-sm focus:outline-none"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                <span>{showPassword ? '🙈' : '👁️'}</span>
              </button>
            </div>
          </div>

          <button type="submit" className="btn-primary w-full py-3 font-bold text-sm mt-2 shadow-teal-500/20" disabled={loading}>
            {loading ? 'Authenticating…' : 'Sign In to Portal'}
          </button>
        </form>

        {/* Demo Client Access */}
        <div className="pt-2 border-t border-slate-200 text-center">
          <p className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold mb-2">Instant Exploration</p>
          <button
            type="button"
            onClick={handleClientDemo}
            disabled={loading}
            className="btn-glass w-full py-2.5 text-xs text-teal-700 border-slate-300 hover:border-teal-500/50 hover:bg-teal-50/50 flex items-center justify-center gap-2 font-semibold"
          >
            <span>👤</span> Explore as Client Demo
          </button>
          <p className="text-[10px] text-slate-500 mt-2">
            Demo client access is view-only. To purchase vehicles or manage inventory, sign in with your account.
          </p>
        </div>

        <p className="text-center text-xs text-slate-500 pt-1">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="text-teal-600 font-semibold hover:underline">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}
