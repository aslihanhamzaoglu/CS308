import React from 'react';
import { useParams } from 'react-router-dom';
import { Star, ShoppingCart, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import '../ProductDetailPage.css';

import { getAllProducts, getStockById } from '@/api/productApi';

import { getCustomerProducts } from '@/api/productApi';

import { getAllCategories } from '@/api/categoryApi';
import { addToCart, getCart } from '@/api/cartApi';
import { addToLocalCart } from '@/utils/cartUtils';
import { getRatingsByProduct } from '@/api/rateApi';
import { getCommentsByProduct } from '@/api/commentApi';
import OutOfStockDialog from '@/components/OutOfStockDialog';
import { addProductToWishlist, removeProductFromWishlist, getWishlist } from '@/api/wishlistApi';

const ProductDetailPage = () => {
  const { id } = useParams();
  const [products, setProducts] = React.useState([]);
  const [categories, setCategories] = React.useState([]);
  const [activeTab, setActiveTab] = React.useState('description');
  const [quantity, setQuantity] = React.useState(1);
  const [ratings, setRatings] = React.useState<number[]>([]);
  const [averageRating, setAverageRating] = React.useState<number | null>(null);
  const [comments, setComments] = React.useState([]);
  const [actualStock, setActualStock] = React.useState<number | null>(null);
  const [isOutOfStockDialogOpen, setIsOutOfStockDialogOpen] = React.useState(false);
  const [insufficientStockMessage, setInsufficientStockMessage] = React.useState('');
  const [isInWishlist, setIsInWishlist] = React.useState(false);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const productsResponse = await getAllProducts();
        let productsData = Array.isArray(productsResponse) ? productsResponse : productsResponse.products || productsResponse.data || [];
        /*
        // Fetch products - using getCustomerProducts to only get products with prices set
        const productsResponse = await getCustomerProducts();
        console.log('API Response:', productsResponse);
        */
        if (!productsResponse) {
          console.error('No response from API');
          return;
        }

        if (id) {
          try {
            const ratingsResponse = await getRatingsByProduct(Number(id));
            const ratingValues = Array.isArray(ratingsResponse.ratings)
              ? ratingsResponse.ratings.map((r) => Number(r.rate))
              : [];
            
            setRatings(ratingValues);
            setAverageRating(ratingValues.length > 0 ? ratingValues.reduce((a, b) => a + b, 0) / ratingValues.length : null);

            const commentData = await getCommentsByProduct(Number(id));
            setComments(commentData);

            const stockAmount = await getStockById(Number(id));
            setActualStock(stockAmount);
          } catch (err) {
            console.error("Error fetching product details:", err);
          }
        }

        const transformed = productsData.map(p => ({
          ...p,
          productId: p.id || p.productId,
          picture: p.imageUrl || p.picture,
          stock: p.inStock || p.stock,
          categoryId: p.category_id || p.categoryId,
          price: Number(p.price) || 0,
          popularity: Number(p.popularity) || 0,
        }));

        setProducts(transformed);
        const categoriesResponse = await getAllCategories();
        setCategories(categoriesResponse);

        const token = localStorage.getItem('token');
        if (token && id) {
          const wishlist = await getWishlist(token);
          const parsedId = Number(id);
          setIsInWishlist(wishlist.includes(parsedId));
        }
      } catch (err) {
        console.error(err);
        toast(
          <div>
            <strong className="font-medium">Error</strong>
            <div className="text-sm text-muted-foreground">Failed to load product data</div>
          </div>
        );
      }
    };
    fetchData();
  }, [id]);

  const product = products.find(p => p.productId === Number(id));
  if (!product) return <div className="text-center py-10">Product not found</div>;

  const handleAddToCart = async () => {
    const token = localStorage.getItem('token');
    let currentCartQuantity = 0;
    if (token) {
      const cartResponse = await getCart(token);
      const cartItem = cartResponse.find(item => item.product.id === product.productId);
      currentCartQuantity = cartItem ? cartItem.count : 0;
    } else {
      const localCart = JSON.parse(localStorage.getItem('guest_cart') || '[]');
      const localCartItem = localCart.find(item => item.productId === product.productId);
      currentCartQuantity = localCartItem ? localCartItem.quantity : 0;
    }

    if (actualStock !== null && (actualStock === 0 || currentCartQuantity + quantity > actualStock)) {
      setInsufficientStockMessage(`Sorry, ${product.name} is currently out of stock.`);
      setIsOutOfStockDialogOpen(true);
      return;
    }

    try {
      if (token) {
        await addToCart(token, [{ productId: product.productId, quantity }]);
      } else {
        addToLocalCart({ productId: product.productId, name: product.name, price: product.price, picture: product.picture, quantity });
      }
      const newStock = await getStockById(Number(id));
      setActualStock(newStock);
      window.dispatchEvent(new Event('cart-updated'));
      toast(`${product.name} (x${quantity}) added to your cart.`);
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

  const handleToggleWishlist = async () => {
    const token = localStorage.getItem('token');

    if (!token) {
      toast(
        <div>
          <strong className="font-medium">Sign in required</strong>
          <div className="text-sm text-muted-foreground">
            Please <a href="/login" className="underline text-blue-600 hover:text-blue-800">sign in</a> to add items to your wishlist.
          </div>
        </div>
      );    
      return;
    }

    try {
      if (isInWishlist) {
        await removeProductFromWishlist(token, product.productId);
        toast(`${product.name} removed from your wishlist.`);
      } else {
        await addProductToWishlist(token, product.productId);
        toast(`${product.name} added to your wishlist.`);
      }

      setIsInWishlist(!isInWishlist);
      window.dispatchEvent(new Event('wishlist-updated'));
    } catch (err) {
      console.error("Wishlist update failed:", err);
      toast(
        <div>
          <strong className="font-medium">Error</strong>
          <div className="text-sm text-muted-foreground">Failed to update wishlist.</div>
        </div>
      );
    }
  };

  const categoryName = categories.find(cat => cat.id === product.categoryId)?.name || 'Unknown';

  return (
    <div className="min-h-screen bg-driftmood-cream p-8">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-md p-6">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="md:w-1/2">
            <img src={product.picture} alt={product.name} className="w-full rounded-lg object-cover" />
          </div>

          <div className="md:w-1/2 space-y-4">
            <h1 className="text-2xl font-serif font-semibold">{product.name}</h1>
            <p className="text-driftmood-brown">{product.description}</p>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
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
                <span className="text-sm text-driftmood-brown">
                  {averageRating !== null ? averageRating.toFixed(1) : 'No ratings yet'}
                </span>
              </div>

              <button
                onClick={handleToggleWishlist}
                className={cn(
                  "flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  isInWishlist ? "bg-green-100 text-green-800 hover:bg-green-200" : "bg-driftmood-cream text-driftmood-dark hover:bg-driftmood-lime"
                )}
              >
                <Heart size={16} fill={isInWishlist ? "#65a30d" : "none"} stroke="#65a30d" />
                {isInWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
              </button>
            </div>

            <div className="text-xl font-bold">${product.price.toFixed(2)}</div>

            <div className="flex gap-2 flex-wrap">
              <span className="chip bg-driftmood-lime text-driftmood-dark">{categoryName}</span>
              {product.origin && <span className="chip bg-driftmood-cream text-driftmood-brown">Origin: {product.origin}</span>}
              {product.roastLevel && <span className="chip bg-driftmood-cream text-driftmood-brown">Roast: {product.roastLevel}</span>}
              {actualStock !== null && (actualStock === 0 ? <span className="chip bg-red-100 text-red-800">Out of Stock!</span> : actualStock <= 10 ? <span className="chip bg-yellow-100 text-yellow-800">Only {actualStock} left!</span> : <span className="chip bg-green-100 text-green-800">In Stock</span>)}
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-4 mt-4">
              <div className="flex items-center border border-driftmood-lightlime rounded-md overflow-hidden w-fit">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="quantity-btn" disabled={actualStock === 0}>-</button>
                <input type="number" min={1} max={actualStock || 1} value={quantity} onChange={(e) => setQuantity(Math.min(actualStock || 1, Math.max(1, parseInt(e.target.value) || 1)))} className="quantity-input" disabled={actualStock === 0} />
                <button onClick={() => setQuantity(Math.min(actualStock || 1, quantity + 1))} disabled={actualStock === 0 || quantity >= actualStock!} className="quantity-btn">+</button>
              </div>

              <button onClick={handleAddToCart} disabled={actualStock === 0 || quantity > actualStock!} className={cn("relative overflow-hidden bg-[#2d6a4f] text-white flex-1 flex items-center justify-center font-semibold py-3 px-4 rounded-md transition-all duration-300 ease-in-out hover:bg-[#1b4332]", actualStock === 0 ? "opacity-50 cursor-not-allowed" : "")}>Add to Cart</button>
            </div>
          </div>
        </div>

        <div className="mt-10">
          <div className="border-b border-driftmood-lightlime mb-4 flex space-x-6">
            {['description', 'details', 'reviews'].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={cn("py-2 text-sm font-medium relative", activeTab === tab ? "text-driftmood-dark" : "text-driftmood-brown hover:text-driftmood-dark")}>{tab.charAt(0).toUpperCase() + tab.slice(1)}{activeTab === tab && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-driftmood-dark" />}</button>
            ))}
          </div>

          {activeTab === 'description' && <p className="text-driftmood-brown">{product.description}</p>}
          {activeTab === 'details' && <div className="space-y-4 text-driftmood-brown">{product.ingredients && (<div><h4 className="font-medium">Ingredients</h4><ul className="list-disc ml-6 text-sm">{product.ingredients.map((item, idx) => <li key={idx}>{item}</li>)}</ul></div>)}{product.origin && <div><h4 className="font-medium">Origin</h4><p className="text-sm">{product.origin}</p></div>}{product.distributor && <div><h4 className="font-medium">Distributor</h4><p className="text-sm">{product.distributor}</p></div>}</div>}
          {activeTab === 'reviews' && <div className="space-y-4 text-driftmood-brown">{comments.length > 0 ? comments.map((c, idx) => <div key={idx} className="border-t pt-4"><div className="flex items-center justify-between"><span className="font-medium">{c.user_name}</span><span className="text-xs">{new Date(c.created_at).toLocaleDateString()}</span></div><div className="text-sm">{c.comment}</div></div>) : <p>No comments yet.</p>}</div>}
        </div>

        <OutOfStockDialog isOpen={isOutOfStockDialogOpen} onOpenChange={setIsOutOfStockDialogOpen} productName={insufficientStockMessage} />
      </div>
    </div>
  );
};

export default ProductDetailPage;
