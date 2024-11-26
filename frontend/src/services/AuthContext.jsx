import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Save user data in session storage
  const login = (userData) => {
    // Converts userData javascript object to JSON string
    // Then stores into sessionStorage
    sessionStorage.setItem('user', JSON.stringify(userData.username));
    setUser(userData.username);
    console.log(getUsername());
  };

  // Clear user data in session storage on logout
  const logout = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/logout`, {
        method: 'POST',
        credentials: 'include',
      });
      if (response.ok) {
        sessionStorage.removeItem('user');
        setUser(null);
      } else {
        console.error('Logout failed');
      }
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  // Returns original javascript object by parsing
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
