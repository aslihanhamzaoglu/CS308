import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Logo.css';

const Logo = ({ size = 'medium' }) => {
  return (
    <Link to="/" className={`logo logo-${size}`}>
      <img 
        src="/logo.png" 
        alt="DriftMood Coffee" 
        className="logo-image"
      />
    </Link>
  );
};

export default Logo;
