// src/axiosInstance.js
import axios from 'axios';

const apiClient = axios.create({
    baseURL: 'http://127.0.0.1:8000/api/', // Replace with your backend API base URL
});

// Add an interceptor to handle token refresh on 401 Unauthorized responses
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Check if the response status is 401 (Unauthorized) and if it is not a retry
        if (error.response && error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true; // Prevent infinite retry loop

            // Get the refresh token from localStorage
            const refreshToken = localStorage.getItem('refreshToken');
            if (refreshToken) {
                try {
                    // Make a request to refresh the access token using the refresh token
                    const response = await axios.post('http://127.0.0.1:8000/api/auth/token/refresh/', {
                        refresh: refreshToken,
                    });

                    // Save the new access token in localStorage
                    localStorage.setItem('accessToken', response.data.access);

                    // Update the original request with the new access token
                    originalRequest.headers['Authorization'] = `Bearer ${response.data.access}`;

                    // Retry the original request
                    return apiClient(originalRequest);
                } catch (refreshError) {
                    console.error('Failed to refresh token:', refreshError);
                    // Optionally, log out the user or redirect to the login page
                }
            }
        }

        return Promise.reject(error); // Return the error if it's not a 401 or a retry
    }
);

export default apiClient;
