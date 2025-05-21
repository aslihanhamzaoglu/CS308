import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ShoppingCart, Star, Heart } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { addToCart, getCart } from '@/api/cartApi';
import { getStockById } from '@/api/productApi';
import { getRatingsByProduct } from '@/api/rateApi';
import { addProductToWishlist, removeProductFromWishlist, getWishlist } from '@/api/wishlistApi';
import { addToLocalCart } from '@/utils/cartUtils';
import OutOfStockDialog from './OutOfStockDialog';
import '../styles/ProductCard.css';
import { Button } from '@/components/ui/button';

const getStarRatingFromPopularity = (popularity: number): number => {
  return Math.max(1, Math.min(5, Math.round(popularity / 20)));
};

interface Product {
  productId: number;
  name: string;
  description: string;
  price: number;
  picture: string;
  rating: number;
  numReviews: number;
  stock: boolean;
  categoryId: number;
  categoryType: string;
  popularity?: number;
  discount?: number;
}

interface ProductCardProps {
  product: Product;
  isTopThree: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, isTopThree }) => {
  const navigate = useNavigate();

  const [actualStock, setActualStock] = useState<number | null>(null);
  const [averageRating, setAverageRating] = useState<number | null>(null);
  const [wishlistIds, setWishlistIds] = useState<number[]>([]);
  const [isOutOfStockDialogOpen, setIsOutOfStockDialogOpen] = useState(false);
  const [insufficientStockMessage, setInsufficientStockMessage] = useState('');

  const {
    productId,
    name,
    description,
    price,
    picture,
    categoryType,
    popularity = 0,
    rating,
    discount = 0

  } = product;

  const isInWishlist = wishlistIds.includes(productId);

const fetchWishlistIds = async (token: string) => {
  try {
    const res = await getWishlist(token); // returns array like [1, 2, 3]
    setWishlistIds(res);
  } catch (err) {
    console.error("Failed to fetch wishlist:", err);
  }
};

useEffect(() => {
  const token = localStorage.getItem("token");
  if (token) fetchWishlistIds(token);

  const handleUpdate = () => {
    const token = localStorage.getItem("token");
    if (token) fetchWishlistIds(token);
  };

  window.addEventListener("wishlist-updated", handleUpdate);

  // ✅ FETCH THE ACTUAL STOCK RIGHT AWAY
  getStockById(productId)
    .then(setActualStock)
    .catch(() => setActualStock(0)); // fallback if API fails

  return () => {
    window.removeEventListener("wishlist-updated", handleUpdate);
  };
}, []);


  
  
  const starRating = getStarRatingFromPopularity(popularity);
  const hasDiscount = discount > 0;
  const discountedPrice = hasDiscount ? price * (1 - discount / 100) : price;



  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const token = localStorage.getItem('token');
    let currentCartQuantity = 0;

    if (token) {
      try {
        const cartResponse = await getCart(token);
        const cartItem = cartResponse.find(item => item.product.id === productId);
        currentCartQuantity = cartItem ? cartItem.count : 0;
      } catch (error) {
        console.error('Error fetching cart:', error);
      }
    } else {
      const localCart = JSON.parse(localStorage.getItem('guest_cart') || '[]');
      const localCartItem = localCart.find(item => item.productId === productId);
      currentCartQuantity = localCartItem ? localCartItem.quantity : 0;
    }

    if (actualStock !== null && (actualStock === 0 || currentCartQuantity + 1 > actualStock)) {
      setInsufficientStockMessage(`Sorry, ${name} is currently out of stock.`);
      setIsOutOfStockDialogOpen(true);
      return;
    }

    try {
      if (token) {
        await addToCart(token, [{ productId, quantity: 1 }]);
      } else {
        addToLocalCart({ productId, name, price, picture });
      }
      window.dispatchEvent(new Event('cart-updated'));
      toast(`${name} added to your cart.`);

      const newStock = await getStockById(productId);
      setActualStock(newStock);
    } catch (err) {
      console.error(err);
      toast(
        <div>
          <strong className="font-medium">Error</strong>
          <div className="text-sm text-muted-foreground">Could not add to cart.</div>
        </div>
      );
          }
  };

