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
      await apiClient.post('http://127.0.0.1:8000/api/auth/register/', {
        username,
        email,
        password,
      });

      navigate('/');
    } catch (error) {
      setError('Failed to register. Please try again.');
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
