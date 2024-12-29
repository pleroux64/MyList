import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import apiClient from '../utils/axiosInstance';
import '../styles/auth.css'; // Import the CSS file for styling

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false); // Loading state
  const navigate = useNavigate();

  const handleDemoLogin = async () => {
    setLoading(true); // Set loading state to true
    try {
      const response = await apiClient.post('auth/token/', {
        username: 'demo_user',
        password: 'Demo@123',
      });

      localStorage.setItem('accessToken', response.data.access);
      localStorage.setItem('refreshToken', response.data.refresh);
      localStorage.setItem('username', 'demo_user');

      window.dispatchEvent(new Event('storage'));
      navigate('/');
    } catch (error) {
      setError('Failed to log in with the demo account. Please try again.');
    } finally {
      setLoading(false); // Reset loading state
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // Set loading state to true
    try {
      const response = await apiClient.post('auth/token/', {
        username,
        password,
      });

      localStorage.setItem('accessToken', response.data.access);
      localStorage.setItem('refreshToken', response.data.refresh);
      localStorage.setItem('username', username);

      window.dispatchEvent(new Event('storage'));
      navigate('/');
    } catch (error) {
      setError('Invalid username or password. Please try again.');
    } finally {
      setLoading(false); // Reset loading state
    }
  };

  return (
    <div className="auth-container">
      <h2>Login</h2>
      {loading ? (
        <div className="loader-container">
          <div className="loader"></div>
          <p>Loading...</p>
        </div>
      ) : (
        <>
          <form className="auth-form" onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button type="submit">Login</button>
          </form>
          {error && <p className="error-message">{error}</p>}
          <button className="demo-button" onClick={handleDemoLogin}>
            Use Demo Account
          </button>
          <div className="auth-link">
            <p>Don't have an account? <Link to="/register">Sign up</Link></p>
          </div>
        </>
      )}
    </div>
  );
}

export default LoginPage;
