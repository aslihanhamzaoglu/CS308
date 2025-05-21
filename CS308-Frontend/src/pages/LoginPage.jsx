import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import '../styles/LoginPage.css';
import { signin, signup } from '../api/userApi';
import { addToCart } from '../api/cartApi';

const LoginPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get returnUrl from query parameters
  const searchParams = new URLSearchParams(location.search);
  const returnUrl = searchParams.get('returnUrl') || '/';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!isLogin) {
      if (!formData.name) {
        newErrors.name = 'Name is required';
      }

      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    if (validateForm()) {
      if (isLogin) {
        const user = {
          email: formData.email,
          password: formData.password
        };
        try {
          const userResponse = await signin(user);
          localStorage.setItem('token', userResponse.token); // Save token to localStorage
          localStorage.setItem('role', userResponse.role); // Save role to localStorage

          console.log("User token:", localStorage.getItem('token'));
          console.log("User role:", userResponse.role);

          const token = userResponse.token;

          const guestCart = JSON.parse(localStorage.getItem('guest_cart') || '[]');

          if (guestCart.length > 0) {
            const formattedProducts = guestCart.map(item => ({
              productId: item.productId,
              quantity: item.quantity || 1,
            }));
          
            try {
              await addToCart(token, formattedProducts);
              console.log('Guest cart merged into user cart');
            } catch (err) {
              console.error('Failed to merge guest cart:', err);
            }
            localStorage.removeItem('guest_cart');
          }
          // Redirect based on role
          if (userResponse.role === 'product_manager') {
            navigate('/product-manager');
          } else if (userResponse.role === 'sales_manager') {
            navigate('/sales-manager');
          } else {
            navigate('/'); // Default: customer
          }
        } catch (error) {
          setServerError(error.response?.data?.message || 'Sign-in failed. Please try again.');
        }
      } else {
        const newUser = {
          name: formData.name,
          email: formData.email,
          password: formData.password
        };
        try {
          await signup(newUser);
          setIsLogin(true);
          navigate('/login'); // Go to login page after signup
        } catch (error) {
          setServerError(error.response?.data?.message || 'Sign-up failed. Please try again.');
        }
      }
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setErrors({});
    setServerError('');
  };

  return (
    <div className="login-page">
      <div className="auth-container">
        <h2>{isLogin ? 'Sign In' : 'Create Account'}</h2>

        <form onSubmit={handleSubmit} className="auth-form">
          {!isLogin && (
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your name"
                className={errors.name ? "error" : ""}
              />
              {errors.name && <div className="error-message">{errors.name}</div>}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              className={errors.email ? "error" : ""}
            />
            {errors.email && <div className="error-message">{errors.email}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              className={errors.password ? "error" : ""}
            />
            {errors.password && <div className="error-message">{errors.password}</div>}
          </div>

          {!isLogin && (
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                className={errors.confirmPassword ? "error" : ""}
              />
              {errors.confirmPassword && <div className="error-message">{errors.confirmPassword}</div>}
            </div>
          )}

          {isLogin && (
            <div className="forgot-password">
              <Link to="/forgot-password">Forgot your password?</Link>
            </div>
          )}
          {serverError && <div className="server-error-message">{serverError}</div>}

          <button type="submit" className="auth-button">
            {isLogin ? 'Sign In' : 'Create Account'}
          </button>

          <div className="toggle-auth-mode">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button type="button" onClick={toggleMode}>
              {isLogin ? 'Sign Up' : 'Sign In'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
