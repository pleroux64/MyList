import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import apiClient from '../utils/axiosInstance';
import '../styles/media-listing.css'; // Import the unified CSS

function MediaDetailsPage() {
    const { mediaId } = useParams();
    const [mediaDetails, setMediaDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [status, setStatus] = useState('');
    const [rating, setRating] = useState('');
    const [feedbackMessage, setFeedbackMessage] = useState(null);
    const isAuthenticated = !!localStorage.getItem('accessToken');

    useEffect(() => {
        fetchMediaDetails();
        if (isAuthenticated) {
            fetchUserInteraction();
        }
    }, [mediaId, isAuthenticated]);

    // Fetch media details
    const fetchMediaDetails = async () => {
        try {
            const response = await apiClient.get(`media/detail/${mediaId}/`);
            setMediaDetails(response.data);
        } catch (error) {
            console.error('Error fetching media details:', error);
            setError('Failed to load media details.');
        } finally {
            setLoading(false);
        }
    };

    // Fetch user's interaction with the media (to pre-fill the form)
    const fetchUserInteraction = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            const response = await apiClient.get(`media/has-interacted/${mediaId}/`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.data.interacted) {
                setStatus(response.data.status || '');
                setRating(response.data.rating?.toString() || '');
            }
        } catch (error) {
            if (error.response?.status === 404) {
                console.log('No previous interaction found for this media.');
            } else {
                console.error('Error fetching user interaction:', error);
            }
        }
    };

    const handleInteractionSubmit = async () => {
        const token = localStorage.getItem('accessToken');
        const payload = {
            media: mediaId,
            status,
            rating: parseFloat(rating),
        };

        try {
            const response = await apiClient.post('media/interactions/', payload, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.status === 201) {
                setFeedbackMessage({ type: 'success', text: 'Interaction added successfully!' });
            } else if (response.status === 200) {
                setFeedbackMessage({ type: 'success', text: 'Interaction updated successfully!' });
            }
        } catch (error) {
            console.error('Error saving interaction:', error);
            setFeedbackMessage({ type: 'error', text: 'Failed to save interaction. Please try again.' });
        }
    };

    const formatMediaType = (mediaType) => {
        switch (mediaType) {
            case 'tv_show':
                return 'TV Show';
            case 'video_game':
                return 'Video Game';
            case 'anime':
                return 'Anime';
            case 'movie':
                return 'Movie';
            default:
                return mediaType.charAt(0).toUpperCase() + mediaType.slice(1);
        }
    };

    if (loading) {
        return (
            <div className="loader-container">
                <div className="loading-spinner"></div>
                <p>Loading media details...</p>
            </div>
        );
    }

    if (error) {
        return <p className="error-message">{error}</p>;
    }

    return (
        <div className="container">
            {mediaDetails ? (
                <div className="media-details">
                    <h2 className="media-details-title">{mediaDetails.title}</h2>
                    <div className="media-details-content">
                        <div className="image-container">
                            <img
                                src={mediaDetails.image_url || 'default-placeholder-image-url.jpg'}
                                alt={mediaDetails.title}
                            />
                        </div>
                        <div className="media-details-info">
                            <p><strong>Type:</strong> {formatMediaType(mediaDetails.media_type)}</p>
                            <p>
                                <strong>Average Rating:</strong>{' '}
                                {mediaDetails.rating ? `${mediaDetails.rating}/10` : 'Not Yet Rated'}
                            </p>
                        </div>
                    </div>
                    {mediaDetails.description && (
                        <div className="media-description">
                            <h3>Description:</h3>
                            <p>{mediaDetails.description}</p>
                        </div>
                    )}
                    {isAuthenticated ? (
                        <div className="interaction-form">
                            <h3>Rate and set status for {mediaDetails.title}</h3>
                            <label>
                                Status:
                                <select
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
                                    className="form-control"
                                >
                                    <option value="">Select a status</option>
                                    {mediaDetails.media_type === 'video_game' ? (
                                        <>
                                            <option value="played">Played</option>
                                            <option value="playing">Playing</option>
                                            <option value="plan_to_play">Plan to Play</option>
                                        </>
                                    ) : (
                                        <>
                                            <option value="watched">Watched</option>
                                            <option value="watching">Watching</option>
                                            <option value="plan_to_watch">Plan to Watch</option>
                                        </>
                                    )}
                                </select>
                            </label>
                            <br />
                            <label>
                                Rating:
                                <select
                                    value={rating}
                                    onChange={(e) => setRating(e.target.value)}
                                    className="form-control"
                                >
                                    <option value="">Rate out of 10</option>
                                    {[...Array(10).keys()].map((val) => (
                                        <option key={val + 1} value={val + 1}>
                                            {val + 1}
                                        </option>
                                    ))}
                                </select>
                            </label>
                            <br />
                            <button className="submit-button" onClick={handleInteractionSubmit}>
                                Save Interaction
                            </button>
                            {feedbackMessage && (
                                <p
                                    className={`feedback-message ${
                                        feedbackMessage.type === 'success' ? 'success' : 'error'
                                    }`}
                                >
                                    {feedbackMessage.text}
                                </p>
                            )}
                        </div>
                    ) : (
                        <p className="login-prompt">
                            Please <Link to="/login">log in</Link> to interact with this media.
                        </p>
                    )}
                </div>
            ) : (
                <p>Media details not found.</p>
            )}
        </div>
    );
}

export default MediaDetailsPage;
