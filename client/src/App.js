import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import SignUpPage from './pages/SignUpPage';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import MediaListPage from './pages/MediaListPage';
import TopMediaListsPage from './pages/TopMediaListsPage';
import MediaDetailsPage from './pages/MediaDetailsPage'; // Import the Media Details page
import Layout from './components/Layout';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('accessToken'));
  const [username, setUsername] = useState(localStorage.getItem('username') || '');

  useEffect(() => {
    const handleStorageChange = () => {
      const token = localStorage.getItem('accessToken');
      const storedUsername = localStorage.getItem('username');
      setIsAuthenticated(!!token);
      setUsername(storedUsername || '');
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const handleLogin = (token, username) => {
    localStorage.setItem('accessToken', token);
    localStorage.setItem('username', username);
    setIsAuthenticated(true);
    setUsername(username);
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('username');
    setIsAuthenticated(false);
    setUsername('');
  };

  return (
    <Router>
      <Layout isAuthenticated={isAuthenticated} username={username} handleLogout={handleLogout}>
        <Routes>
          <Route
            path="/"
            element={<HomePage isAuthenticated={isAuthenticated} handleLogin={handleLogin} handleLogout={handleLogout} />}
          />
          <Route path="/login" element={<LoginPage handleLogin={handleLogin} />} />
          <Route path="/register" element={<SignUpPage />} />
          <Route path="/media-list" element={<MediaListPage />} />
          <Route path="/top-media-lists" element={<TopMediaListsPage />} />
          <Route path="/media/:mediaId" element={<MediaDetailsPage />} /> {/* New route for media details */}
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
