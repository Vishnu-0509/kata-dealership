import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export function RegisterForm() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      if (username.trim()) {
        await register(email, password, username.trim());
      } else {
        await register(email, password);
      }
      navigate('/');
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(message || 'Registration failed. Please try again.');
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
          <p className="text-xs text-slate-500">Create your client portal account</p>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-xl text-xs flex items-center gap-2">
            <span>⚠️</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="reg-username" className="block text-xs font-semibold text-slate-700 mb-1">Username (Optional)</label>
            <input
              id="reg-username"
              type="text"
              className="glass-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Choose a unique username"
            />
          </div>

          <div>
            <label htmlFor="reg-email" className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
            <input
              id="reg-email"
              type="email"
              className="glass-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
            <input
              type="password"
              className="glass-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Confirm Password</label>
            <input
              type="password"
              className="glass-input"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Repeat your password"
              required
            />
          </div>

          <button type="submit" className="btn-primary w-full py-3 font-bold text-sm mt-2 shadow-teal-500/20" disabled={loading}>
            {loading ? 'Creating Account…' : 'Complete Registration'}
          </button>
        </form>

        <p className="text-center text-xs text-slate-500 pt-2 border-t border-slate-200">
          Already have an account?{' '}
          <Link to="/login" className="text-teal-600 font-semibold hover:underline">
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );
}
