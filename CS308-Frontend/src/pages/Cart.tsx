import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, ChevronLeft, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import CartItem from '@/components/CartItem';
import CartSummary from '@/components/CartSummary';
import { ButtonCustom } from '@/components/ui/button-custom';
import { getCart, removeCartItem, addToCart, clearCart as clearCartAPI, checkCartAvailability } from '@/api/cartApi'; 
import {
  removeFromLocalCart,
  updateQuantityInLocalCart,
  clearLocalCart,
  getLocalCart
} from '@/utils/cartUtils'; // adjust path if needed
import { getStockById } from "@/api/productApi";
import OutOfStockCartDialog from '@/components/OutOfStockCartDialog';


const Cart = () => {
  
  // Get cart items from localStorage or use mock data if none exist
  const getCartItems = () => {
    const storedItems = localStorage.getItem('cartItems');
    return storedItems ? JSON.parse(storedItems) : [];
  };

  const [cartItems, setCartItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOutOfStockDialogOpen, setIsOutOfStockDialogOpen] = useState(false);
  const [outOfStockProducts, setOutOfStockProducts] = useState<string[]>([]);
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  useEffect(() => {
    const loadCart = async () => {
      setIsLoading(true);

      if (token && token !== '') {
        try {
          // First, check cart availability
          const availabilityCheck = await checkCartAvailability(token);
          if (!availabilityCheck.valid) {
            // Some products are no longer available
            toast.error('Some items in your cart are no longer available and have been removed.');
            // The backend should have already removed unavailable items
          }

          const backendCart = await getCart(token);
          
          // Check stock levels for each item
          const cartWithStock = await Promise.all(
            backendCart.map(async (item) => {
              const stock = await getStockById(item.product.id);
              if (stock < item.count) {
                toast.warning(`Quantity adjusted for ${item.product.name} due to stock limitations.`);
                // Update the quantity to match available stock
                if (stock > 0) {
                  await addToCart(token, [{ productId: item.product.id, quantity: stock }]);
                  return { ...item, count: stock };
                } else {
                  await removeCartItem(token, item.product.id, item.count);
                  return null;
                }
              }
              return item;
            })
          );

          // Filter out null items (removed due to no stock)
          setCartItems(cartWithStock.filter(Boolean));
          console.log("Cart items is set!", cartWithStock);
        } catch (error) {
          console.error('Error fetching cart:', error);
          toast.error('Failed to load cart');
        }
      } else {
        // Guest cart from localStorage
        const guestCartRaw = localStorage.getItem('guest_cart');
        if (guestCartRaw) {
          const guestCart = JSON.parse(guestCartRaw);
          
          // Check stock levels for guest cart items
          const updatedGuestCart = await Promise.all(
            guestCart.map(async (item) => {
              const stock = await getStockById(item.productId);
              if (stock < item.quantity) {
                toast.warning(`Quantity adjusted for ${item.name} due to stock limitations.`);
                if (stock > 0) {
                  return {
                    ...item,
                    quantity: stock
                  };
                } else {
                  return null;
                }
              }
              return item;
            })
          );

          // Filter out null items and update localStorage
          const filteredCart = updatedGuestCart.filter(Boolean);
          localStorage.setItem('guest_cart', JSON.stringify(filteredCart));

          const transformed = filteredCart.map(item => ({
            product: {
              id: item.productId,
              name: item.name,
              price: item.price,
              picture: item.picture,
              grind: item.grind || null
            },
            count: item.quantity
          }));
          setCartItems(transformed);
        } else {
          setCartItems([]);
        }
      }
      setIsLoading(false);
    };

    loadCart();
  }, [token]);

  /*
  // Save cart items to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
    
    // Dispatch storage event to notify other tabs/components
    window.dispatchEvent(new Event('storage'));
  }, [cartItems]);*/

  const handleRemoveItem = async (productId: string) => {
    if (token) {
      // Logged in user
      const itemToRemove = cartItems.find(item => item.product.id.toString() === productId);
      const quantity = itemToRemove?.count || 1;

      try {
        await removeCartItem(token, Number(productId), quantity);
        setCartItems(prev => prev.filter(item => item.product.id.toString() !== productId));
        toast.success('Item removed from cart');
      } catch (err) {
        console.error(err);
        toast.error('Failed to remove item');
      }
    } else {
      // Guest user
      removeFromLocalCart(Number(productId));
      const updated = getLocalCart();
      setCartItems(
        updated.map(item => ({
          product: {
            id: item.productId,
            name: item.name,
            price: item.price,
            image: item.picture,
            grind: item.grind
          },
          count: item.quantity
        }))
      );
      toast.success('Item removed from cart');
    }
    window.dispatchEvent(new Event('cart-updated'));
  };




  const handleQuantityChange = async (productId: string, newQuantity: number) => {
    if (token) {
      const item = cartItems.find(item => item.product.id.toString() === productId);
      if (!item) return;

      const currentQuantity = item.count;
      const stock = await getStockById(Number(productId));

      if (newQuantity > stock) {
        toast.error(`Sorry, only ${stock} items available in stock.`);
        return;
      }

      try {
        if (newQuantity > currentQuantity) {
          // User clicked '+'
          await addToCart(token, [
            { productId: Number(productId), quantity: 1 }
          ]);
        } else if (newQuantity < currentQuantity) {
          // User clicked '−'
          await removeCartItem(token, Number(productId), 1);
        }

        // Update frontend
        setCartItems(prevItems =>
          prevItems.map(item =>
            item.product.id.toString() === productId
              ? { ...item, count: newQuantity }
              : item
          )
        );
      } catch (err) {
        console.error('Failed to sync quantity:', err);
        toast.error('Failed to update cart');
      }
    } else {
      // Guest user
      const stock = await getStockById(Number(productId));
      
      if (newQuantity > stock) {
        toast.error(`Sorry, only ${stock} items available in stock.`);
        return;
      }

      updateQuantityInLocalCart(Number(productId), newQuantity);
      const updated = getLocalCart();
      setCartItems(
        updated.map(item => ({
          product: {
            id: item.productId,
            name: item.name,
            price: item.price,
            image: item.picture,
            grind: item.grind
          },
          count: item.quantity
        }))
      );
    }
    window.dispatchEvent(new Event('cart-updated'));
  };

  const handleClearCart = async () => {
    if (token) {
      try {
            await clearCartAPI(token); // clear backend
            setCartItems([]);          // update frontend
            toast.success('Cart cleared');
          } catch (err) {
            console.error('Error clearing cart:', err);
            toast.error('Failed to clear cart');
          }
    }
    else {
        clearLocalCart();
        setCartItems([]);
        toast.success('Cart cleared');
      }
      window.dispatchEvent(new Event('cart-updated'));
  };

  const handleCheckout = async () => {
    // Check if user is logged in
    if (!token) {
      toast.info('Please sign in to proceed with checkout');
      navigate('/signin');
      return;
    }

    // Check stock for all items before proceeding
    const outOfStockItems: string[] = [];
    
    await Promise.all(
      cartItems.map(async (item) => {
        const stock = await getStockById(item.product.id);
        if (stock === 0 || stock < item.count) {
          outOfStockItems.push(item.product.name);
        }
      })
    );

    if (outOfStockItems.length > 0) {
      setOutOfStockProducts(outOfStockItems);
      setIsOutOfStockDialogOpen(true);
      return;
    }

    toast.success('Proceeding to checkout...');
    navigate('/checkout');
  };

  // Calculate cart totals
  const subtotal = cartItems.reduce((sum, item) => {
    const price = Number(item.product.price) || 0;
    const quantity = item.count || 0;
    return sum + price * quantity;
  }, 0);
  const tax = subtotal * 0.08; // 8% tax rate
  const shipping = subtotal > 35 ? 0 : 5.99;
  const total = subtotal + tax + shipping;

  // Empty cart UI
  const EmptyCart = () => (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="text-center py-10"
    >
      <div className="mx-auto w-24 h-24 rounded-full bg-coffee-green-light/30 flex items-center justify-center mb-6">
        <ShoppingCart size={36} className="text-coffee-green/70" />
      </div>
      <h2 className="text-2xl font-medium text-coffee-green mb-2">Your cart is empty</h2>
      <p className="text-coffee-brown mb-6 max-w-md mx-auto">Looks like you haven't added any coffee to your cart yet. Browse our selection and discover your perfect cup.</p>
      <Link to="/products">
        <ButtonCustom>
          Browse Coffee
        </ButtonCustom>
      </Link>
    </motion.div>
  );

  // Loading skeleton
  const CartSkeleton = () => (
    <div className="space-y-4">
      {[1, 2, 3].map(i => (
        <div key={i} className="p-4 rounded-lg bg-white border border-coffee-green/10 animate-pulse">
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 bg-gray-200 rounded-md"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
              <div className="w-8 h-4 bg-gray-200 rounded"></div>
              <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <>
      <div className="container mx-auto px-4 md:px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <Link to="/" className="mr-2">
                <ButtonCustom variant="ghost" size="sm" className="gap-1">
                  <ChevronLeft size={16} />
                  <span>Back</span>
                </ButtonCustom>
              </Link>
              <h1 className="text-2xl md:text-3xl font-semibold text-coffee-green">Your Cart</h1>
            </div>
            
            {cartItems.length > 0 && !isLoading && (
              <ButtonCustom 
                variant="ghost" 
                size="sm"
                onClick={handleClearCart}
              >
                Clear All
              </ButtonCustom>
            )}
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              {isLoading ? (
                <CartSkeleton />
              ) : cartItems.length === 0 ? (
                <EmptyCart />
              ) : (
                <AnimatePresence>
                  {cartItems.map(({ product, count }) => (
              <CartItem
                key={product.id} // unique key now
                id={product.id.toString()} // assuming your CartItem expects string id
                name={product.name}
                price={Number(product.price) || 0}
                image={product.picture || '/default.jpg'} // fallback if needed
                quantity={count}
                grind={product.grind} // optional
                onRemove={handleRemoveItem}
                onQuantityChange={handleQuantityChange}
              />
            ))}
                </AnimatePresence>
              )}
              
              {!isLoading && cartItems.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="flex items-center mt-4 p-4 rounded-lg bg-coffee-green-light/30 text-coffee-green"
                >
                  <AlertCircle size={20} className="mr-2 flex-shrink-0" />
                  <p className="text-sm">
                    Free shipping on orders over $35!
                  </p>
                </motion.div>
              )}
            </div>
            
            {!isLoading && cartItems.length > 0 && (
              <div className="md:col-span-1">
                <CartSummary 
                  subtotal={subtotal}
                  tax={tax}
                  shipping={shipping}
                  total={total}
                  onCheckout={handleCheckout}
                  isLoggedIn={!!token}
                />
              </div>
            )}
          </div>
        </motion.div>
      </div>
      
      <OutOfStockCartDialog 
        isOpen={isOutOfStockDialogOpen}
        onOpenChange={setIsOutOfStockDialogOpen}
        productName={outOfStockProducts.join(", ")}
      />
    </>
  );
};

export default Cart;
