import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import apiClient from './axiosInstance'; 

import './Layout.css';

function Layout({ children, isAuthenticated, username, handleLogout }) {
  const [showUserDropdown, setShowUserDropdown] = useState(false); // For user dropdown
  const [showSearchDropdown, setShowSearchDropdown] = useState(false); // For search results dropdown
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mediaType, setMediaType] = useState('anime'); // Default media type
  const navigate = useNavigate();
  const searchContainerRef = useRef(null); // Ref for the search container
  const userMenuRef = useRef(null); // Ref for the user menu

  useEffect(() => {
    setShowUserDropdown(false);
  }, [isAuthenticated]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      // Close dropdowns if clicked outside of them
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
  }, [showUserDropdown]);

  const toggleUserDropdown = (e) => {
    e.stopPropagation(); // Prevent event from propagating to other elements
    setShowUserDropdown((prev) => !prev);
  };

  const handleSearch = async () => {
    if (searchTerm.trim() === '') {
      setSearchResults([]);
      setShowSearchDropdown(false);
      return;
    }

    setLoading(true);
    try {
      // Pass both the searchTerm and the mediaType to the backend
      const response = await apiClient.get(`media/search/?q=${searchTerm}&media_type=${mediaType}`);
      console.log('Search results:', response.data);  // Log the results here
      setSearchResults(response.data);
      setShowSearchDropdown(true);
    } catch (error) {
      console.error('Error searching media:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchInputChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleMediaTypeChange = (e) => {
    setMediaType(e.target.value);
  };

  const handleResultClick = (media) => {
    setSearchTerm('');
    setSearchResults([]);
    setShowSearchDropdown(false);
    navigate(`/media/${media.id}`);
  };

  // Updated handleLogout function
  const handleLogoutClick = () => {
    handleLogout(); // Call the passed-in logout function
    navigate('/');  // Redirect to the home page after logout
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
              <span onClick={toggleUserDropdown} className="username">
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

        {/* Search Bar Section aligned to the right */}
        <div className="search-container" ref={searchContainerRef}>
          <div className="search-bar">
            {/* Media Type Selection Dropdown */}
            <select className="media-type-dropdown" value={mediaType} onChange={handleMediaTypeChange}>
              <option value="anime">Anime</option>
              <option value="video_game">Video Game</option>
              <option value="movie">Movie</option>
              <option value="tv_show">TV Show</option>
            </select>

            {/* Search Input */}
            <input
              type="text"
              className="search-input"
              value={searchTerm}
              onChange={handleSearchInputChange}
              placeholder="Search for media..."
              onFocus={() => setShowSearchDropdown(searchResults.length > 0)}
            />

            {/* Search Button */}
            <button className="search-button" onClick={handleSearch}>
              Search
            </button>
          </div>

          {/* Dropdown for search results */}
          {showSearchDropdown && searchResults.length > 0 && (
            <ul className="search-dropdown">
              {loading ? (
                <li>Loading...</li>
              ) : (
                searchResults.map((media) => (
                  <li key={media.id} onClick={() => handleResultClick(media)}>
                    <img
                      src={media.image_url || 'default-placeholder-image-url.jpg'}
                      alt={media.title}
                      style={{ width: '30px', height: '45px', marginRight: '10px' }}
                    />
                    <span>{media.title} - {media.media_type}</span>
                  </li>
                ))
              )}
            </ul>
          )}
        </div>
      </header>

      <main className="content">
        {!isAuthenticated && (
          <div className="login-prompt">
            <p>
              <strong>Log in to start rating and tracking the media you enjoy!</strong>
              <br />
              <Link to="/login" className="login-link">Login</Link> or <Link to="/register" className="login-link">Sign Up</Link>
            </p>
          </div>
        )}
        {children}
      </main>

      <footer className="footer">
        <p>© 2024 Your Media Tracker. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default Layout;