const handleToggleWishlist = async (e: React.MouseEvent) => {
  e.preventDefault();
  e.stopPropagation();

  const token = localStorage.getItem('token');
  if (!token) {
    toast(
      <div>
        <strong className="font-medium">Login Required</strong>
        <div className="text-sm text-muted-foreground">
          Please sign in to add items to your wishlist.
        </div>
      </div>
    );    
    return;
  }

  try {
    if (isInWishlist) {
      await removeProductFromWishlist(token, productId);
      setWishlistIds(prev => prev.filter(id => id !== productId));
      toast(`${name} removed from your wishlist.`);
    } else {
      await addProductToWishlist(token, productId);
      setWishlistIds(prev => [...prev, productId]); 
      toast(`${name} added to your wishlist.`);
    }

    window.dispatchEvent(new Event('wishlist-updated')); 
  } catch (err) {
    console.error('Wishlist toggle error:', err);
    toast(
      <div>
        <strong className="font-medium">Error</strong>
        <div className="text-sm text-muted-foreground">Wishlist action failed.</div>
      </div>
    );
  }
};

return (
  <>
    <div className={`product-card ${actualStock === 0 ? 'out-of-stock' : ''}`}>
      <div className="product-content">
        <div className="relative overflow-hidden">
          <Link to={`/product/${productId}`}>
            <img src={picture} alt={name} className="w-full h-64 object-cover" loading="lazy" />
          </Link>

          {/* Moved OUTSIDE the Link */}
          <button
            onClick={handleToggleWishlist}
            className="absolute bottom-3 right-3 z-20 bg-white/90 hover:bg-white text-driftmood-dark p-1 rounded-full shadow transition"
            title={isInWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
          >
            <Heart size={18} fill={isInWishlist ? "#65a30d" : "none"} stroke="#65a30d" />
          </button>

          {actualStock === 0 && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="bg-driftmood-dark text-white px-4 py-2 rounded-md font-medium">
                Out of Stock
              </span>
            </div>
          )}
          
          {actualStock !== null && actualStock <= 10 && actualStock > 0 && (
  <div className="absolute top-12 right-3">
    <Badge
      variant="outline"
      className="bg-yellow-100 border-yellow-300 text-yellow-800 px-2 py-1 text-[10px] font-bold rounded-full"
    >
      Only {actualStock} left!
    </Badge>
  </div>
)}

          
          {isTopThree && (
            <div className="absolute top-3 -left-8 transform -rotate-45 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white text-[10px] font-extrabold px-8 py-1 shadow-xl overflow-hidden flex justify-center items-center">
              <span className="relative z-10">Best Seller</span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer-slow"></div>
            </div>
          )}
          
          {hasDiscount && (
            <div className="absolute bottom-3 left-3 z-10">
              <Badge
                variant="outline"
                className="bg-red-600 border-red-700 text-white px-2 py-1 text-[10px] font-bold rounded-full shadow"
              >
                {discount}% OFF
              </Badge>
            </div>
          )}

          <div className="absolute top-3 right-3">
            <Badge
              variant="outline"
              className="bg-driftmood-lightlime border-driftmood-lime text-driftmood-dark px-2 py-1 text-[10px] font-bold rounded-full"
            >
              {categoryType || "Unknown Category"}
            </Badge>
          </div>
        </div>

        {/* This Link wraps only product info */}
        <Link to={`/product/${productId}`}>
          <div className="product-info">
            <h3 className="product-name">{name}</h3>
            <p className="product-description">{description}</p>
            <div className="flex items-center mb-2">
              <div className="flex mr-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={18}
                    className={cn(
                      averageRating !== null && star <= Math.round(averageRating)
                        ? "rating-star-filled"
                        : "rating-star"
                    )}
                    fill={averageRating !== null && star <= Math.round(averageRating) ? "currentColor" : "none"}
                  />
                ))}
              </div>
            </div>
            <div className="product-price">
              ${!isNaN(Number(price)) ? Number(price).toFixed(2) : '0.00'}
            </div>
          </div>
        </Link>
      </div>

      <button
        className="auth-button flex items-center justify-center mt-auto w-full bg-[#2d6a4f] hover:bg-[#1b4332] text-white px-4 py-3 rounded-md transition-colors duration-200"
        disabled={actualStock === 0}
        onClick={handleAddToCart}
      >
        <ShoppingCart size={18} className="mr-2" />
        {actualStock === 0 ? 'Out of Stock' : 'Add to Cart'}
      </button>
    </div>

    <OutOfStockDialog
      isOpen={isOutOfStockDialogOpen}
      onOpenChange={setIsOutOfStockDialogOpen}
      productName={insufficientStockMessage}
    />
  </>
);
};

export default ProductCard;