import React, { useEffect, useState } from 'react';
import axios from 'axios';

function MediaList() {
    const [mediaType, setMediaType] = useState('movie'); // Default to 'movie' initially
    const [mediaList, setMediaList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchMediaListByType(mediaType); // Fetch the media list whenever the media type changes
    }, [mediaType]);

    // Function to fetch media list by type
    const fetchMediaListByType = async (type) => {
        setLoading(true);
        setError(null);
    
        const token = localStorage.getItem('accessToken'); // Retrieve the token from local storage
    
        if (!token) {
            setError('No access token found. Please log in again.');
            setLoading(false);
            return;
        }
    
        try {
            const response = await axios.get(`http://127.0.0.1:8000/api/media/user-media-list/`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                params: { media_type: type }, // Add media type as a query parameter
            });
            setMediaList(response.data); // Store the data in state
        } catch (error) {
            console.error('Error fetching media list:', error);
            if (error.response && error.response.status === 401) {
                setError('Unauthorized access. Please log in again.');
            } else {
                setError('An error occurred while fetching the media list.');
            }
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <p>Loading your media list...</p>;
    }

    if (error) {
        return <p>{error}</p>;
    }

    return (
        <div>
            <h2>Your Media List</h2>
            <div>
                <label>Select Media Type: </label>
                <select value={mediaType} onChange={(e) => setMediaType(e.target.value)}>
                    <option value="movie">Movies</option>
                    <option value="anime">Anime</option>
                    <option value="video_game">Video Games</option>
                    <option value="tv_show">TV Shows</option>
                </select>
            </div>
            {mediaList.length > 0 ? (
                <ul>
                    {mediaList.map((interaction) => (
                        <li key={interaction.id}>
                            <strong>{interaction.media?.title || 'Unknown Media'}</strong> - Status: {interaction.status} - Rating: {interaction.rating}/10
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No media items found for the selected type.</p>
            )}
        </div>
    );
}

export default MediaList;
