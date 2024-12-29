import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import apiClient from '../utils/axiosInstance';
import '../styles/auth.css'; // Import the CSS file for styling

function SignUpPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false); // Add loading state
  const navigate = useNavigate();

  const handleDemoLogin = async () => {
    setLoading(true); // Show loader
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
      setLoading(false); // Hide loader
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // Show loader
    try {
      await apiClient.post('auth/register/', {
        username,
        email,
        password,
      });

      const loginResponse = await apiClient.post('auth/token/', {
        username,
        password,
      });

      localStorage.setItem('accessToken', loginResponse.data.access);
      localStorage.setItem('refreshToken', loginResponse.data.refresh);
      localStorage.setItem('username', username);

      window.dispatchEvent(new Event('storage'));
      navigate('/');
    } catch (error) {
      if (error.response && error.response.data) {
        const errorData = error.response.data;
        // Extract specific error messages from the backend response
        if (errorData.username) {
          setError(`Username: ${errorData.username[0]}`);
        } else if (errorData.email) {
          setError(`Email: ${errorData.email[0]}`);
        } else if (errorData.non_field_errors) {
          setError(errorData.non_field_errors[0]);
        } else {
          setError('Failed to register. Please check your input.');
        }
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false); // Hide loader
    }
  };

  return (
    <div className="auth-container">
      <h2>Register</h2>
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
          <button className="demo-button" onClick={handleDemoLogin}>
            Use Demo Account
          </button>
          <div className="auth-link">
            <p>Already have an account? <Link to="/login">Login</Link></p>
          </div>
        </>
      )}
    </div>
  );
}

export default SignUpPage;
