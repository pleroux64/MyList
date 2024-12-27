import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from './axiosInstance';
import './media-listing.css'; // Import the unified CSS

function MediaList() {
    const [mediaType, setMediaType] = useState('movie');
    const [mediaList, setMediaList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchMediaListByType(mediaType);
    }, [mediaType]);

    const fetchMediaListByType = async (type) => {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem('accessToken');

        if (!token) {
            setError('No access token found. Please log in again.');
            setLoading(false);
            return;
        }

        try {
            const response = await apiClient.get(`media/user-media-list/`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                params: { media_type: type },
            });
            setMediaList(response.data);
        } catch (error) {
            console.error('Error fetching media list:', error);
            setError('An error occurred while fetching the media list.');
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
        <div className="container">
            <h2>Your Media List</h2>
            <div className="form-container">
                <label>Select Media Type: </label>
                <select value={mediaType} onChange={(e) => setMediaType(e.target.value)}>
                    <option value="movie">Movies</option>
                    <option value="anime">Anime</option>
                    <option value="video_game">Video Games</option>
                    <option value="tv_show">TV Shows</option>
                </select>
            </div>
            {mediaList.length > 0 ? (
                <ul className="media-list">
                    {mediaList.map((interaction) => (
                        <li
                            key={interaction.id}
                            className="media-item"
                            onClick={() => navigate(`/media/${interaction.media.id}`)}
                        >
                            <div className="image-container">
                                <img
                                    src={interaction.media?.image_url || 'default-placeholder-image-url.jpg'}
                                    alt={interaction.media?.title || 'Unknown Media'}
                                />
                            </div>
                            <div className="media-title">
                                {interaction.media?.title || 'Unknown Media'}
                            </div>
                            <div className="media-rating">
                                Status: {interaction.status} - Rating: {interaction.rating}/10
                            </div>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="no-media-message">You haven't interacted with any {mediaType.replace('_', ' ')}s yet.</p>
            )}
        </div>
    );
}

export default MediaList;
