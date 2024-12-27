import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from './axiosInstance';
import './media-listing.css';  // Keep the unified CSS

function Home({ isAuthenticated, handleLogout }) {
    const [recommendations, setRecommendations] = useState({
        animeSpecific: [],
        animeGeneral: [],
        movieSpecific: [],
        movieGeneral: [],
        tvShowSpecific: [],
        tvShowGeneral: [],
        videoGameSpecific: [],
        videoGameGeneral: [],
        generalRecs: []
    });

    const navigate = useNavigate(); // Initialize useNavigate

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            fetchAllRecommendations();
        } else {
            setRecommendations({
                animeSpecific: [],
                animeGeneral: [],
                movieSpecific: [],
                movieGeneral: [],
                tvShowSpecific: [],
                tvShowGeneral: [],
                videoGameSpecific: [],
                videoGameGeneral: [],
                generalRecs: []
            });
        }
    }, [isAuthenticated]);

    const fetchRecommendations = async (mediaType, useGeneralModel) => {
        try {
            const response = await apiClient.get('http://localhost:8000/api/media/recommendations/', {
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
        const token = localStorage.getItem('accessToken');
        if (!token) return;

        const animeSpecific = await fetchRecommendations('anime', false);
        const animeGeneral = await fetchRecommendations('anime', true);
        const movieSpecific = await fetchRecommendations('movie', false);
        const movieGeneral = await fetchRecommendations('movie', true);
        const tvShowSpecific = await fetchRecommendations('tv_show', false);
        const tvShowGeneral = await fetchRecommendations('tv_show', true);
        const videoGameSpecific = await fetchRecommendations('video_game', false);
        const videoGameGeneral = await fetchRecommendations('video_game', true);
        const generalRecs = await fetchRecommendations('all', true);

        setRecommendations({
            animeSpecific,
            animeGeneral,
            movieSpecific,
            movieGeneral,
            tvShowSpecific,
            tvShowGeneral,
            videoGameSpecific,
            videoGameGeneral,
            generalRecs
        });
    };

    return (
        <div className="container">
            <h1>Welcome to MyList!</h1>

            <div className="general-message">
                <p>The more media you rate, the more personalized your recommendations will be. If you haven't rated much yet, these recommendations may be based on general user preferences.</p>
            </div>

            {isAuthenticated ? (
                <div>
                    <h2>Recommendations:</h2>

                    {Object.keys(recommendations).map((key) => {
                        const recs = recommendations[key];
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
                                {recs && recs.length > 0 ? (
                                    <ul className="media-list horizontal-scroll">
                                        {recs.map((rec) => (
                                            <li 
                                                key={rec.title} 
                                                className="media-item"
                                                onClick={() => navigate(`/media/${rec.id}`)} // Add navigation on click
                                            >
                                                <div className="image-container">
                                                    <img
                                                        src={rec.image_url}
                                                        alt={rec.title}
                                                    />
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
