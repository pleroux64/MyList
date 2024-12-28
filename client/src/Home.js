import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from './axiosInstance';
import './media-listing.css'; // Keep the unified CSS

function Home({ isAuthenticated, handleLogout }) {
    const [recommendations, setRecommendations] = useState({
        animeSpecific: { data: [], loading: true },
        animeGeneral: { data: [], loading: true },
        movieSpecific: { data: [], loading: true },
        movieGeneral: { data: [], loading: true },
        tvShowSpecific: { data: [], loading: true },
        tvShowGeneral: { data: [], loading: true },
        videoGameSpecific: { data: [], loading: true },
        videoGameGeneral: { data: [], loading: true },
        generalRecs: { data: [], loading: true },
    });

    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            fetchAllRecommendations();
        } else {
            resetRecommendations();
        }
    }, [isAuthenticated]);

    const resetRecommendations = () => {
        setRecommendations({
            animeSpecific: { data: [], loading: false },
            animeGeneral: { data: [], loading: false },
            movieSpecific: { data: [], loading: false },
            movieGeneral: { data: [], loading: false },
            tvShowSpecific: { data: [], loading: false },
            tvShowGeneral: { data: [], loading: false },
            videoGameSpecific: { data: [], loading: false },
            videoGameGeneral: { data: [], loading: false },
            generalRecs: { data: [], loading: false },
        });
    };

    const fetchRecommendations = async (mediaType, useGeneralModel) => {
        try {
            const response = await apiClient.get('media/recommendations/', {
                params: {
                    media_type: mediaType,
                    use_general_model: useGeneralModel,
                    count: 10,
                },
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
                },
            });
            return response.data;
        } catch (error) {
            console.error(`Error fetching ${mediaType} recommendations:`, error);
            return [];
        }
    };

    const fetchAllRecommendations = async () => {
        const keys = [
            { key: 'animeSpecific', mediaType: 'anime', general: false },
            { key: 'animeGeneral', mediaType: 'anime', general: true },
            { key: 'movieSpecific', mediaType: 'movie', general: false },
            { key: 'movieGeneral', mediaType: 'movie', general: true },
            { key: 'tvShowSpecific', mediaType: 'tv_show', general: false },
            { key: 'tvShowGeneral', mediaType: 'tv_show', general: true },
            { key: 'videoGameSpecific', mediaType: 'video_game', general: false },
            { key: 'videoGameGeneral', mediaType: 'video_game', general: true },
            { key: 'generalRecs', mediaType: 'all', general: true },
        ];

        for (const { key, mediaType, general } of keys) {
            setRecommendations((prev) => ({
                ...prev,
                [key]: { ...prev[key], loading: true },
            }));

            const data = await fetchRecommendations(mediaType, general);

            setRecommendations((prev) => ({
                ...prev,
                [key]: { data, loading: false },
            }));
        }
    };

    return (
        <div className="container">
            <h1>Welcome to MyList!</h1>

            <div className="general-message">
                <p>
                    The more media you rate, the more personalized your recommendations will be. If you haven't rated much yet, these recommendations may be based on general user preferences.
                </p>
            </div>

            {isAuthenticated ? (
                <div>
                    <h2>Recommendations:</h2>
                    {Object.keys(recommendations).map((key) => {
                        const { data, loading } = recommendations[key];
                        let prompt = '';

                        // Set prompts based on the key
                        if (key === 'animeSpecific') {
                            prompt = 'People who rated animes similarly to you also liked these animes.';
                        } else if (key === 'animeGeneral') {
                            prompt = 'People who rated overall media similarly to you also liked these animes.';
                        } else if (key === 'movieSpecific') {
                            prompt = 'People who rated movies similarly to you also liked these movies.';
                        } else if (key === 'movieGeneral') {
                            prompt = 'People who rated overall media similarly to you also liked these movies.';
                        } else if (key === 'tvShowSpecific') {
                            prompt = 'People who rated TV shows similarly to you also liked these TV shows.';
                        } else if (key === 'tvShowGeneral') {
                            prompt = 'People who rated overall media similarly to you also liked these TV shows.';
                        } else if (key === 'videoGameSpecific') {
                            prompt = 'People who rated video games similarly to you also liked these video games.';
                        } else if (key === 'videoGameGeneral') {
                            prompt = 'People who rated overall media similarly to you also liked these video games.';
                        } else if (key === 'generalRecs') {
                            prompt = 'People who rated overall media similarly to you also enjoyed these.';
                        }

                        return (
                            <div key={key} className="recommendation-section">
                                <h3>{prompt}</h3>
                                {loading ? (
                                    <div className="loading-spinner-container">
                                        <div className="loading-spinner"></div>
                                        <p>Loading recommendations...</p>
                                    </div>
                                ) : data.length > 0 ? (
                                    <ul className="media-list horizontal-scroll">
                                        {data.map((rec) => (
                                            <li
                                                key={rec.title}
                                                className="media-item"
                                                onClick={() => navigate(`/media/${rec.id}`)}
                                            >
                                                <div className="image-container">
                                                    <img src={rec.image_url} alt={rec.title} />
                                                </div>
                                                <div className="media-title">{rec.title}</div>
                                                <div className="media-rating">
                                                    Rating: {rec.estimated_rating > 0 ? rec.estimated_rating : 'Not Yet Rated'}
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p>No recommendations available for this category.</p>
                                )}
                            </div>
                        );
                    })}
                </div>
            ) : (
                <p>Please log in to see personalized recommendations.</p>
            )}
        </div>
    );
}

export default Home;
