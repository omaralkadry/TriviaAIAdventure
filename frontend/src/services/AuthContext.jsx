
import React, { createContext, useContext, useState, useEffect } from 'react';


const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

  const [user, setUser] = useState(sessionStorage.getItem('user') ? JSON.parse(sessionStorage.getItem('user')) : null);
  useEffect(() => {
    const storedUser = sessionStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);


  // Save user data in session storage
  const login = (userData) => {
    // Converts user data to JSON string format
    // Then stores into sessionStorage
    sessionStorage.setItem('user', JSON.stringify(userData.username));
    setUser(userData.username);
    console.log("After login:", getUsername()); // Add debug log
  };

  // Clear user data in session storage on logout

  const logout = () => {
    sessionStorage.removeItem('user');
    setUser(null);

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
