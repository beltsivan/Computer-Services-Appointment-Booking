import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { supabase } from '../../supabaseClient';

export const ProtectedRoute = ({ allowedRole, children }) => {
  const location = useLocation();
  const [authState, setAuthState] = useState({ loading: true, user: null, role: null });

  useEffect(() => {
    let active = true;

    const loadSession = async () => {
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (!active) return;

      if (userError || !user) {
        setAuthState({ loading: false, user: null, role: null });
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .maybeSingle();

      if (!active) return;

      setAuthState({
        loading: false,
        user,
        role: profileError ? null : profile?.role,
      });
    };

    loadSession();

    return () => {
      active = false;
    };
  }, []);

  if (authState.loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center gap-3">
        <Loader2 className="text-orange-500 animate-spin" size={36} />
        <p className="text-gray-400">Checking access...</p>
      </div>
    );
  }

  if (!authState.user) {
    return <Navigate to="/Auth" replace state={{ from: location }} />;
  }

  if (allowedRole && authState.role !== allowedRole) {
    if (!authState.role) {
      return <Navigate to="/Auth" replace />;
    }

    const fallback = authState.role === 'admin' ? '/admin' : '/dashboard';
    return <Navigate to={fallback} replace />;
  }

  return children;
};

export default ProtectedRoute;
