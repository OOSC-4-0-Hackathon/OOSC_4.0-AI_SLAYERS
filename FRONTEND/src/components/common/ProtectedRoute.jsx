import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from './LoadingSpinner';

/**
 * ProtectedRoute.
 *
 * Previously redirected with `<Navigate to="/login" replace />` and no state.
 * Combined with Login/Signup unconditionally navigating to /dashboard, that
 * broke the entire landing funnel: a visitor who clicked "File an RTI" on the
 * home page was sent to login and then dumped on the dashboard, with the
 * query they had typed silently discarded.
 *
 * The intended destination — pathname AND its router state, which is where the
 * preset query lives — is now handed to the login screen as `from`.
 */
export default function ProtectedRoute({ children }) {
  const { currentUser, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div
        className="min-h-screen bg-paper flex flex-col items-center justify-center gap-4 p-6"
        role="status"
        aria-live="polite"
      >
        <LoadingSpinner size="md" className="text-[#C84B31]" label="Restoring session" />
        <p className="text-[13px] font-sans text-[#556377]">Restoring your session…</p>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}
