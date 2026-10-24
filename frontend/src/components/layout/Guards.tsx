import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

/**
 * ProtectedRoute — redirects to /login if not authenticated.
 */
export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

/**
 * AdminGuard — renders children only for ADMIN users, otherwise 403 message.
 */
export function AdminGuard({ children }: { children: ReactNode }) {
  const { isAdmin } = useAuth();
  if (!isAdmin) {
    return (
      <div className="text-center py-20">
        <div className="text-5xl mb-4">🚫</div>
        <h2 className="text-xl font-semibold text-gray-700">Admin access required</h2>
      </div>
    );
  }
  return <>{children}</>;
}
