import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import "../styles/About.css"; 

const About = () => {
  return (
    <div className="about-section">
      {/* Hero Section */}
      <motion.div
        className="about-hero"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h1>Our Story</h1>
        <p>Crafting moments, one sip at a time.</p>
      </motion.div>

      {/* About Content */}
      <motion.div
        className="about-content"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <div className="about-text">
          <p color = "#e9f5db" >
            DriftMood Coffee started with a simple mission—bringing you
            sustainably sourced, premium-quality coffee that enhances your daily
            ritual.
          </p>
        </div>
        <motion.img
        src="https://images.pexels.com/photos/230477/pexels-photo-230477.jpeg?w=800&h=250"
        alt="Coffee shop table"
        className="about-image"
        whileHover={{ x: 10 }} // Moves slightly right on hover
        transition={{ duration: 0.4 }}
      />



      </motion.div>

      {/* Why Shop With Us */}
      <motion.div
        className="why-shop"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <h2>Why Shop With Us?</h2>
        <p>
          Sustainable. Ethical. Unforgettable. Every cup supports small artisans
          and eco-friendly practices.
        </p>

        {/* Call-to-Action Button */}
        <div className="about-cta">
          <Link to="/products" className="button">Explore Our Products</Link>
        </div>
      </motion.div>
    </div>
  );
};

export default About;