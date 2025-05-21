const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors'); // Import CORS
const userRoutes = require('./routes/UserRoutes');
const productRoutes = require('./routes/ProductRoutes');
const categoryRoutes = require('./routes/CategoryRoutes');
const customerInfoRoutes = require('./routes/CustomerInfoRoutes');
const cartRoutes = require('./routes/CartRoutes');
const orderRoutes = require('./routes/OrderRoutes');
const commentRoutes = require('./routes/CommentRoutes');
const rateRoutes = require('./routes/RateRoutes');
const wishlistRoutes = require('./routes/WishlistRoutes');
const refundRoutes = require('./routes/RefundRoutes');

const app = express();

const corsOptions = {
  origin: true, // Allow all origins for local Docker dev
  methods: 'GET,POST,PUT,DELETE',
};


app.use(cors(corsOptions));

// Middleware to parse JSON
app.use(bodyParser.json());

// Use the user routes
app.use('/api/users', userRoutes);

app.use('/api/products', productRoutes);

app.use('/api/categories', categoryRoutes);

app.use('/api/customerinfos', customerInfoRoutes);

app.use('/api/carts', cartRoutes);

app.use('/api/orders', orderRoutes);

app.use('/api/comments', commentRoutes);

app.use('/api/rates', rateRoutes);

app.use('/api/wishlists', wishlistRoutes);

app.use('/api/refunds', refundRoutes);

// Only start server if run directly (not imported by Jest)
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;