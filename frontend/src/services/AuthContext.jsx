import React, { createContext, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // Save user data in session storage
  const login = (userData) => {
    // Converts user data to JSON string format
    // Then stores into sessionStorage
    sessionStorage.setItem('user', JSON.stringify(userData.username));
    setUser(userData.username);
    console.log(getUsername());
  };

  // Clear user data in session storage on logout
  const logout = async () => {
    try {
      const response = await fetch('/api/logout', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        // Clear session storage
        sessionStorage.removeItem('user');
        setUser(null);

        // Disconnect socket if needed
        // TODO: Implement socket cleanup if needed

        // Navigate to home page after successful logout
        navigate('/');
      } else {
        const data = await response.json();
        console.error('Logout failed:', data.message);
        throw new Error(data.message || 'Logout failed');
      }
    } catch (error) {
      console.error('Error during logout:', error);
      throw error; // Propagate error to component for handling
    }
  };

  // Parse and return stored user data
  /*
  const getUser = () => {
    const storedUser = sessionStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  };
  */

  const isAuthenticated = () => {
    return getUsername() !== null;
  };
/*
  const getID = () => {
    setUser(getUser());
    return user._id;
  }
*/
  const getUsername = () => {
    const storedUser = sessionStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  }
/*
  const getPassword = () => {
    setUser(getUser());
    return user.getPassword;
  }
*/
  return (
    <AuthContext.Provider value={{ login, logout, isAuthenticated, getUsername }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
