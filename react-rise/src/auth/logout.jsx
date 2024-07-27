import React from 'react';
import { useAuth } from '../context/AuthContext';

const Logout = () => {
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = '/';
    } catch (error) {
      console.error('Error during logout:', error);
      alert('Logout failed');
    }
  };
  const logoutclass = {
    display: "grid",
    placeItems: "center"
  };
 

  return (
    <div style={logoutclass}>
      <p>Are You Sure Want to Logout?</p>
    <button onClick={handleLogout} className="login-button">Logout</button>
    </div>
    
  );
};

export default Logout;
