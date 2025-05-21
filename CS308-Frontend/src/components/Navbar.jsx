import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getCart } from '@/api/cartApi';
import Logo from './Logo';
import SearchBar from './SearchBar';
import { User, Coffee } from 'lucide-react';
import CoffeeRain from './CoffeeRain';
import '../styles/Navbar.css';
import { Heart } from 'lucide-react';
import { useSearch } from '../contexts/SearchContext';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showCoffeeRain, setShowCoffeeRain] = useState(false);
  const location = useLocation();
  const { closeSearch } = useSearch();

  // Reset search when navigating
  useEffect(() => {
    closeSearch();
  }, [location.pathname, closeSearch]);

  const getCartItems = async () => {
    const token = localStorage.getItem('token');
  
    if (token) {
      try {
        const items = await getCart(token);
        return items || [];
      } catch (err) {
        console.error("Error fetching cart:", err);
        return [];
      }
    } else {
      const guestCart = JSON.parse(localStorage.getItem('guest_cart') || '[]');
      return guestCart;
    }
  };

  const [cartItemCount, setCartItemCount] = useState(0);
  const [userRole, setUserRole] = useState(localStorage.getItem('role'));

  useEffect(() => {
    const fetchCartCount = async () => {
      const items = await getCartItems();
      const total = items.reduce((sum, item) => {
        // Supports both guest and user cart formats
        return sum + (item.count || item.quantity || 0);
      }, 0);
      setCartItemCount(total);
    };
  
    const handleCartUpdate = () => fetchCartCount();
    const handleStorageChange = () => {
      fetchCartCount();
      setIsLoggedIn(!!localStorage.getItem('token'));
      setUserRole(localStorage.getItem('role'));
    };
  
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
    setUserRole(localStorage.getItem('role'));
  
    fetchCartCount();
  
    window.addEventListener('cart-updated', handleCartUpdate); // 👈 custom event
    window.addEventListener('storage', handleStorageChange);   // cross-tab support
  
    return () => {
      window.removeEventListener('cart-updated', handleCartUpdate);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [location.pathname]);
  
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="logo-container">
          <Link to="/">
            <img 
              src="/lovable-uploads/logo.png"
              alt="DriftMood Logo" 
              className="h-20 w-auto"
            />
          </Link>
        </div>

        <div className="nav-menu-container">
          <div className="mobile-toggle" onClick={() => setIsOpen(!isOpen)}>
            <span></span>
            <span></span>
            <span></span>
          </div>

          <ul className={`nav-menu ${isOpen ? 'active' : ''}`}>
            {userRole === 'product_manager' ? (
              <li className="nav-item"><Link to="/product-manager" className="nav-link">Product Manager</Link></li>
            ) : userRole === 'sales_manager' ? (
              <li className="nav-item"><Link to="/sales-manager" className="nav-link">Sales Manager</Link></li>
            ) : (
              <>
                <li className="nav-item"><Link to="/" className="nav-link">Home</Link></li>
                <li className="nav-item"><Link to="/products" className="nav-link">Shop</Link></li>
                <li className="nav-item"><Link to="/about" className="nav-link">About</Link></li>
                <li className="nav-item"><Link to="/contact" className="nav-link">Contact</Link></li>
              </>
            )}
          </ul>

          <SearchBar />

          <div className="nav-actions">
            <button
              onClick={() => setShowCoffeeRain(true)}
              className="p-2 rounded-full hover:bg-coffee-green/10 transition-colors mr-2"
              title="Make it rain coffee!"
            >
              <Coffee size={24} className="text-coffee-brown" />
            </button>

            {isLoggedIn ? (
              <a
                href="http://localhost:8080/profile"
                className="p-2 rounded-full hover:bg-coffee-green/10 transition-colors"
              >
                <User size={24} className="text-coffee-brown" />
              </a>
            ) : (
              <Link to="/login" className="nav-icon login-button">
                <button className="bg-forest-green text-white px-4 py-2 rounded-md hover:bg-dark-green transition-colors">
                  Login
                </button>
              </Link>
            )}

            
            {userRole !== 'product_manager' && userRole !== 'sales_manager' && (
              <>
                <Link to="/wishlist" className="nav-icon wishlist-icon relative mr-2" title="Wishlist">
                  <Heart size={24} className="text-coffee-brown hover:text-rose-500 transition-colors" />
                </Link>

                <Link to="/cart" className="nav-icon cart-icon relative">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                    viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="9" cy="21" r="1"></circle>
                    <circle cx="20" cy="21" r="1"></circle>
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                  </svg>
                  {cartItemCount > 0 && (
                    <span className="cart-count absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {cartItemCount}
                    </span>
                  )}
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
      {showCoffeeRain && <CoffeeRain onEnd={() => setShowCoffeeRain(false)} />}
    </nav>
  );
};

export default Navbar;