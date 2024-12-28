import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import apiClient from './axiosInstance';
import './media-listing.css'; // Import the unified CSS

function MediaDetailsPage() {
    const { mediaId } = useParams(); // Extract the media ID from the URL
    const [mediaDetails, setMediaDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [status, setStatus] = useState('');
    const [rating, setRating] = useState('');
    const [interactionError, setInteractionError] = useState(null); // Error state for interaction form

    const isAuthenticated = !!localStorage.getItem('accessToken'); // Check if user is authenticated

    useEffect(() => {
        fetchMediaDetails();
        if (isAuthenticated) {
            fetchUserInteraction(); // Fetch interaction only if the user is logged in
        }
    }, [mediaId, isAuthenticated]);

    // Fetch the media details
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

    // Fetch the user's interaction with the media
    const fetchUserInteraction = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            const response = await apiClient.get(`user-media-interaction/${mediaId}/`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.data) {
                setStatus(response.data.status); // Pre-fill the status
                setRating(response.data.rating.toString()); // Pre-fill the rating as a string for the select input
            }
        } catch (error) {
            console.error('Error fetching user interaction:', error);
        }
    };

    const handleInteractionSubmit = async () => {
        const token = localStorage.getItem('accessToken');
        const payload = {
            media: mediaId,
            status: status,
            rating: parseFloat(rating), // Ensure rating is a number
        };

        try {
            await apiClient.post(
                'media/interactions/',
                payload,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            );
            alert('Interaction saved successfully!');
        } catch (error) {
            console.error('Error saving interaction:', error);
            setInteractionError('Failed to save interaction. Please try again.');
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
        return <p>{error}</p>;
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
                            <div className="media-info-group">
                                <p><strong>Type:</strong> {formatMediaType(mediaDetails.media_type)}</p>
                                <p>
                                    <strong>Average Rating:</strong> 
                                    {mediaDetails.rating ? `${mediaDetails.rating}/10` : 'Not Yet Rated'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Display description below the image and details */}
                    {mediaDetails.description && (
                        <div className="media-description">
                            <h3>Description:</h3>
                            <p>{mediaDetails.description}</p>
                        </div>
                    )}

                    {/* Only show interaction form if the user is logged in */}
                    {isAuthenticated && (
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
                                    {/* Show different status options based on media type */}
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
                            {interactionError && <p className="error-text">{interactionError}</p>}
                        </div>
                    )}
                </div>
            ) : (
                <p>Media details not found.</p>
            )}
        </div>
    );
}

export default MediaDetailsPage;
