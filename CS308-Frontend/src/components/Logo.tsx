import { Link } from 'react-router-dom';

const Logo = () => {
  return (
    <Link to="/" className="logo-container">
      <img 
        src="/lovable-uploads/logo.png" 
        alt="DriftMood Logo" 
        className="h-20 w-auto"
      />
    </Link>
  );
};

export default Logo; 