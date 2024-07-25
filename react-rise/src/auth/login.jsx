import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(username, password);
      navigate('/shop'); 
    } catch (error) {
      console.error('Error during login:', error);
      alert('Login failed');
    }
  };

  const handleGoogleSignIn = () => {
    window.location.href = '/auth/google';
  };

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
        />
        <button type="submit">Login</button>
      </form>
      <button onClick={handleGoogleSignIn} style={{ marginTop: '10px' }}>
        Sign in with Google
      </button>
      <div style={{ marginTop: '10px' }}>
        <p>New user? <a href="/register">Register here</a></p>
      </div>
    </div>
  );
};

export default Login;
