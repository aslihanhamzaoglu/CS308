import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ButtonCustom } from '@/components/ui/button-custom';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ChevronLeft, Download, Star, X } from 'lucide-react';
import { toast } from 'sonner';
import OrderReviewModal from '@/components/OrderReviewModal';
import { getOrdersByUser, getOrderInvoice, cancelOrder } from '@/api/orderApi';
import { addComment } from "@/api/commentApi"; 
import { addRate, getRatesByUser } from "@/api/rateApi";
import { requestRefund, getRefundsByUser } from "@/api/refundsApi";

// Refund modal
const RefundRequestModal = ({
  onClose,
  onConfirm,
  product,
}: {
  onClose: () => void;
  onConfirm: () => void;
  product: OrderProduct;
}) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
    <div className="bg-white rounded-lg shadow-lg w-96 p-6 relative">
      <button className="absolute top-3 right-3 text-gray-400 hover:text-gray-600" onClick={onClose}>
        <X size={20} />
      </button>
      <h2 className="text-xl font-semibold mb-4 text-coffee-green">Request Refund</h2>
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <img src={product.image} alt={product.name} className="w-16 h-16 object-cover rounded-md" />
          <div>
            <div className="font-medium text-coffee-green">{product.name}</div>
            {product.grind && <div className="text-sm text-coffee-brown">Grind: {product.grind}</div>}
            <div className="text-sm text-coffee-brown">Quantity: {product.quantity}</div>
            <div className="text-sm text-coffee-brown">Price: ${product.price.toFixed(2)}</div>
          </div>
        </div>
        <p className="text-coffee-brown">Are you sure you want to request a refund for this product?</p>
      </div>
      <div className="flex justify-end gap-4">
        <ButtonCustom variant="outline" onClick={onClose}>Cancel</ButtonCustom>
        <ButtonCustom onClick={onConfirm}>Confirm Refund</ButtonCustom>
      </div>
    </div>
  </div>
);

// CancelRequestModal component
const CancelRequestModal = ({
  onClose,
  onConfirm,
  orderId,
  order,
}: {
  onClose: () => void;
  onConfirm: () => void;
  orderId: string;
  order: Order;
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg w-96 p-6 relative">
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
          onClick={onClose}
        >
          <X size={20} />
        </button>
        <h2 className="text-xl font-semibold mb-4 text-coffee-green">Cancel Order</h2>
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div>
              <div className="font-medium text-coffee-green">Order #{orderId}</div>
              <div className="text-sm text-coffee-brown">Date: {new Date(order.date).toLocaleDateString()}</div>
              <div className="text-sm text-coffee-brown">Total Items: {order.products.length}</div>
              <div className="text-sm text-coffee-brown">Total: ${order.total.toFixed(2)}</div>
            </div>
          </div>
          <p className="text-coffee-brown">Are you sure you want to cancel this entire order? This action cannot be undone.</p>
        </div>
        <div className="flex justify-end gap-4">
          <ButtonCustom variant="outline" onClick={onClose}>
            No, Keep Order
          </ButtonCustom>
          <ButtonCustom onClick={onConfirm}>
            Yes, Cancel Order
          </ButtonCustom>
        </div>
      </div>
    </div>
  );
};

const PastOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [reviewProduct, setReviewProduct] = useState<OrderProduct | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundOrderId, setRefundOrderId] = useState<string | null>(null);
  const [refundProduct, setRefundProduct] = useState<OrderProduct | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelOrderId, setCancelOrderId] = useState<string | null>(null);
  const [isRefreshingRefunds, setIsRefreshingRefunds] = useState(false);

  const mapBackendStatus = (backendStatus: string): OrderStatus => {
    switch (backendStatus) {
      case 'processing': return 'Getting ready';
      case 'in-transit': return 'On the way';
      case 'delivered': return 'Delivered';
      case 'cancelled': return 'Cancelled';
      default: return 'Ordered';
    }
  };

  const fetchRefundStatuses = async (token: string) => {
    try {
      const refundsData = await getRefundsByUser(token);
      
      // Ensure refundsData is an array
      const refunds = Array.isArray(refundsData) ? refundsData : 
                     (refundsData.refunds ? refundsData.refunds : []);
      
      if (refunds.length === 0) {
        return; // No refunds to process
      }
      
      // Update orders with refund statuses
      setOrders(prevOrders => {
        return prevOrders.map(order => {
          const updatedProducts = order.products.map(product => {
            // Find if there's a refund for this product
            const refund = refunds.find((r: any) => 
              r.order_id?.toString() === order.id && 
              r.product_id?.toString() === product.id
            );
            
            if (refund) {
              // Map backend status to our RefundStatus type
              let status: RefundStatus = 'pending';
              if (refund.status === 'approved') status = 'approved';
              else if (refund.status === 'rejected') status = 'rejected';
              else if (refund.status === 'done') status = 'done';
              
              return { ...product, refundStatus: status };
            }
            return product;
          });
          
          return { ...order, products: updatedProducts };
        });
      });
    } catch (error) {
      console.error("Error fetching refund statuses:", error);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const fetchOrdersAndRatings = async () => {
      try {
        const rawOrders = await getOrdersByUser(token);
        const userRatings = await getRatesByUser(token);

        const ratingMap: Record<string, number> = {};
        userRatings.forEach((r: { product_id: number; rate: number }) => {
          ratingMap[r.product_id.toString()] = r.rate;
        });

        const mappedOrders: Order[] = rawOrders.map((order: any) => ({
          id: order.order_id.toString(),
          date: new Date(order.date).toISOString(),
          status: mapBackendStatus(order.order_status),
          total: parseFloat(order.total_price),
          products: order.product_list.map((prod: any) => ({
            id: prod.p_id.toString(),
            name: prod.name,
            image: prod.image,
            price: parseFloat(prod.total_price),
            quantity: prod.quantity,
            grind: prod.grind,
            reviewed: prod.p_id in ratingMap,
            rating: ratingMap[prod.p_id] ?? undefined,
            refundStatus: prod.refund_status as RefundStatus | undefined,
            cancelStatus: prod.cancel_status === 'cancelled' ? 'cancelled' : undefined,
          })),
        }));

        setOrders(mappedOrders);
        
        // After loading orders, fetch the latest refund statuses
        await fetchRefundStatuses(token);
      } catch (err) {
        console.error("Error fetching orders or ratings:", err);
      }
    };

    fetchOrdersAndRatings();
    
    // Set up an interval to refresh refund statuses every 30 seconds
    const intervalId = setInterval(() => {
      if (token) {
        setIsRefreshingRefunds(true);
        fetchRefundStatuses(token).finally(() => {
          setIsRefreshingRefunds(false);
        });
      }
    }, 30000);
    
    return () => clearInterval(intervalId);
  }, []);

  const handleCancelOrder = async (orderId: string) => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error("You must be logged in to cancel an order.");
      return;
    }

    try {
      const response = await cancelOrder(token, orderId);
      toast.success("Order cancelled successfully!");
      
      // Update the order status in the UI
      setOrders(prev => prev.map(order => {
        if (order.id !== orderId) return order;
        return {
          ...order,
          status: 'Cancelled'
        };
      }));
    } catch (err) {
      toast.error("Failed to cancel order.");
    }
  };

  const handleReviewClick = (order: Order, product: OrderProduct) => {
    setSelectedOrder(order);
    setReviewProduct(product);
    setShowReviewModal(true);
  };

  const handleSubmitReview = async (rating: number, comment: string) => {
    if (!reviewProduct) return;
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error("You must be logged in to submit a review.");
      return;
    }
    try {
      if (comment.trim()) {
        await addComment(token, Number(reviewProduct.id), comment);
        toast.success(`Review submitted for ${reviewProduct.name}!`);
      }
      await addRate(token, Number(reviewProduct.id), rating);

      setOrders(prev => prev.map(order => {
        if (order.id !== selectedOrder?.id) return order;
        return {
          ...order,
          products: order.products.map(p =>
            p.id === reviewProduct.id ? { ...p, reviewed: true, rating } : p
          ),
        };
      }));
      setShowReviewModal(false);
    } catch (err) {
      toast.error("Failed to submit review.");
    }
  };

  const handleDownloadInvoice = async (orderId: string) => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error("You must be logged in to download invoices.");
      return;
    }
    setIsDownloading(true);
    try {
      const invoiceBase64 = await getOrderInvoice(token, orderId);
      const link = document.createElement('a');
      link.href = `data:application/pdf;base64,${invoiceBase64}`;
      link.download = `DriftMood-Order-${orderId}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("Invoice downloaded successfully!");
    } catch (err) {
      toast.error("Failed to download invoice.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleRefundRequest = async (orderId: string, productId: string) => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error("You must be logged in to request a refund.");
      return;
    }

    // Find the product to get the quantity
    const order = orders.find(o => o.id === orderId);
    if (!order) {
      toast.error("Order not found.");
      return;
    }
    
    const product = order.products.find(p => p.id === productId);
    if (!product) {
      toast.error("Product not found in order.");
      return;
    }

    try {
      // Call the requestRefund API
      await requestRefund(
        token, 
        orderId, 
        productId, 
        product.quantity
      );
      
      toast.success("Refund request submitted successfully!");
      setOrders(prev => prev.map(order => {
        if (order.id !== orderId) return order;
        return {
          ...order,
          products: order.products.map(p =>
            p.id === productId ? { ...p, refundStatus: 'pending' } : p
          ),
        };
      }));
      
      // Refresh refund statuses to get the latest data
      setTimeout(() => {
        fetchRefundStatuses(token);
      }, 1000);
    } catch (err) {
      console.error("Refund request error:", err);
      toast.error("Failed to submit refund request. Please try again.");
    }
  };

  const getOrderProgress = (status: OrderStatus) => {
    switch (status) {
      case 'Ordered': return 25;
      case 'Getting ready': return 50;
      case 'On the way': return 75;
      case 'Delivered': return 100;
      default: return 0;
    }
  };

  // Function to check if order delivery was more than 30 days ago
  const isRefundPeriodExpired = (orderDate: string, status: OrderStatus): boolean => {
    if (status !== 'Delivered') return false;
    
    const deliveryDate = new Date(orderDate);
    const today = new Date();
    
    // Calculate difference in days
    const diffTime = today.getTime() - deliveryDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    // Return true if more than 30 days have passed since delivery
    return diffDays > 30;
  };

  // Helper function to display refund status text
  const renderRefundStatusText = (status: RefundStatus) => {
    switch (status) {
      case 'pending':
        return <span className="text-amber-600 text-sm">Refund Pending</span>;
      case 'approved':
        return <span className="text-green-600 text-sm">Refund Approved</span>;
      case 'rejected':
        return <span className="text-red-600 text-sm">Refund Rejected</span>;
      case 'done':
        return <span className="text-green-600 text-sm">Refund Completed</span>;
      default:
        return null;
    }
  };

  return (
    <>
      <div className="container mx-auto py-16 px-4">
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Link to="/profile" className="inline-flex items-center text-coffee-brown hover:text-coffee-green mb-4">
            <ChevronLeft size={18} />
            <span>Back to Profile</span>
          </Link>
          <h1 className="text-3xl md:text-4xl font-serif font-bold mb-4 text-coffee-green">
            Past Orders
          </h1>
          <p className="text-coffee-brown">View and manage your previous orders</p>
        </motion.div>

        {orders.length === 0 ? (
          <motion.div 
            className="text-center py-16 bg-white rounded-lg shadow-sm p-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-6">
              <img 
                src="/images/empty-orders.svg" 
                alt="No Orders" 
                className="w-48 h-48 mx-auto opacity-80"
                onError={(e) => {
                  e.currentTarget.src = "https://via.placeholder.com/150?text=No+Orders";
                }}
              />
            </div>
            <h2 className="text-2xl font-serif font-bold mb-3 text-coffee-green">No Orders Yet</h2>
            <p className="text-coffee-brown mb-6 max-w-md mx-auto">You haven't placed any orders yet. Start exploring our products and find something you'll love!</p>
            <Link to="/products">
              <ButtonCustom>Browse Products</ButtonCustom>
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-8">
            {orders.map((order) => (
              <motion.div key={order.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                <Card className={`bg-white shadow-sm ${order.status === 'Cancelled' ? 'opacity-75 bg-gray-50' : ''}`}>
                  <CardHeader className={`border-b ${order.status === 'Cancelled' ? 'border-gray-200' : 'border-coffee-green/10'}`}>
                    <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                      <div>
                        <p className="text-sm text-coffee-brown">Order #{order.id}</p>
                        <CardTitle className={`text-xl font-serif ${order.status === 'Cancelled' ? 'text-gray-500' : 'text-coffee-green'}`}>
                          {new Date(order.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </CardTitle>
                      </div>
                      <div className="flex items-center gap-4">
                        <ButtonCustom
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownloadInvoice(order.id)}
                          disabled={isDownloading}
                        >
                          <Download size={16} />
                          {isDownloading ? 'Downloading...' : 'Invoice'}
                        </ButtonCustom>
                        {order.status === 'Getting ready' && (
                          <ButtonCustom
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setCancelOrderId(order.id);
                              setShowCancelModal(true);
                            }}
                          >
                            Cancel Order
                          </ButtonCustom>
                        )}
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[order.status]}`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className={`p-6 ${order.status === 'Cancelled' ? 'opacity-75' : ''}`}>
                    <div className="mb-8">
                      <h3 className={`text-lg font-medium mb-4 ${order.status === 'Cancelled' ? 'text-gray-500' : 'text-coffee-green'}`}>Order Status</h3>
                      <Progress value={getOrderProgress(order.status)} className="h-2" />
                    </div>
                    <div>
                      <h3 className={`text-lg font-medium mb-4 ${order.status === 'Cancelled' ? 'text-gray-500' : 'text-coffee-green'}`}>Order Items</h3>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Product</TableHead>
                            <TableHead>Quantity</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead className="text-right">Review</TableHead>
                            <TableHead className="text-right">
                              {order.status === 'Delivered' ? 'Refund' : ''}
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {order.products.map((product) => (
                            <TableRow key={product.id}>
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <img src={product.image} alt={product.name} className="w-12 h-12 object-cover rounded-md" />
                                  <div>
                                    <div className="font-medium">{product.name}</div>
                                    {product.grind && <div className="text-sm text-coffee-brown">Grind: {product.grind}</div>}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>{product.quantity}</TableCell>
                              <TableCell>${product.price.toFixed(2)}</TableCell>
                              <TableCell className="text-right">
                                {product.reviewed ? (
                                  <div className="flex items-center justify-end gap-1 text-coffee-brown">
                                    <span>Rated </span>
                                    <div className="flex">
                                      {[...Array(5)].map((_, i) => (
                                        <Star
                                          key={i}
                                          size={16}
                                          className={i < (product.rating || 0) ? "fill-yellow-500 text-yellow-500" : "text-gray-300"}
                                        />
                                      ))}
                                    </div>
                                  </div>
                                ) : order.status === 'Cancelled' ? (
                                  <span></span>
                                ) : (
                                  <ButtonCustom
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleReviewClick(order, product)}
                                    disabled={order.status !== 'Delivered'}
                                  >
                                    {order.status === 'Delivered' ? 'Review Product' : 'Available after delivery'}
                                  </ButtonCustom>
                                )}
                              </TableCell>
                              <TableCell className="text-right">
                                {order.status === 'Delivered' ? (
                                  isRefundPeriodExpired(order.date, order.status) ? (
                                    <span className="text-gray-500 text-sm">Refund period expired (30 days)</span>
                                  ) : product.refundStatus ? (
                                    renderRefundStatusText(product.refundStatus)
                                  ) : (
                                    <ButtonCustom
                                      size="sm"
                                      variant="outline"
                                      onClick={() => {
                                        setRefundOrderId(order.id);
                                        setRefundProduct(product);
                                        setShowRefundModal(true);
                                      }}
                                    >
                                      Request Refund
                                    </ButtonCustom>
                                  )
                                ) : order.status === 'Cancelled' ? (
                                  <span className="text-coffee-brown text-sm">Order Cancelled</span>
                                ) : (
                                  <span></span>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {showReviewModal && reviewProduct && (
        <OrderReviewModal
          product={reviewProduct}
          onClose={() => setShowReviewModal(false)}
          onSubmit={handleSubmitReview}
        />
      )}

      {showRefundModal && refundProduct && refundOrderId && (
        <RefundRequestModal
          onClose={() => {
            setShowRefundModal(false);
            setRefundOrderId(null);
            setRefundProduct(null);
          }}
          onConfirm={async () => {
            await handleRefundRequest(refundOrderId, refundProduct.id);
            setShowRefundModal(false);
            setRefundOrderId(null);
            setRefundProduct(null);
          }}
          product={refundProduct}
        />
      )}

      {showCancelModal && cancelOrderId && (
        <CancelRequestModal
          onClose={() => {
            setShowCancelModal(false);
            setCancelOrderId(null);
          }}
          onConfirm={async () => {
            await handleCancelOrder(cancelOrderId);
            setShowCancelModal(false);
            setCancelOrderId(null);
          }}
          orderId={cancelOrderId}
          order={orders.find(o => o.id === cancelOrderId) || {
            id: '',
            date: '',
            status: 'Ordered',
            total: 0,
            products: []
          }}
        />
      )}
    </>
  );
};

type OrderStatus = 'Ordered' | 'Getting ready' | 'On the way' | 'Delivered' | 'Cancelled';
type RefundStatus = 'pending' | 'approved' | 'rejected' | 'done';

interface OrderProduct {
  id: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  grind?: string;
  reviewed?: boolean;
  rating?: number;
  refundStatus?: RefundStatus;
  cancelStatus?: 'cancelled';
}

interface Order {
  id: string;
  date: string;
  status: OrderStatus;
  total: number;
  products: OrderProduct[];
}

const statusColors = {
  'Ordered': 'bg-blue-100 text-blue-800',
  'Getting ready': 'bg-yellow-100 text-yellow-800',
  'On the way': 'bg-purple-100 text-purple-800',
  'Delivered': 'bg-green-100 text-green-800',
  'Cancelled': 'bg-red-100 text-red-800'
};

export default PastOrders;
