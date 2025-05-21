import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, X, ChevronUp, ChevronDown } from 'lucide-react';
import { useSearch } from '../contexts/SearchContext';
import '../styles/SearchBar.css';

const SearchBar = () => {
  const {
    searchTerm,
    setSearchTerm,
    isSearching,
    setIsSearching,
    searchResults,
    currentResultIndex,
    searchPage,
    nextResult,
    prevResult,
    closeSearch
  } = useSearch();
  
  const [inputFocused, setInputFocused] = useState(false);
  const searchInputRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const isProductPage = location.pathname === '/products';

  // Handle search input change
  const handleInputChange = (e) => {
    const newSearchTerm = e.target.value;
    setSearchTerm(newSearchTerm);
    
    // For non-product pages, perform live search as user types (like Ctrl+F)
    if (!isProductPage && newSearchTerm.trim()) {
      setIsSearching(true);
      searchPage();
    }
    
    // If search term is cleared, close search
    if (!newSearchTerm.trim() && isSearching) {
      closeSearch();
    }
  };

  // Handle search form submission
  const handleSearch = (e) => {
    e.preventDefault();
    
    if (!searchTerm.trim()) return;
    
    // If on products page, use the built-in product filtering
    if (isProductPage) {
      // Just trigger the search without opening the global search UI
      return;
    }
    
    // For other pages, use the global search
    setIsSearching(true);
    searchPage();
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl+F or Cmd+F to focus search
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        searchInputRef.current?.focus();
        
        // If there's already a search term, trigger search
        if (searchTerm.trim() && !isProductPage) {
          setIsSearching(true);
          searchPage();
        }
      }
      
      // Escape to close search
      if (e.key === 'Escape' && isSearching) {
        closeSearch();
      }
      
      // Enter to search when input is focused
      if (e.key === 'Enter' && document.activeElement === searchInputRef.current) {
        handleSearch(e);
      }
      
      // Navigation between results
      if (isSearching) {
        if (e.key === 'F3' || (e.ctrlKey && e.key === 'g')) {
          e.preventDefault();
          nextResult();
        }
        
        if ((e.shiftKey && e.key === 'F3') || (e.ctrlKey && e.shiftKey && e.key === 'g')) {
          e.preventDefault();
          prevResult();
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearching, searchTerm, closeSearch, nextResult, prevResult, isProductPage, searchPage]);

  return (
    <>
      <div className="search-bar">
        <form onSubmit={handleSearch}>
          <div className="search-input-container">
            <input
              ref={searchInputRef}
              type="text"
              placeholder={isProductPage ? "Search products..." : "Search on page..."}
              value={searchTerm}
              onChange={handleInputChange}
              onFocus={() => setInputFocused(true)}
              onBlur={() => setTimeout(() => setInputFocused(false), 200)}
            />
            {searchTerm && (
              <button
                type="button"
                className="clear-button"
                onClick={() => {
                  setSearchTerm('');
                  closeSearch();
                  searchInputRef.current?.focus();
                }}
              >
                <X size={16} />
              </button>
            )}
            <button type="submit" className="search-button">
              <Search size={20} />
            </button>
          </div>
        </form>
      </div>
      
      {/* Search results overlay - only show for non-product pages */}
      {isSearching && !isProductPage && (
        <div className="search-results-overlay">
          <div className="search-results-container">
            <div className="search-results-header">
              <span className="results-count">
                {searchResults.length > 0
                  ? `${currentResultIndex + 1} of ${searchResults.length} matches`
                  : 'No matches found'}
              </span>
              <div className="search-controls">
                <button 
                  onClick={prevResult} 
                  disabled={searchResults.length === 0}
                  title="Previous match (Shift+F3)"
                >
                  <ChevronUp size={16} />
                </button>
                <button 
                  onClick={nextResult} 
                  disabled={searchResults.length === 0}
                  title="Next match (F3)"
                >
                  <ChevronDown size={16} />
                </button>
                <button onClick={closeSearch} title="Close search (Esc)">
                  <X size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SearchBar;
