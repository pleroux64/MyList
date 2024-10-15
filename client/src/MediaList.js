import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function MediaList() {
    const [mediaType, setMediaType] = useState('movie');
    const [mediaList, setMediaList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate(); // For navigation

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
            const response = await axios.get(`http://127.0.0.1:8000/api/media/user-media-list/`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                params: { media_type: type },
            });
            setMediaList(response.data);
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
                        <li
                            key={interaction.id}
                            style={{ display: 'flex', alignItems: 'center', margin: '10px 0', cursor: 'pointer' }}
                            onClick={() => navigate(`/media/${interaction.media.id}`)} // Navigate to media details page
                        >
                            <img
                                src={interaction.media?.image_url || 'default-placeholder-image-url.jpg'}
                                alt={interaction.media?.title || 'Unknown Media'}
                                style={{ width: '100px', height: '150px', marginRight: '15px' }}
                            />
                            <div>
                                <strong>{interaction.media?.title || 'Unknown Media'}</strong> - Status: {interaction.status} - Rating: {interaction.rating}/10
                            </div>
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
