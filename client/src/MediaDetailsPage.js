import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import apiClient from './axiosInstance'; 

function MediaDetailsPage() {
    const { mediaId } = useParams(); // Extract the media ID from the URL
    const [mediaDetails, setMediaDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [status, setStatus] = useState('');
    const [rating, setRating] = useState('');
    const [interactionError, setInteractionError] = useState(null); // Error state for interaction form

    useEffect(() => {
        fetchMediaDetails();
    }, [mediaId]);

    const fetchMediaDetails = async () => {
        try {
            const response = await apiClient.get(`http://127.0.0.1:8000/api/media/detail/${mediaId}/`);
            setMediaDetails(response.data);
        } catch (error) {
            console.error('Error fetching media details:', error);
            setError('Failed to load media details.');
        } finally {
            setLoading(false);
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
            setStatus(''); // Clear the status after submission
            setRating(''); // Clear the rating after submission
        } catch (error) {
            console.error('Error saving interaction:', error);
            setInteractionError('Failed to save interaction. Please try again.');
        }
    };

    if (loading) {
        return <p>Loading media details...</p>;
    }

    if (error) {
        return <p>{error}</p>;
    }

    return (
        <div>
            {mediaDetails ? (
                <div>
                    <h2>{mediaDetails.title}</h2>
                    <img
                        src={mediaDetails.image_url || 'default-placeholder-image-url.jpg'}
                        alt={mediaDetails.title}
                        style={{ width: '200px', height: '300px' }}
                    />
                    <p>Type: {mediaDetails.media_type}</p>
                    <p>Average Rating: {mediaDetails.rating ? `${mediaDetails.rating}/10` : 'Not Yet Rated'}</p>

                    {/* Interaction Form */}
                    <div>
                        <h3>Rate and set status for {mediaDetails.title}</h3>
                        <label>
                            Status:
                            <select value={status} onChange={(e) => setStatus(e.target.value)}>
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
                            <select value={rating} onChange={(e) => setRating(e.target.value)}>
                                <option value="">Rate out of 10</option>
                                {/* Start from 1 to 10 */}
                                {[...Array(10).keys()].map((val) => (
                                    <option key={val + 1} value={val + 1}>{val + 1}</option> // Changed to start from 1
                                ))}
                            </select>
                        </label>
                        <br />
                        <button onClick={handleInteractionSubmit}>Save Interaction</button>
                        {interactionError && <p style={{ color: 'red' }}>{interactionError}</p>}
                    </div>
                </div>
            ) : (
                <p>Media details not found.</p>
            )}
        </div>
    );
}

export default MediaDetailsPage;
