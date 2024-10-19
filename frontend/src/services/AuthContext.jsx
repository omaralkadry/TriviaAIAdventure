import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Save user data in session storage
  const login = (userData) => {
    // Converts userData javascript object to JSON string
    // Then stores into sessionStorage
    sessionStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };
  
  // Clear user data in session storage on logout
  const logout = () => {
    sessionStorage.removeItem('user');
    setUser(null);
  };

  // Returns original javascript object by parsing
  const getUser = () => {
    const storedUser = sessionStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  };

  const isAuthenticated = () => {
    return getUser() !== null;
  };

  const getID = () => {
    setUser(getUser());
    return user._id;
  }

  const getUsername = () => {
    setUser(getUser());
    return user.username;
  }

  const getPassword = () => {
    setUser(getUser());
    return user.getPassword;
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated, getID, getUsername, getPassword }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
