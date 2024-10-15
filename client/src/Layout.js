import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Layout.css';

function Layout({ children, isAuthenticated, username, handleLogout }) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setShowDropdown(false);
  }, [isAuthenticated]);

  const toggleDropdown = () => {
    setShowDropdown((prev) => !prev);
  };

  const handleSearch = async () => {
    if (searchTerm.trim() === '') {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(`http://127.0.0.1:8000/api/media/search/?q=${searchTerm}`);
      setSearchResults(response.data);
      setShowDropdown(true);
    } catch (error) {
      console.error('Error searching media:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchInputChange = (e) => {
    setSearchTerm(e.target.value);
    handleSearch();
  };

  const handleResultClick = (media) => {
    setSearchTerm('');
    setSearchResults([]);
    setShowDropdown(false);
    navigate(`/media/${media.id}`);
  };

  return (
    <div className="layout-container">
      <header className="banner">
        <h1>MyList</h1>
        <nav className="navigation">
          <Link to="/">Home</Link>
          {isAuthenticated && <Link to="/media-list">Your Media List</Link>}
          <Link to="/top-media-lists">Top Media Lists</Link>
          {!isAuthenticated ? (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          ) : (
            <div className="user-menu">
              <span onClick={toggleDropdown} className="username">
                {username} ▼
              </span>
              {showDropdown && (
                <div className="dropdown-menu">
                  <button onClick={handleLogout}>Logout</button>
                </div>
              )}
            </div>
          )}
        </nav>

        {/* Search Bar Section */}
        <div className="search-bar">
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearchInputChange}
            placeholder="Search for media..."
            onFocus={() => setShowDropdown(searchResults.length > 0)}
          />
          <button onClick={handleSearch}>Search</button>

          {/* Dropdown for search results */}
          {showDropdown && searchResults.length > 0 && (
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
        {children}
      </main>

      <footer className="footer">
        <p>© 2024 Your Media Tracker. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default Layout;
