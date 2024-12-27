// src/AuthContext.js
import React, { createContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('accessToken'));
  const [username, setUsername] = useState(localStorage.getItem('username') || '');

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      fetchUserInfo(token);
    }
  }, []);

  const fetchUserInfo = useCallback(async (token) => {
    try {
      const response = await axios.get('media/user-info/', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUsername(response.data.username);
      localStorage.setItem('username', response.data.username);
    } catch (error) {
      console.error('Error fetching user info:', error);
      setUsername('');
    }
  }, []);

  const handleLogin = async (token) => {
    localStorage.setItem('accessToken', token);
    setIsAuthenticated(true);

    try {
      await fetchUserInfo(token); // Ensure username and state are updated after login
    } catch (error) {
      console.error('Error fetching user info during login:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('username');
    setIsAuthenticated(false);
    setUsername(''); // Update the state to reflect the logged-out state
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, username, handleLogin, handleLogout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
