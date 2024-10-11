import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from './AuthContext';
import './Layout.css';

function Layout({ children }) {
  const { isAuthenticated, username, handleLogout } = useContext(AuthContext);
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  return (
    <div className="layout-container">
      <header className="banner">
        <h1>Your Media Tracker</h1>
        <nav className="navigation">
          <Link to="/">Home</Link>
          <Link to="/media-list">Your Media List</Link>
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
      </header>
      <main className="content">{children}</main>
      <footer className="footer">
        <p>© 2024 Your Media Tracker. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default Layout;
