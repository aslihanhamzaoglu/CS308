import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { getUserProfile } from '@/api/userApi';
import { getOrdersByUser } from '@/api/orderApi'; // 🔥 new

import Navbar from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, ShoppingBag, UserRound, Settings, LogOut, Star } from 'lucide-react';

const Profile = () => {
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [userId, setUserId] = useState<number | null>(null);
  const [orders, setOrders] = useState([]);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        setIsLoading(true); // Start loading

        const user = await getUserProfile(token);
        setUserName(user.name);
        setEmail(user.email);
        setUserId(user.userId);

        console.log('Fetching orders with token:', token);
        const fetchedOrders = await getOrdersByUser(token);
        console.log('Fetched orders:', fetchedOrders);
        
        if (!Array.isArray(fetchedOrders)) {
          console.error('Fetched orders is not an array:', fetchedOrders);
          return;
        }
        
        setOrders(fetchedOrders);
        console.log('Orders state after setting:', fetchedOrders);
      } catch (error) {
        console.error('Failed to fetch user info or orders:', error);
      } finally {
        setIsLoading(false); // Done loading
      }
    };

    fetchUserData();
  }, []);

  /*useEffect(() => {
    // MOCK DATA (instead of API)
    setUserName("Mock Coffee Fan");
    setEmail("mockuser@driftmood.com");
  
    const fakeOrders = [
      {
        id: 101,
        status: "processing",
        total_price: 18.49,
        created_at: "2025-04-20T09:00:00Z"
      },
      {
        id: 102,
        status: "on the way",
        total_price: 32.99,
        created_at: "2025-04-22T14:20:00Z"
      }
    ];
  
    setOrders(fakeOrders);
  }, []);*/
  

  const handleSignOut = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <div className="container mx-auto py-16 px-4">
      <motion.div 
        className="text-center mb-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-4xl md:text-5xl font-serif font-bold mt-6 mb-6 text-coffee-green">
          My Profile
        </h1>
      </motion.div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <Card className="bg-white shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex flex-col items-center">
                <div className="h-24 w-24 rounded-full bg-coffee-green-light/50 flex items-center justify-center mb-4">
                  <UserRound size={64} className="text-coffee-green" />
                </div>
                <CardTitle className="text-xl font-serif text-coffee-green">{userName}</CardTitle>
                <p className="text-coffee-brown mt-1">{email}</p>
                {userId !== null && (
                  <p className="text-gray-400 text-sm mt-1">ID: {userId}</p>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <nav className="flex flex-col space-y-2">
                <Link to="/profile" className="flex items-center p-3 rounded-md bg-coffee-green-light/30 text-coffee-green font-medium">
                  <UserRound size={18} className="mr-2" />
                  <span>Profile</span>
                </Link>
                <Link to="/past-orders" className="flex items-center p-3 rounded-md hover:bg-coffee-green-light/20 text-coffee-brown hover:text-coffee-green transition-colors">
                  <Package size={18} className="mr-2" />
                  <span>Past Orders</span>
                </Link>
                <Link to="/cart" className="flex items-center p-3 rounded-md hover:bg-coffee-green-light/20 text-coffee-brown hover:text-coffee-green transition-colors">
                  <ShoppingBag size={18} className="mr-2" />
                  <span>Cart</span>
                </Link>
                <Link to="/my-reviews" className="flex items-center p-3 rounded-md hover:bg-coffee-green-light/20 text-coffee-brown hover:text-coffee-green transition-colors">
                  <Star size={18} className="mr-2" />
                  <span>My Reviews</span>
                </Link>
                <Link to="/account" className="flex items-center p-3 rounded-md hover:bg-coffee-green-light/20 text-coffee-brown hover:text-coffee-green transition-colors">
                  <Settings size={18} className="mr-2" />
                  <span>Account Settings</span>
                </Link>
                <button 
                  onClick={handleSignOut}
                  className="flex items-center p-3 rounded-md hover:bg-coffee-green-light/20 text-coffee-brown hover:text-coffee-green transition-colors text-left w-full"
                >
                  <LogOut size={18} className="mr-2" />
                  <span>Sign Out</span>
                </button>
              </nav>
            </CardContent>
          </Card>
        </motion.div>

        {/* Orders in Transit */}
        <motion.div 
          className="md:col-span-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-2xl font-semibold text-coffee-green mb-4">My Orders</h2>
            
            {isLoading ? (
              <p className="text-coffee-brown">Loading orders...</p>
            ) : orders.length === 0 ? (
              <p className="text-coffee-brown">You have no orders yet.</p>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div
                    key={order.order_id}
                    className="border border-gray-200 p-4 rounded-lg shadow-sm bg-white"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium text-coffee-green">Order #{order.order_id}</p>
                        <p className="text-sm text-coffee-brown">{new Date(order.date).toLocaleDateString()}</p>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-sm ${
                        order.order_status === 'delivered' ? 'bg-green-100 text-green-800' :
                        order.order_status === 'cancelled' ? 'bg-red-100 text-red-800' :
                        order.order_status === 'in-transit' ? 'bg-blue-100 text-blue-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {order.order_status.charAt(0).toUpperCase() + order.order_status.slice(1)}
                      </div>
                    </div>
                    <div className="mt-2">
                      <p className="text-coffee-brown"><strong>Total:</strong> ${parseFloat(order.total_price).toFixed(2)}</p>
                      {order.product_list && order.product_list.length > 0 && (
                        <div className="mt-2">
                          <p className="text-sm font-medium text-coffee-brown mb-1">Products:</p>
                          <ul className="text-sm text-coffee-brown">
                            {order.product_list.map((product, index) => (
                              <li key={index} className="flex justify-between">
                                <span>{product.name} x {product.quantity}</span>
                                <span>${parseFloat(product.total_price).toFixed(2)}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;
