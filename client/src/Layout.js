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

  // Ensure the dropdown is closed when the authentication state changes
  useEffect(() => {
    setShowDropdown(false);
  }, [isAuthenticated]);

  const toggleDropdown = () => {
    setShowDropdown((prev) => !prev);
  };

  const handleSearch = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`http://127.0.0.1:8000/api/media/search/?q=${searchTerm}`);
      setSearchResults(response.data);
    } catch (error) {
      console.error('Error searching media:', error);
    } finally {
      setLoading(false);
    }
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
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search for media..."
          />
          <button onClick={handleSearch}>Search</button>
        </div>
      </header>

      <main className="content">
        {children}

        {/* Display search results below the main content */}
        {loading ? (
          <p>Loading search results...</p>
        ) : (
          <ul className="search-results">
            {searchResults.map((media) => (
              <li key={media.id}>
                <strong>{media.title}</strong> - {media.media_type} - Rating: {media.rating}
              </li>
            ))}
          </ul>
        )}
      </main>

      <footer className="footer">
        <p>© 2024 Your Media Tracker. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default Layout;
