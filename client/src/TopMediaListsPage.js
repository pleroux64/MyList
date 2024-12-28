import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from './axiosInstance';
import './media-listing.css'; // Import your CSS file

function TopMediaListsPage() {
    const [mediaType, setMediaType] = useState('movie');
    const [topMediaList, setTopMediaList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchTopMediaListByType(mediaType);
    }, [mediaType]);

    const fetchTopMediaListByType = async (type) => {
        setLoading(true);
        setError(null);

        try {
            const response = await apiClient.get(`media/top-media/${type}/`);
            setTopMediaList(response.data);
        } catch (error) {
            console.error('Error fetching top media list:', error);
            setError('An error occurred while fetching the top media list.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container">
            <h2>Top {mediaType.charAt(0).toUpperCase() + mediaType.slice(1)}s</h2>
            <div className="form-container">
                <label>Select Media Type: </label>
                <select value={mediaType} onChange={(e) => setMediaType(e.target.value)}>
                    <option value="movie">Movies</option>
                    <option value="anime">Anime</option>
                    <option value="video_game">Video Games</option>
                    <option value="tv_show">TV Shows</option>
                </select>
            </div>

            {loading ? (
                <div className="loader-container">
                    <div className="loader"></div>
                    <p>Loading top media list...</p>
                </div>
            ) : error ? (
                <p className="error-message">{error}</p>
            ) : topMediaList.length > 0 ? (
                <ul className="media-list">
                    {topMediaList.map((media, index) => (
                        <li
                            key={media.id}
                            className="media-item"
                            onClick={() => navigate(`/media/${media.id}`)}
                        >
                            <div className="top-list-number">{index + 1}</div>
                            <div className="image-container">
                                <img
                                    src={media.image_url || 'default-placeholder-image-url.jpg'}
                                    alt={media.title}
                                />
                            </div>
                            <div className="media-title">{media.title}</div>
                            <div className="media-rating">
                                {media.average_rating ? `${media.average_rating}/10` : 'Not Yet Rated'}
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

export default TopMediaListsPage;
