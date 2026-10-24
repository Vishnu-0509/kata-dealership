import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

/**
 * Navbar — top navigation bar with user info and logout.
 */
export function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-blue-900 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <span className="text-2xl">🚗</span>
            <span className="font-bold text-lg tracking-wide">Car Dealership</span>
          </div>

          {/* User info + logout */}
          <div className="flex items-center gap-4">
            <div className="text-sm text-blue-200">
              {user?.email}
              {isAdmin && (
                <span className="ml-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-0.5 rounded-full">
                  ADMIN
                </span>
              )}
            </div>
            <button
              onClick={handleLogout}
              className="text-sm bg-blue-800 hover:bg-blue-700 px-3 py-1.5 rounded-lg transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
