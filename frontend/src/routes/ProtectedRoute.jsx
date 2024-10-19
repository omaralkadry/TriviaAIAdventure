import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../services/AuthContext';

export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();

  // Route navigates to login if not authenticated
  if (!isAuthenticated()) {
    // Gets current path before going to login
    const location = useLocation().pathname;

    // Stores path history if not going to login or register
    if (location !== '/login' || '/register') {
      // Store intended path in localStorage
      localStorage.setItem('redirectPath', location); 
    }

    // Navigates to /login
    return <Navigate to="/login" replace />;
  }

  // Route navigates to protected pages
  return children;
};

