import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import apiClient from './axiosInstance';
import './Layout.css';

function Layout({ children, isAuthenticated, username, handleLogout }) {
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [mediaType, setMediaType] = useState('anime');
  const navigate = useNavigate();
  const searchContainerRef = useRef(null);
  const userMenuRef = useRef(null);
  const [debounceTimer, setDebounceTimer] = useState(null);

  useEffect(() => {
    setShowUserDropdown(false);
  }, [isAuthenticated]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setShowSearchDropdown(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleDemoLogin = async () => {
    setDemoLoading(true);
    try {
      const response = await apiClient.post('auth/token/', {
        username: 'demo_user',
        password: 'Demo@123',
      });

      localStorage.setItem('accessToken', response.data.access);
      localStorage.setItem('refreshToken', response.data.refresh);
      localStorage.setItem('username', 'demo_user');

      window.dispatchEvent(new Event('storage'));
      navigate('/');
    } catch (error) {
      alert('Failed to log in as the demo user. Please try again later.');
    } finally {
      setDemoLoading(false);
    }
  };

  const fetchSearchResults = async (query) => {
    if (query.trim() === '') {
      setSearchResults([]);
      setShowSearchDropdown(false);
      return;
    }

    setLoading(true);
    try {
      const response = await apiClient.get(`media/search/`, {
        params: { q: query, media_type: mediaType },
      });
      setSearchResults(response.data);
      setShowSearchDropdown(true);
    } catch (error) {
      console.error('Error searching media:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchInputChange = (e) => {
    const query = e.target.value;
    setSearchTerm(query);

    if (debounceTimer) clearTimeout(debounceTimer);

    setDebounceTimer(
      setTimeout(() => {
        fetchSearchResults(query);
      }, 300)
    );
  };

  const handleMediaTypeChange = (e) => {
    setMediaType(e.target.value);
    if (searchTerm.trim() !== '') {
      fetchSearchResults(searchTerm);
    }
  };

  const handleLogoutClick = () => {
    handleLogout();
    navigate('/');
  };

  return (
    <div className="layout-container">
      <header className="banner">
        <h1>MyList</h1>
        <nav className="navigation">
          <Link to="/">Home</Link>
          {isAuthenticated && <Link to="/media-list">Your Media List</Link>}
          <Link to="/top-media-lists">Top Media</Link>
          {!isAuthenticated ? (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Sign Up</Link>
            </>
          ) : (
            <div className="user-menu" ref={userMenuRef}>
              <span
                onClick={() => setShowUserDropdown((prev) => !prev)}
                className="username"
              >
                {username} ▼
              </span>
              {showUserDropdown && (
                <div className="dropdown-menu">
                  <button onClick={handleLogoutClick}>Logout</button>
                </div>
              )}
            </div>
          )}
        </nav>

        <div className="search-container" ref={searchContainerRef}>
          <div className="search-bar">
            <select
              className="media-type-dropdown"
              value={mediaType}
              onChange={handleMediaTypeChange}
            >
              <option value="anime">Anime</option>
              <option value="video_game">Video Game</option>
              <option value="movie">Movie</option>
              <option value="tv_show">TV Show</option>
            </select>
            <input
              type="text"
              className="search-input"
              value={searchTerm}
              onChange={handleSearchInputChange}
              placeholder="Search for media..."
            />
          </div>
          {showSearchDropdown && (
            <ul className="search-dropdown">
              {loading ? (
                <li className="loading-spinner-container">
                  <div className="loading-spinner"></div>
                  <p>Loading results...</p>
                </li>
              ) : searchResults.length > 0 ? (
                searchResults.map((media) => (
                  <li key={media.id} onClick={() => navigate(`/media/${media.id}`)}>
                    <img
                      src={media.image_url || 'default-placeholder-image-url.jpg'}
                      alt={media.title}
                      style={{ width: '30px', height: '45px', marginRight: '10px' }}
                    />
                    <span>{media.title}</span>
                  </li>
                ))
              ) : (
                <li>No results found.</li>
              )}
            </ul>
          )}
        </div>
      </header>

      <main className="content">
        {!isAuthenticated && (
          <div className="login-prompt">
            {demoLoading ? (
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Logging in as Demo User...</p>
              </div>
            ) : (
              <>
                <p>
                  <strong>Log in to start rating and tracking the media you enjoy!</strong>
                  <br />
                  <Link to="/login" className="login-link">Login</Link>, <Link to="/register" className="login-link">Sign Up</Link>, or{' '}
                  <button className="login-link" onClick={handleDemoLogin}>
                    Use Demo Account
                  </button>.
                </p>
                <p className="demo-description">
                  The demo account allows you to explore the app's features with pre-filled data, showcasing how the app looks after tracking and rating a variety of media.
                  If you'd like to experience the app as a new user, feel free to create your own account with a fake email address for testing purposes.
                </p>
              </>
            )}
          </div>
        )}
        {children}
      </main>

      <footer className="footer">
        <p>© 2024 MyList. All rights reserved.</p>
        <p>
          This product uses data from:
        </p>
        <ul>
          <li>
            <a href="https://www.themoviedb.org/" target="_blank" rel="noopener noreferrer">
              <img src="/tmdb-logo.svg" alt="TMDB Logo" className="tmdb-logo" />
            </a>{' '}
            TMDB and the TMDB APIs but is not endorsed or certified by TMDB.
          </li>
          <li>
            <a href="https://rawg.io/" target="_blank" rel="noopener noreferrer">
              RAWG Video Game Database
            </a>
          </li>
          <li>
            <a href="https://jikan.moe/" target="_blank" rel="noopener noreferrer">
              Jikan Anime API
            </a>
          </li>
        </ul>
      </footer>
    </div>
  );
}

export default Layout;
