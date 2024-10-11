// src/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
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

  const fetchUserInfo = async (token) => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/media/user-info/', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUsername(response.data.username);
      localStorage.setItem('username', response.data.username); // Store username in localStorage
    } catch (error) {
      console.error('Error fetching user info:', error);
      setUsername('');
    }
  };

  const handleLogin = (token) => {
    localStorage.setItem('accessToken', token);
    setIsAuthenticated(true);
    fetchUserInfo(token); // Fetch username when the user logs in
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('username');
    setIsAuthenticated(false);
    setUsername(''); // Immediately update the UI to reflect the logged-out state
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, username, handleLogin, handleLogout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
