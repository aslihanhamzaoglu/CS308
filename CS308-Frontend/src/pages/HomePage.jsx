import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import '../styles/HomePage.css';
import { getCustomerProducts } from '../api/productApi';
import { getAllCategories } from '../api/categoryApi';

const HomePage = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchAndSetRandomProducts = async () => {
      try {
        const [productResponse, categoryResponse] = await Promise.all([
          getCustomerProducts(),
          getAllCategories()
        ]);

        const products = productResponse || [];
        const categoriesMap = new Map(categoryResponse.map(cat => [cat.id, cat.name]));

        const getRandomProducts = (products, count) => {
          const shuffled = [...products].sort(() => 0.5 - Math.random());
          return shuffled.slice(0, count);
        };

        const randomProducts = getRandomProducts(products, 4);
        const processedProducts = randomProducts.map(product => ({
          ...product,
          productId: product.id || product.productId,
          price: Number(product.price) || 0,
          categoryType: categoriesMap.get(product.category_id) || "Unknown"
        }));

        setFeaturedProducts(processedProducts);
        setCategories(categoryResponse);
      } catch (error) {
        console.error('Error fetching products or categories:', error);
      }
    };

    fetchAndSetRandomProducts();
  }, []);

  return (
    <div className="home-page">
      <section className="hero-section">
        <div className="container">
          <div className="hero-content">
            <h1>Welcome to DriftMood Coffee</h1>
            <p> Let your mood drift with every sip </p>
            <div className="hero-buttons">
              <Link to="/products" className="button">Shop Now</Link>
              <Link to="/about" className="button secondary"> View More</Link>
            </div>
          </div>
        </div>
      </section>

<section className="categories-section">
  <div className="container">
    <h2 className="section-title">Our Categories</h2>
    <div className="categories-grid">
      {categories.map(category => (
        <Link
  key={category.id}
  to={`/products?category=${category.id}`}
  className="category-card"
>
          <div className="category-name">
            <h3>{category.name}</h3>
          </div>
        </Link>
      ))}
    </div>
  </div>
</section>




      <section className="featured-products-section">
        <div className="container">
          <h2 className="section-title">Featured Products</h2>
          <div className="products-grid">
            {featuredProducts.map(product => (
              <ProductCard key={product.productId} product={product} />
            ))}
          </div>
          <div className="view-all-link">
            <Link to="/products">View All Products</Link>
          </div>
        </div>
      </section>

      <section className="testimonials-section">
        <div className="container">
          <h2 className="section-title">What Our Customers Say</h2>
          <div className="testimonials-grid">
            <div className="testimonial-card">
              <div className="testimonial-content">
                <p>"The Sumatra Dark Roast is absolutely incredible. Rich, complex flavor that makes my morning something to look forward to."</p>
                <div className="testimonial-author">- Sarah J.</div>
              </div>
            </div>
            <div className="testimonial-card">
              <div className="testimonial-content">
                <p>"I've tried coffee from all over, but Driftmood's Ethiopia Light Roast stands out. The fruity notes are so vibrant!"</p>
                <div className="testimonial-author">- Michael T.</div>
              </div>
            </div>
            <div className="testimonial-card">
              <div className="testimonial-content">
                <p>"Their subscription service is a game-changer. Fresh coffee delivered right when I need it, and I've discovered so many new favorites."</p>
                <div className="testimonial-author">- Emma R.</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="subscription-section">
        <div className="container">
          <div className="subscription-content">
            <h2>Never Run Out of Great Coffee</h2>
            <p>Join our subscription service and receive freshly roasted coffee at your doorstep as often as you'd like.</p>
            <Link to="/subscriptions" className="button">Start Your Subscription</Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
