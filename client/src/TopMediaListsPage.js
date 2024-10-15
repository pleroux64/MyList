import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function TopMediaListsPage() {
    const [mediaType, setMediaType] = useState('movie'); // Default to 'movie' initially
    const [topMediaList, setTopMediaList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate(); // For navigation

    useEffect(() => {
        fetchTopMediaListByType(mediaType); // Fetch the top media list whenever the media type changes
    }, [mediaType]);

    const fetchTopMediaListByType = async (type) => {
        setLoading(true);
        setError(null);

        try {
            // Fetch the top media list from your database for the selected media type
            const response = await axios.get(`http://127.0.0.1:8000/api/media/top-media/${type}/`);
            setTopMediaList(response.data);
        } catch (error) {
            console.error('Error fetching top media list:', error);
            setError('An error occurred while fetching the top media list.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <p>Loading top media list...</p>;
    }

    if (error) {
        return <p>{error}</p>;
    }

    return (
        <div>
            <h2>Top {mediaType.charAt(0).toUpperCase() + mediaType.slice(1)}s</h2>
            <div>
                <label>Select Media Type: </label>
                <select value={mediaType} onChange={(e) => setMediaType(e.target.value)}>
                    <option value="movie">Movies</option>
                    <option value="anime">Anime</option>
                    <option value="video_game">Video Games</option>
                    <option value="tv_show">TV Shows</option>
                </select>
            </div>
            {topMediaList.length > 0 ? (
                <ul>
                    {topMediaList.map((media) => (
                        <li
                            key={media.id}
                            style={{ display: 'flex', alignItems: 'center', margin: '10px 0', cursor: 'pointer' }}
                            onClick={() => navigate(`/media/${media.id}`)} // Navigate to media details page
                        >
                            <img
                                src={media.image_url || 'default-placeholder-image-url.jpg'}
                                alt={media.title}
                                style={{ width: '100px', height: '150px', marginRight: '15px' }}
                            />
                            <div>
                                <strong>{media.title}</strong> - Average Rating: {media.average_rating || 'Not Yet Rated'}
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
