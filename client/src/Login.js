import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import apiClient from './axiosInstance'; 
import './auth.css';  // Import the CSS file for styling

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleDemoLogin = () => {
    // Populate form with demo credentials
    setUsername('demo_user');
    setPassword('Demo@123');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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
    }
  };

  return (
    <div className="auth-container">
      <h2>Login</h2>
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
    </div>
  );
}

export default Login;
