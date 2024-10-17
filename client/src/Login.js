import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import apiClient from './axiosInstance'; 

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await apiClient.post('http://127.0.0.1:8000/api/auth/token/', {
        username,
        password,
      });

      // Assuming login is successful, save the tokens and update local storage
      localStorage.setItem('accessToken', response.data.access);
      localStorage.setItem('refreshToken', response.data.refresh);

      // Set the username in localStorage to update the display in the Layout
      localStorage.setItem('username', username);

      // Trigger a page update by setting the isAuthenticated state in other components
      window.dispatchEvent(new Event('storage'));

      // Redirect to the home page
      navigate('/');
    } catch (error) {
      setError('Invalid username or password. Please try again.');
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
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
      {error && <p>{error}</p>}
    </div>
  );
}

export default Login;
