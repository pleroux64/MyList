import React, { useEffect, useState } from 'react';
import axios from 'axios';

function MediaList() {
    const [mediaList, setMediaList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Function to fetch the user's media list from the backend
        const fetchMediaList = async () => {
            const token = localStorage.getItem('accessToken'); // Retrieve the token from local storage

            if (!token) {
                setError('No access token found. Please log in again.');
                setLoading(false);
                return;
            }

            try {
                const response = await axios.get('http://127.0.0.1:8000/api/media/user-media-list/', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
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

        fetchMediaList();
    }, []);

    if (loading) {
        return <p>Loading your media list...</p>;
    }

    if (error) {
        return <p>{error}</p>;
    }

    return (
        <div>
            <h2>Your Media List</h2>
            {mediaList.length > 0 ? (
                <ul>
                    {mediaList.map((interaction) => (
                        <li key={interaction.id}>
                            <strong>{interaction.media?.title || 'Unknown Media'}</strong> - Status: {interaction.status} - Rating: {interaction.rating}/10
                        </li>
                    ))}
                </ul>
            ) : (
                <p>You have no interactions with media items yet.</p>
            )}
        </div>
    );
}

export default MediaList;
