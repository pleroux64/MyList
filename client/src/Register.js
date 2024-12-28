import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from './axiosInstance'; 
import './auth.css';  // Import the CSS file for styling

function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Register the user
      await apiClient.post('auth/register/', {
        username,
        email,
        password,
      });

      // Log the user in immediately
      const loginResponse = await apiClient.post('auth/token/', {
        username,
        password,
      });

      // Store tokens in localStorage
      localStorage.setItem('accessToken', loginResponse.data.access);
      localStorage.setItem('refreshToken', loginResponse.data.refresh);
      localStorage.setItem('username', username);

      // Trigger storage event for state synchronization
      window.dispatchEvent(new Event('storage'));

      // Navigate to home page
      navigate('/');
    } catch (error) {
      setError('Failed to register or log in. Please try again.');
    }
  };

  return (
    <div className="auth-container">
      <h2>Register</h2>
      <form className="auth-form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Register</button>
      </form>
      {error && <p className="error-message">{error}</p>}
    </div>
  );
}

export default Register;
