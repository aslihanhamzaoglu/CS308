import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { getAllCategories } from '@/api/categoryApi';
import { getAllProductsM, getProductsByCategory, setPrice, setDiscount } from '@/api/productApi';
import { getAllOrders, getOrdersByUser, getOrderInvoiceManager, getRevenueGraph} from '@/api/orderApi';
import { getAllRefunds, refundDecision } from '@/api/refundsApi';

import { Download, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface Product {
  id: string;
  name: string;
  price: number;
  discountRate: number;
  category: string;
  status?: number; // 1 = active, 0 = inactive (when category is deleted)
}

interface Category {
  id: number;
  name: string;
}

interface Order {
  id: string;
  date: string;
  customerName: string;
  totalAmount: number;
  status: string;
  invoiceNumber: string;
  address: string; 
  items: OrderItem[];
  total?: number;
  products?: Array<{
    id: string;
    name: string;
    image: string;
    price: number;
    quantity: number;
    grind?: string;
    cancelStatus?: 'cancelled';
  }>;
}


interface OrderItem {
  productName: string;
  quantity: number;
  price: number;
  discount: number;
}

interface RevenueData {
  date: string;
  revenue: number;
}

interface Refund {
  id: number;
  userName: string;
  userEmail: string;
  orderId: string;
  reason: string;
  status: number; // 0 = pending, 1 = approved, 2 = rejected
  createdAt: string;
}

interface OrderProduct {
  id: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  grind?: string;
  cancelStatus?: 'cancelled';
}

interface OrderDetails {
  id: string;
  date: string;
  status: string;
  total: number;
  address: string;
  userEmail: string;
  userName: string;
  products: OrderProduct[];
  invoicePdf: string;
}


  const SalesManagerPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filterCategory, setFilterCategory] = useState<string>('All Categories');
  const [orders, setOrders] = useState<Order[]>([]);
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [startDate, setStartDate] = useState(() => {
    const today = new Date();
    const weekAgo = new Date(today);
    weekAgo.setDate(today.getDate() - 7);
    return weekAgo.toISOString().split("T")[0];
  });
  
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split("T")[0];
  });
  
  const [allOrders, setAllOrders] = useState<OrderDetails[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [isRefreshingProducts, setIsRefreshingProducts] = useState(false);
  const [refundFilter, setRefundFilter] = useState<'all' | 'pending'>('all');
  const [isLoadingRefunds, setIsLoadingRefunds] = useState(false);
  const [pendingDiscounts, setPendingDiscounts] = useState<{ [productId: string]: number }>({});
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
    fetchProducts();
    fetchAllOrders();
    fetchOrders();
    fetchRefunds();
  
    if (startDate && endDate) {
      fetchRevenueData(startDate, endDate);
    }

    // Set up polling for products (check every 30 seconds)
    const productPollingInterval = setInterval(() => {
      fetchProducts(true);
    }, 30000);

    // Clean up interval on component unmount
    return () => {
      clearInterval(productPollingInterval);
    };
  }, [startDate, endDate]);
  
  const fetchRefunds = async () => {
    setIsLoadingRefunds(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error("No token found. Please log in again.");
        return;
      }
      
      console.log('Fetching refunds with token:', token);
      const response = await getAllRefunds(token);
      
      // Handle the response which could be either direct array or nested in a property
      const refundsData = Array.isArray(response) ? response : 
                         (response.refunds ? response.refunds : []);
      
      console.log('Refund data received:', refundsData);
      
      // Map the refund data to match our interface
      const mappedRefunds = refundsData.map((refund: any) => ({
        id: refund.refund_id || refund.id,
        userName: refund.user_name || refund.userName || '',
        userEmail: refund.user_email || refund.userEmail || '',
        orderId: refund.order_id?.toString() || refund.orderId || '',
        reason: refund.reason || 'No reason provided',
        // Map backend status values to our numeric status
        status: refund.status === 'pending' ? 0 : 
                refund.status === 'approved' ? 1 : 
                refund.status === 'rejected' ? 2 : 0,
        createdAt: refund.created_at || refund.createdAt || new Date().toISOString(),
        productId: refund.product_id?.toString() || refund.productId || '',
        quantity: refund.quantity || 1
      }));
      
      setRefunds(mappedRefunds);
    } catch (error) {
      console.error("Error fetching refunds:", error);
      toast.error("Failed to fetch refund requests.");
    } finally {
      setIsLoadingRefunds(false);
    }
  };
  
  const fetchCategories = async () => {
    try {
      const data = await getAllCategories();
      setCategories(data);
    } catch (error) {
      console.error('Failed to fetch categories');
    }
  };

  const fetchProducts = async (isPolling = false) => {
    try {
      if (!isPolling) {
        setIsRefreshingProducts(true);
      }
      console.log('🔁 fetchProducts started');
      const data = await getAllProductsM();
      console.log('📦 Received products:', data);
      const mapped = data.map((p: any) => ({
        ...p,
        discountRate: p.discount || 0  // ← Ensure discount is mapped properly
      }));
      setProducts(mapped);
      if (!isPolling) {
        toast.success('Products refreshed successfully');
      }
    } catch (error) {
      console.error('🚨 Error fetching products:', error);
      if (!isPolling) {
        toast.error('Failed to fetch products');
      }
    } finally {
      if (!isPolling) {
        setIsRefreshingProducts(false);
      }
    }
  };

  const fetchRevenueData = async (start: string, end: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error("You must be logged in to fetch revenue data.");
        return;
      }
  
      const data = await getRevenueGraph(token, start, end);
      setRevenueData(data);
      console.log("📊 Revenue API Response:", data);
      toast.success("Revenue data loaded.");
    } catch (error) {
      console.error("❌ Error fetching revenue data:", error);
      toast.error("Failed to load revenue data.");
    }
  };
  
  const handleRefundAction = async (refundId: number, decision: 'approved' | 'rejected') => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error("Token missing");
        return;
      }
      
      // Show loading toast
      const loadingToast = toast.loading(`Processing ${decision} decision...`);
      
      await refundDecision(token, refundId, decision);
      
      // Dismiss loading toast and show success
      toast.dismiss(loadingToast);
      toast.success(`Refund ${decision} successfully.`);
      
      // Update local state to avoid a full refresh
      setRefunds(prev => prev.map(refund => {
        if (refund.id === refundId) {
          return {
            ...refund,
            status: decision === 'approved' ? 1 : 2
          };
        }
        return refund;
      }));
      
      // Refresh list after a short delay to ensure backend is updated
      setTimeout(() => {
        fetchRefunds();
      }, 1000);
    } catch (error) {
      console.error("Error processing refund:", error);
      toast.error(`Failed to ${decision} refund. Please try again.`);
    }
  };
  
  
  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const rawOrders = await getAllOrders(token);
      const mappedOrders = rawOrders.map((order: any) => ({
        id: order.order_id?.toString() ?? '',
        date: new Date(order.date).toISOString().split("T")[0], // ✅ format: '2025-05-14'
        customerName: order.user_name || order.username || order.name || order.customerName || '',
        totalAmount: parseFloat(order.total_price),
        status: order.order_status,
        address: order.address || '', 
        invoiceNumber: order.invoice_number || '',
        items: order.product_list || [],
      }));
      
      setOrders(mappedOrders);
    } catch (error) {
      console.error('Failed to fetch orders');
    }
  };

  const fetchAllOrders = async () => {
    setIsLoadingOrders(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found');
      
      // Add date parameters to the API call if they exist
      const rawOrders = await getAllOrders(token, startDate, endDate);
      
      const mappedOrders = rawOrders.map((order: any) => ({
        id: order.order_id?.toString() ?? '',
        date: new Date(order.date).toISOString(),
        status: mapBackendStatus(order.order_status),
        total: parseFloat(order.total_price ?? order.total ?? '0'),
        address: order.address || order.shipping_address || '',
        userEmail: order.user_email || order.email || '',
        userName: order.user_name || order.username || order.name || '',
        products: order.product_list.map((prod: any) => ({
          id: prod.p_id?.toString() ?? '',
          name: prod.name,
          image: prod.image,
          price: parseFloat(prod.total_price),
          quantity: prod.quantity,
          grind: prod.grind,
          cancelStatus: prod.cancel_status === 'cancelled' ? 'cancelled' : undefined,
        })) || [],
        invoicePdf: order.invoice_number || order.invoicePdf || '',
      }));
      setAllOrders(mappedOrders);
  
      if (mappedOrders.length > 0) {
        const dates = mappedOrders.map(o => new Date(o.date));
        const today = new Date();
        const weekAgo = new Date();
        weekAgo.setDate(today.getDate() - 7);
        
      }
    } catch (err) {
      toast.error('Failed to fetch orders');
    } finally {
      setIsLoadingOrders(false);
    }
  };
  
  

  const fetchProductsByCategoryName = async (name: string, isPolling = false) => {
    try {
      if (!isPolling) {
        setIsRefreshingProducts(true);
      }
      
      const matched = categories.find(c => c.name === name);
      if (!matched) return;
      
      const data = await getProductsByCategory(matched.id);
      setProducts(data);
      
      if (!isPolling) {
        toast.success(`Products in category "${name}" refreshed successfully`);
      }
    } catch (error) {
      console.error('Error fetching category products:', error);
      if (!isPolling) {
        toast.error('Failed to fetch category products');
      }
    } finally {
      if (!isPolling) {
        setIsRefreshingProducts(false);
      }
    }
  };
  const handlePriceChange = async (productId: string, newPrice: number) => {
    try {
      const token = localStorage.getItem('token');
      const target = products.find(p => p.id === productId);
      if (!target) {
        toast.error("Product not found.");
        return;
      }
  
      // Check if we're setting a price for a product that previously had no price
      const isFirstPriceSet = target.price === 0 && newPrice > 0;
      // Check if we need to activate the product (status from 0 to 1)
      const shouldActivate = (target.status === 0 || target.status === undefined) && newPrice > 0;
  
      await setPrice({ token, productId, price: newPrice });
  
      setProducts(products.map(product =>
        product.id === productId 
          ? { 
              ...product, 
              price: newPrice,
              // Set status to 1 (active) if price > 0
              status: newPrice > 0 ? 1 : product.status
            } 
          : product
      ));
      
      if (isFirstPriceSet) {
        toast.success("Price set successfully! Product is now visible to customers.");
      } else if (shouldActivate && newPrice > 0) {
        toast.success("Product activated and price updated successfully!");
      } else {
        toast.success("Price updated successfully.");
      }
    } catch (error) {
      console.error("❌ Error in handlePriceChange:", error.response || error.message || error);

      toast.error('Failed to update price');
    }
  };
  const handleDiscountChange = async (productId: string, newDiscount: number) => {
    try {
      const token = localStorage.getItem('token');
      await setDiscount(token, productId, newDiscount);
      toast.success("Discount submitted successfully.");
  
      // Optional: visually update the discount in UI
      setProducts(products.map(product =>
        product.id === productId ? { ...product, discountRate: newDiscount } : product
      ));
    } catch (error) {
      toast.error('Failed to update discount');
    }
  };
  

  const handleOrderStatusChange = (orderId: string, newStatus: Order['status']) => {
    setOrders(orders.map(order =>
      order.id === orderId ? { ...order, status: newStatus } : order
    ));
  };

  const handleDownloadInvoice = async (orderId: string) => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Authentication required. Please log in.');
      return;
    }
  
    try {
      const invoiceBase64 = await getOrderInvoiceManager(token, orderId);
      if (!invoiceBase64) {
        toast.error('No invoice data received from server.');
        return;
      }
      const link = document.createElement('a');
      link.href = `data:application/pdf;base64,${invoiceBase64}`;
      link.download = `Order-${orderId}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Invoice downloaded successfully!');
    } catch (error) {
      console.error('Download invoice error:', error);
      toast.error('Failed to download invoice. Please try again.');
    }
  };
  
  const mapBackendStatus = (backendStatus: string): string => {
    switch (backendStatus?.toLowerCase()) {
      case 'processing':
      case 'getting ready':
        return 'Getting ready';
      case 'in-transit':
      case 'on the way':
        return 'On the way';
      case 'delivered':
        return 'Delivered';
      case 'cancelled':
        return 'Cancelled';
      default:
        return 'Ordered';
    }
  };
  
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Sales Manager Dashboard</h1>
      <Tabs defaultValue="pricing" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="pricing">Pricing & Discounts</TabsTrigger>
          <TabsTrigger value="orders">Orders & Revenue</TabsTrigger>
          <TabsTrigger value="deliveries">Deliveries & Invoices</TabsTrigger>
          <TabsTrigger value="refunds">User Refunds</TabsTrigger>
        </TabsList>


        <TabsContent value="pricing">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Product Pricing & Discounts</CardTitle>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => fetchProducts(false)}
                className="flex items-center gap-1"
                disabled={isRefreshingProducts}
              >
                <RefreshCw size={16} className={isRefreshingProducts ? "animate-spin" : ""} />
                {isRefreshingProducts ? "Refreshing..." : "Refresh Products"}
              </Button>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="space-y-2">
                  <p className="text-amber-600 font-medium flex items-center">
                    <span className="mr-2">⚠️</span>
                    Products with $0.00 price need to be priced before they become visible to customers.
                  </p>
                  <p className="text-red-600 font-medium flex items-center">
                    <span className="mr-2">⚠️</span>
                    Inactive products (highlighted in red) need to be priced to activate them.
                  </p>
                </div>
              </div>
              {isRefreshingProducts ? (
                <div className="flex justify-center items-center py-12">
                  <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mb-3"></div>
                    <p className="text-gray-500">Loading products...</p>
                  </div>
                </div>
              ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product Name</TableHead>
                    <TableHead>
                      <select
                        className="border p-1 rounded text-sm"
                        value={filterCategory}
                        onChange={(e) => {
                          const selected = e.target.value;
                          setFilterCategory(selected);
                          if (selected === '') {
                            fetchProducts(false);
                          } else {
                            fetchProductsByCategoryName(selected, false);
                          }
                        }}
                      >
                        <option value="">All Categories</option>
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.name}>{cat.name}</option>
                        ))}
                      </select>
                    </TableHead>
                    <TableHead>Current Price</TableHead>
                    <TableHead>Discount Rate</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow 
                      key={product.id} 
                      className={
                        product.price === 0 
                          ? "bg-amber-50" 
                          : product.status === 0 
                            ? "bg-red-50" 
                            : ""
                      }
                    >
                      <TableCell>{product.name}</TableCell>
                      <TableCell>{product.category}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span>$</span>
                          <Input
                            type="number"
                            value={product.price}
                            onChange={(e) => handlePriceChange(product.id, Number(e.target.value))}
                            className={`w-24 ${product.price === 0 || product.status === 0 ? "border-amber-500" : ""}`}
                          />
                        </div>
                      </TableCell>
                      <TableCell>
  <div className="flex items-center gap-2">
    <Input
      type="number"
      value={
        pendingDiscounts[product.id] !== undefined
          ? pendingDiscounts[product.id]
          : product.discountRate
      }
      onChange={(e) => {
        const newDiscount = Number(e.target.value);
        setPendingDiscounts((prev) => ({
          ...prev,
          [product.id]: newDiscount
        }));
      }}
      className="w-24"
      disabled={product.price === 0 || product.status === 0}
    />
    <span>%</span>
    <Button
      size="sm"
      variant="outline"
      disabled={
        pendingDiscounts[product.id] === undefined ||
        pendingDiscounts[product.id] === product.discountRate
      }
      onClick={() => {
        const newDiscount = pendingDiscounts[product.id];
        handleDiscountChange(product.id, newDiscount);
        setPendingDiscounts((prev) => {
          const { [product.id]: _, ...rest } = prev;
          return rest;
        });
      }}
    >
      Set
    </Button>
  </div>
</TableCell>

                      <TableCell>
                        {product.price === 0 ? (
                          <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300">
                            Needs Price
                          </Badge>
                        ) : product.status === 0 ? (
                          <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">
                            Inactive
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                            Active
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders">
  <div className="grid grid-cols-2 gap-6">
    <Card>
      <CardHeader>
        <CardTitle>Revenue Overview</CardTitle>
      </CardHeader>
      <CardContent>
      <div className="flex flex-col sm:flex-row sm:items-end gap-4 mb-4">
      <div>
      <label className="block text-sm font-medium mb-1">Start Date</label>
      <Input
  type="date"
  value={startDate}
  max={endDate}
  onChange={(e) => setStartDate(e.target.value)}
/>
<label className="block text-sm font-medium mb-1">End Date</label>
<Input
  type="date"
  value={endDate}
  min={startDate}
  max={new Date().toISOString().split("T")[0]}
  onChange={(e) => setEndDate(e.target.value)}
/>

           </div>
           <Button onClick={() => fetchRevenueData(startDate, endDate)}>
            Update Chart
          </Button>
        </div>

        {/* EXISTING CHART */}
        <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
  <LineChart data={revenueData}>
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis dataKey="date" />
    <YAxis />
    <Tooltip />
    <Legend />
    <Line
      type="monotone"
      dataKey="revenue"
      stroke="#8884d8"
      name="Revenue"
    />
    <Line
      type="monotone"
      dataKey="profit"
      stroke="#82ca9d"
      name="Profit"
    />
    <Line
      type="monotone"
      dataKey="estimatedCost"
      stroke="#ffc658"
      name="Estimated Cost"
    />
  </LineChart>
</ResponsiveContainer>

        </div>
      </CardContent>
    </Card>


            <Card>
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                <TableHeader>
                  <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Address</TableHead> 
                  </TableRow>
                </TableHeader>

                  <TableBody>
                  {orders
                    .filter(order => {
                      const orderDate = new Date(order.date);
                      const start = new Date(startDate);
                      const end = new Date(endDate);
                      return orderDate >= start && orderDate <= end;
                    })
  .                 map((order) => (

                      <TableRow key={order.id}>
                        <TableCell>{order.id}</TableCell>
                        <TableCell>{order.date}</TableCell>
                        <TableCell>${order.totalAmount}</TableCell>
                        <TableCell>{order.status}</TableCell> 
                        <TableCell>{order.address}</TableCell> 
                       </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="refunds">
  <Card>
    <CardHeader>
      <div className="flex justify-between items-center w-full">
        <CardTitle>User Refund Requests</CardTitle>
        <div className="flex items-center gap-4">
          {isLoadingRefunds ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900 mr-2"></div>
              <span className="text-sm">Loading...</span>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={fetchRefunds}
              className="flex items-center gap-1"
            >
              <RefreshCw size={16} />
              Refresh
            </Button>
          )}
          <select
            id="refundFilter"
            className="p-2 border rounded-md"
            value={refundFilter}
            onChange={(e) => setRefundFilter(e.target.value as 'all' | 'pending')}
          >
            <option value="all">All Refunds</option>
            <option value="pending">Pending Only</option>
          </select>
        </div>
      </div>
    </CardHeader>
    <CardContent>
      {isLoadingRefunds ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <span className="ml-2">Loading refunds...</span>
        </div>
      ) : refunds.length === 0 ? (
        <div className="text-center text-gray-500 py-4">No refund requests found</div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Order ID</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {refunds
              .filter(refund => refundFilter === 'all' || refund.status === 0)
              .map((refund) => (
              <TableRow key={refund.id}>
                <TableCell>{refund.userEmail}</TableCell>
                <TableCell>{refund.orderId}</TableCell>
                <TableCell>{refund.reason}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      refund.status === 1
                        ? 'default'
                        : refund.status === 2
                        ? 'destructive'
                        : 'secondary'
                    }
                  >
                    {refund.status === 1
                      ? 'Accepted'
                      : refund.status === 2
                      ? 'Rejected'
                      : 'Pending'}
                  </Badge>
                </TableCell>
                <TableCell>{new Date(refund.createdAt).toLocaleString()}</TableCell>
                <TableCell>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    onClick={() => handleRefundAction(refund.id, 'approved')} 
                    disabled={refund.status !== 0}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Accept
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    onClick={() => handleRefundAction(refund.id, 'rejected')} 
                    disabled={refund.status !== 0}
                  >
                    Decline
                  </Button>
                </div>
              </TableCell>

              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </CardContent>
  </Card>
</TabsContent>



        
        <TabsContent value="deliveries">
          <Card>
            <CardHeader>
              <CardTitle>Deliveries & Invoices</CardTitle>
            </CardHeader>
          <CardContent>
            {/* Date Filter */}
            <div className="flex flex-col sm:flex-row gap-4 mb-4 items-center">
              <div className="flex items-center gap-2">
                <label htmlFor="start-date" className="text-sm font-medium">From:</label>
                <Input
                  id="start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-40"
                />
              </div>
              <div className="flex items-center gap-2">
                <label htmlFor="end-date" className="text-sm font-medium">To:</label>
                <Input
                  id="end-date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-40"
                />
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => fetchOrders()}
                className="flex items-center gap-1"
                disabled={isLoadingOrders}
              >
                <RefreshCw size={16} className={isLoadingOrders ? "animate-spin" : ""} />
                {isLoadingOrders ? "Refreshing..." : "Apply Filter"}
              </Button>
            </div>

            {isLoadingOrders ? (
            <div>Loading orders...</div>
              ) : (
            <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Products Details</TableHead>
              <TableHead>Invoice</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {allOrders
              .filter(order => {
                const orderDate = new Date(order.date);
                const start = new Date(startDate);
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999); // Set to end of day
                return orderDate >= start && orderDate <= end;
              })
              .map((order) => (
              <TableRow key={order.id}>
                <TableCell>{order.id}</TableCell>
                <TableCell>{new Date(order.date).toLocaleDateString()}</TableCell>
                <TableCell>${order.total.toFixed(2)}</TableCell>
                <TableCell>
                  <div className="p-2 border rounded-md">
                    <h4 className="font-medium mb-2">Products:</h4>
                    <Table className="mb-0">
                      <TableHeader className="bg-gray-50">
                        <TableRow>
                          <TableHead className="py-2">Name</TableHead>
                          <TableHead className="py-2">Quantity</TableHead>
                          <TableHead className="py-2">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {order.products.map((prod) => (
                          <TableRow key={prod.id} className={prod.cancelStatus === 'cancelled' ? 'bg-red-50' : ''}>
                            <TableCell className="py-2">{prod.name}</TableCell>
                            <TableCell className="py-2">{prod.quantity}</TableCell>
                            <TableCell className="py-2">
                              {prod.cancelStatus === 'cancelled' ? (
                                <Badge variant="destructive">Cancelled</Badge>
                              ) : (
                                <Badge variant="outline">{order.status}</Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </TableCell>
                <TableCell>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDownloadInvoice(order.id)}
                    className="flex items-center gap-1"
                  >
                    <Download size={16} />
                    Download
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </CardContent>
  </Card>
</TabsContent>

      </Tabs>
    </div>
  );
};

export default SalesManagerPage;

