import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [status, setStatus] = useState('');
  const [rating, setRating] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    setIsAuthenticated(!!token);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    setIsAuthenticated(false);
  };

  const handleLogin = () => {
    navigate('/login');
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

  const handleMediaClick = (media) => {
    setSelectedMedia(media);
  };

  const handleInteractionSubmit = async () => {
    const token = localStorage.getItem('accessToken');
    const payload = {
        media: selectedMedia.id,
        status: status,
        rating: parseFloat(rating),  // Ensure rating is a number
    };

    console.log('Submitting interaction payload:', payload); // Debug statement

    try {
        await axios.post(
            'http://127.0.0.1:8000/api/media/interactions/',
            payload,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            }
        );
        alert('Interaction saved successfully!');
        setSelectedMedia(null);
    } catch (error) {
        console.error('Error saving interaction:', error.response ? error.response.data : error.message);
        alert(`Failed to save interaction: ${error.response ? error.response.data : error.message}`);
    }
};


  return (
    <div>
      <h1>Welcome to the Home Page!</h1>
      {isAuthenticated ? (
        <div>
          <p>You are logged in.</p>
          <button onClick={handleLogout}>Logout</button>
          <div>
            <Link to="/media-list">View Your Media List</Link>
          </div>
        </div>
      ) : (
        <div>
          <p>You are logged out.</p>
          <button onClick={handleLogin}>Login</button>
        </div>
      )}

      {/* Search Bar Section */}
      <div>
        <h2>Search for Media</h2>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Enter a media title"
        />
        <button onClick={handleSearch}>Search</button>

        {loading ? (
          <p>Loading search results...</p>
        ) : (
          <ul>
            {searchResults.map((media) => (
              <li key={media.id} onClick={() => handleMediaClick(media)}>
                <strong>{media.title}</strong> - {media.media_type} - Rating: {media.rating}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Interaction Form */}
      {selectedMedia && (
        <div>
          <h3>Interact with {selectedMedia.title}</h3>
          <label>
            Status:
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">Select a status</option>
              <option value="watched">Watched</option>
              <option value="watching">Watching</option>
              <option value="plan_to_watch">Plan to Watch</option>
              <option value="playing">Playing</option>
              <option value="plan_to_play">Plan to Play</option>
            </select>
          </label>
          <label>
            Rating:
            <input
              type="number"
              min="0"
              max="10"
              value={rating}
              onChange={(e) => setRating(e.target.value)}
              placeholder="Rate out of 10"
            />
          </label>
          <button onClick={handleInteractionSubmit}>Save Interaction</button>
          <button onClick={() => setSelectedMedia(null)}>Cancel</button>
        </div>
      )}
    </div>
  );
}

export default Home;
