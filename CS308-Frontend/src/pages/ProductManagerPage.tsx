import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Save, X, Download, ChevronDown, ChevronRight } from "lucide-react";
import { getAllCategories, addCategoryByProductManager as addCategory, deactivateCategory, activateCategory, getAllCategoriesManager } from '@/api/categoryApi';
import { getAllProductsM, addProductWithToken, updateProduct, deleteProduct, setPrice, setStock, activateProduct } from '@/api/productApi';
import { toast } from 'sonner';
import { getAllCommentsPM, acceptComment, rejectComment } from '@/api/commentApi';
import { useNavigate } from 'react-router-dom';
import { getAllOrders, getOrderInvoiceManager, changeOrderStatus } from '@/api/orderApi';

interface Category {
  id: number;
  name: string;
  visible: number; 
}

interface Product {
  id: number;
  name: string;
  model: string;
  serialNumber: string;
  description: string;
  stock: number;
  price: number;
  warrantyStatus: string;
  distributor: string;
  category_id: number;
  picture: string;
  status?: number; // 1 = active, 0 = inactive (when category is deleted)
  visible: number;
}

interface Delivery {
  id: string;
  productName: string;
  quantity: number;
  status: 'pending' | 'in_transit' | 'delivered';
  invoiceNumber: string;
}

interface Comment {
  id: number;
  productId: number;
  userId: number;
  userName?: string;
  productName?: string;
  content: string;
  status: number; // 1 = accepted, 0 = rejected
  createdAt: string;
}

interface OrderProduct {
  id: string;
  p_id?: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  grind?: string;
  cancelStatus?: 'cancelled';
}

interface Order {
  id: string;
  date: string;
  status: string;
  total: number;
  products: OrderProduct[];
  userEmail?: string;
  userName?: string;
  address: string;
  invoicePdf: string;
}

const ProductManagerPage = () => {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newCategory, setNewCategory] = useState('');
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    name: '',
    model: '',
    serialNumber: '',
    description: '',
    stock: 0,
    price: 0,
    warrantyStatus: 'No',
    distributor: '',
    category_id: 0,
    picture: ''
  });
  const [filterName, setFilterName] = useState('');
  const [sortOption, setSortOption] = useState('date-desc'); // default: newest first
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [orders, setOrders] = useState<{ mapped: Order, raw: any }[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [downloadingOrderId, setDownloadingOrderId] = useState<string | null>(null);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [commentFilter, setCommentFilter] = useState<'all' | 'pending'>('all');
  const [cancelingProduct, setCancelingProduct] = useState<{orderId: string, productId: string} | null>(null);

  useEffect(() => {
    // Check user role on component mount
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Authentication required. Please log in.');
      navigate('/login');
      return;
    }

    try {
      // Decode JWT token to get user role
      const tokenPayload = JSON.parse(atob(token.split('.')[1]));
      const role = tokenPayload.role;
      setUserRole(role);

      if (role !== 'product_manager') {
        toast.error('Access denied. Product manager role required.');
        navigate('/');
        return;
      }

      // If role is product_manager, proceed with fetching data
      fetchCategories();
      fetchProducts();
      fetchComments();
      fetchOrders();
    } catch (error) {
      console.error('Error decoding token:', error);
      toast.error('Invalid authentication token');
      navigate('/login');
    }
  }, [navigate]);

const fetchCategories = async () => {
  try {
    const categoriesData = await getAllCategoriesManager();
    setCategories(categoriesData);
  } catch (error) {
    console.error('Error fetching categories:', error);
    toast.error('Failed to fetch categories');
  }
};


  const fetchProducts = async () => {
    try {
      const productsData = await getAllProductsM();
      // Set default status = 1 (active) for all products
      const productsWithStatus = productsData.map(product => ({
        ...product,
        status: product.status === undefined ? 1 : product.status
      }));
      setProducts(productsWithStatus);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to fetch products');
    }
  };

  const handleAddCategory = async () => {
    if (newCategory.trim()) {
      try {
        await addCategory(newCategory.trim());
        await fetchCategories(); // Refresh categories after adding
        setNewCategory('');
        toast.success('Category added successfully');
      } catch (error) {
        console.error('Error adding category:', error);
        toast.error('Failed to add category');
      }
    }
  };

  const handleDeleteCategory = async (id: number) => {
    try {
      await deactivateCategory(id);
      await fetchCategories();
      await fetchProducts();
      toast.success('Category deactivated and related products hidden');
    } catch (error) {
      console.error('Error deactivating category:', error);
      toast.error('Failed to deactivate category');
    }
  };
  

  const handleRecoverCategory = async (id: number) => {
    try {
      await activateCategory(id);
      await fetchCategories();
      await fetchProducts();
      toast.success('Category and its products reactivated');
    } catch (error) {
      console.error('Error reactivating category:', error);
      toast.error('Failed to reactivate category');
    }
  };
  

  const handleAddProduct = async () => {
    // Validate all required fields
    if (!newProduct.name || !newProduct.model || !newProduct.serialNumber || 
        !newProduct.description || !newProduct.distributor || !newProduct.category_id || 
        !newProduct.picture) {
        toast.error('Please fill in all required fields');
        return;
    }

    try {
        // Ensure all fields have proper values and types
        const productToAdd = {
          ...newProduct,
          price: 0,
          stock: newProduct.stock >= 0 ? newProduct.stock : 0, // Ensure stock is not negative
          warrantyStatus: newProduct.warrantyStatus || 'No',
          category_id: Number(newProduct.category_id) // Ensure category_id is a number
        };
        
        console.log('Sending product data:', productToAdd);
        
        const response = await addProductWithToken(productToAdd);
        setProducts([...products, response]);
        setNewProduct({
            name: '',
            model: '',
            serialNumber: '',
            description: '',
            stock: 0, // Set default to 0 instead of -1
            price: 0,
            warrantyStatus: 'No',
            distributor: '',
            category_id: 0,
            picture: ''
        });
        setIsAddingProduct(false);
        toast.success('Product added successfully. It will be visible to customers after Sales Manager sets a price.');
    } catch (error) {
        console.error('Error adding product:', error);
        toast.error('Failed to add product. Please check the product details and try again.');
    }
  };

  const handleDeleteProduct = async (id: number) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Token not found');
      await deleteProduct(token, id);
      fetchProducts();
      
      toast.success('Product deleted successfully');
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
  };

  const handleSaveEdit = async () => {
    if (editingProduct) {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No token found');
        // Update stock only, not price
        await setStock(token, editingProduct.id, editingProduct.stock);
        // Update local state
        setProducts(products.map(p =>
          p.id === editingProduct.id ? { ...p, stock: editingProduct.stock } : p
        ));
        setEditingProduct(null);
        toast.success('Product stock updated successfully');
      } catch (error) {
        console.error('Error updating product:', error);
        toast.error('Failed to update product stock');
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingProduct(null);
  };

  const handleAcceptComment = async (commentId: number) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Authentication required. Please log in.');
        return;
      }
      await acceptComment(token, commentId);
      setComments(comments.map(c => c.id === commentId ? { ...c, status: 1 } : c));
      toast.success('Comment accepted successfully');
    } catch (error) {
      console.error('Error accepting comment:', error);
      toast.error('Failed to accept comment');
    }
  };

  const handleRejectComment = async (commentId: number) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Authentication required. Please log in.');
        return;
      }
      await rejectComment(token, commentId);
      setComments(comments.map(c => c.id === commentId ? { ...c, status: -1 } : c));
      toast.success('Comment rejected successfully');
    } catch (error) {
      console.error('Error rejecting comment:', error);
      toast.error('Failed to reject comment');
    }
  };

  /*
  const handleDeleteComment = async (commentId: number) => {
    try {
      const response = await deleteComment(commentId);
      if (response.status === "deleted") {
        setComments(comments.filter(c => c.id !== commentId));
        toast.success('Comment deleted successfully');
      } else {
        throw new Error('Failed to delete comment');
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error('Failed to delete comment');
    }
  };
  */

  const fetchComments = async () => {
    setIsLoadingComments(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Authentication required. Please log in.');
        return;
      }
      const commentsData = await getAllCommentsPM(token);
      if (!Array.isArray(commentsData)) {
        console.error('Invalid comments data received:', commentsData);
        toast.error('Invalid data received from server');
        return;
      }
      setComments(commentsData);
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast.error('Failed to fetch comments');
    } finally {
      setIsLoadingComments(false);
    }
  };

  const fetchOrders = async () => {
    setIsLoadingOrders(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Authentication required. Please log in.');
        return;
      }
      const response = await getAllOrders(token);
      const rawOrders = Array.isArray(response) ? response : response.orders;
      // Map backend fields to Order interface
      const mappedOrders: { mapped: Order, raw: any }[] = (rawOrders || []).map((order: any) => {
        const mappedProducts = (order.product_list || []).map((prod: any) => ({
          id: prod.p_id?.toString() ?? '',
          p_id: prod.p_id?.toString() ?? '',
          name: prod.name,
          image: prod.image,
          price: parseFloat(prod.total_price),
          quantity: prod.quantity,
          grind: prod.grind,
          cancelStatus: prod.cancel_status === 'cancelled' ? 'cancelled' : undefined,
        }));
        
        const mapped = {
          id: order.order_id?.toString() ?? order.id?.toString() ?? '-',
          date: order.date ? new Date(order.date).toISOString() : '',
          status: mapBackendStatus(order.order_status),
          total: parseFloat(order.total_price ?? order.total ?? '0'),
          products: mappedProducts,
          userName: order.user_name || order.user_fullname || '',
          userEmail: order.email || '',
          address: order.address || order.shipping_address || '',
          invoicePdf: order.invoice_number || order.invoicePdf || '',
        };
        console.log('Raw order:', order);
        console.log('Mapped order:', mapped);
        return { mapped, raw: order };
      });
      setOrders(mappedOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to fetch orders');
    } finally {
      setIsLoadingOrders(false);
    }
  };

  const handleDownloadInvoice = async (orderId: string) => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Authentication required. Please log in.');
      return;
    }
    setDownloadingOrderId(orderId);
    try {
      const invoiceBase64 = await getOrderInvoiceManager(token, orderId);
      if (!invoiceBase64) {
        toast.error('No invoice data received from server.');
        setDownloadingOrderId(null);
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
    } finally {
      setDownloadingOrderId(null);
    }
  };

  // Filter and sort products based on status
  const getFilteredSortedProducts = (showInactive = false) => {
    let filtered = products.filter(p =>
      (showInactive ? p.status === 0 : p.status !== 0) && 
      (p.name ? p.name.toLowerCase().includes(filterName.toLowerCase()) : false)
    );
    
    // Sort products based on selected option
    switch (sortOption) {
      case 'alpha-asc':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'alpha-desc':
        filtered.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'date-asc':
        filtered.sort((a, b) => a.id - b.id);
        break;
      case 'date-desc':
      default:
        filtered.sort((a, b) => b.id - a.id);
        break;
    }
    
    return filtered;
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


  const handleActivateProduct = async (productId: number) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Token not found');

    await activateProduct(token, productId);
    fetchProducts();
    toast.success('Product restored successfully');
  } catch (error) {
    toast.error('Failed to restore product');
  }
};


  return (
    <div className="container mx-auto p-6">
      {userRole === 'product_manager' ? (
        <>
          <h1 className="text-3xl font-bold mb-6">Product Manager Dashboard</h1>
          <Tabs defaultValue="inventory" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="inventory">Inventory Management</TabsTrigger>
              <TabsTrigger value="comments">User Comments</TabsTrigger>
              <TabsTrigger value="orders">Orders</TabsTrigger>
            </TabsList>

            <TabsContent value="inventory">
              <div className="space-y-6">
                {/* Categories Section */}
                <Card>
                  <CardHeader>
                    <CardTitle>Categories</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2 mb-4">
                      <Input
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        placeholder="New category name"
                      />
                      <Button onClick={handleAddCategory}>Add</Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {categories.filter(category => category.visible === 1).map((category) => (
                        <Badge key={category.id} variant="secondary" className="flex items-center gap-2">
                          {category.name}
                          <Button size="icon" variant="ghost" onClick={() => handleDeleteCategory(category.id)} className="p-0 h-4 w-4 text-red-500 hover:bg-red-100">
                            <X className="h-3 w-3" />
                          </Button>
                        </Badge>
                      ))}
                    </div>
                    {categories.filter(cat => cat.visible === 0).length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-semibold text-sm mb-2">Inactive Categories</h4>
                      <div className="flex flex-wrap gap-2">
                        {categories.filter(cat => cat.visible === 0).map((cat) => (
                          <Badge key={cat.id} variant="outline" className="flex items-center gap-2">
                            {cat.name}
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleRecoverCategory(cat.id)}
                              className="p-0 h-4 w-4 text-green-600 hover:bg-green-100"
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  </CardContent>
                </Card>

                {/* Filter and Sort Controls (now below Categories, above Products) */}
                <div className="flex flex-col md:flex-row gap-4 my-4 items-center">
                  <Input
                    className="w-full md:w-1/3"
                    placeholder="Filter by product name..."
                    value={filterName}
                    onChange={e => setFilterName(e.target.value)}
                  />
                  <select
                    className="w-full md:w-1/4 p-2 border rounded-md"
                    value={sortOption}
                    onChange={e => setSortOption(e.target.value)}
                  >
                    <option value="date-desc">Newest First</option>
                    <option value="date-asc">Oldest First</option>
                    <option value="alpha-asc">A-Z</option>
                    <option value="alpha-desc">Z-A</option>
                  </select>
                </div>

                {/* Products Section */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Products</CardTitle>
                    <Button onClick={() => setIsAddingProduct(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add New Product
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {/* Add New Product Form */}
                      {isAddingProduct && (
                        <Card className="border-2 border-dashed">
                          <CardContent className="pt-6">
                            <div className="space-y-4">
                              <div>
                                <Label>Name *</Label>
                                <Input
                                  value={newProduct.name}
                                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                                  placeholder="Product name"
                                  required
                                />
                              </div>
                              <div>
                                <Label>Model *</Label>
                                <Input
                                  value={newProduct.model}
                                  onChange={(e) => setNewProduct({ ...newProduct, model: e.target.value })}
                                  placeholder="Product model"
                                  required
                                />
                              </div>
                              <div>
                                <Label>Serial Number *</Label>
                                <Input
                                  value={newProduct.serialNumber}
                                  onChange={(e) => setNewProduct({ ...newProduct, serialNumber: e.target.value })}
                                  placeholder="Product serial number"
                                  required
                                />
                              </div>
                              <div>
                                <Label>Description *</Label>
                                <Input
                                  value={newProduct.description}
                                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                                  placeholder="Product description"
                                  required
                                />
                              </div>
                              <div>
                                <Label>Warranty Status *</Label>
                                <select
                                  className="w-full p-2 border rounded-md"
                                  value={newProduct.warrantyStatus}
                                  onChange={(e) => setNewProduct({ ...newProduct, warrantyStatus: e.target.value })}
                                  required
                                >
                                  <option value="No">No</option>
                                  <option value="Yes">Yes</option>
                                </select>
                              </div>
                              <div>
                                <Label>Distributor *</Label>
                                <Input
                                  value={newProduct.distributor}
                                  onChange={(e) => setNewProduct({ ...newProduct, distributor: e.target.value })}
                                  placeholder="Product distributor"
                                  required
                                />
                              </div>
                              <div>
                                <Label>Category *</Label>
                                <select
                                  className="w-full p-2 border rounded-md"
                                  value={newProduct.category_id}
                                  onChange={(e) => setNewProduct({ ...newProduct, category_id: Number(e.target.value) })}
                                  required
                                >
                                  <option value="">Select a category</option>
                                  {categories.map((category) => (
                                    <option key={category.id} value={category.id}>
                                      {category.name}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <div>
                                <Label>Picture URL *</Label>
                                <Input
                                  value={newProduct.picture}
                                  onChange={(e) => setNewProduct({ ...newProduct, picture: e.target.value })}
                                  placeholder="Product image URL"
                                  required
                                />
                              </div>
                              <div>
                                <Label>Stock *</Label>
                                <Input
                                  type="number"
                                  min="0"
                                  value={newProduct.stock}
                                  onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value ? Number(e.target.value) : 0 })}
                                  placeholder="Initial stock quantity"
                                  required
                                />
                              </div>
                              <div className="flex gap-2">
                                <Button onClick={handleAddProduct}>Save</Button>
                                <Button variant="outline" onClick={() => setIsAddingProduct(false)}>Cancel</Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {/* Display Active Products */}
                      {getFilteredSortedProducts().map((product) => (
                        <Card key={product.id} className={`overflow-hidden ${product.visible === 0 ? 'border-red-500 border-2' : ''}`}>
                          <CardContent className="p-0">
                            {editingProduct?.id === product.id ? (
                              <div className="space-y-4 p-6">
                                <div>
                                  <Label>Stock</Label>
                                  <Input
                                    type="number"
                                    value={editingProduct.stock}
                                    onChange={(e) => setEditingProduct({ ...editingProduct, stock: Number(e.target.value) })}
                                  />
                                </div>
                                <div className="flex gap-2">
                                  <Button onClick={handleSaveEdit}>
                                    <Save className="h-4 w-4 mr-2" />
                                    Save
                                  </Button>
                                  <Button variant="outline" onClick={handleCancelEdit}>
                                    <X className="h-4 w-4 mr-2" />
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-4 p-6">
                                

                  {product.picture && (
                    <div className="relative">
                      <img
                        src={product.picture}
                        alt={product.name}
                        className={`w-full h-48 object-cover rounded-md ${product.visible === 0 ? 'opacity-60 grayscale' : ''}`}
                      />
                      {product.visible === 0 && (
                        <div className="absolute top-2 right-2">
                          <Badge variant="destructive">Deleted</Badge>
                        </div>
                      )}
                    </div>
                  )}



                                <div>
                                  <h3 className="font-semibold text-lg">{product.name}</h3>
                                  <p className="text-sm text-gray-500">{product.model}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                  <div>
                                    <Label>Price</Label>
                                    <p className="font-medium">${product.price}</p>
                                  </div>
                                  <div>
                                    <Label>Stock</Label>
                                    <p className="font-medium">{product.stock}</p>
                                  </div>
                                  <div>
                                    <Label>Category</Label>
                                    <p className="font-medium">
                                      {categories.find(c => c.id === product.category_id)?.name || 'Uncategorized'}
                                    </p>
                                  </div>
                                  <div>
                                    <Label>Warranty</Label>
                                    <p className="font-medium">{product.warrantyStatus}</p>
                                  </div>
                                </div>


                                <div className="flex justify-end gap-2 pt-2">
  {product.visible === 1 ? (
    <>
      <Button variant="outline" size="sm" onClick={() => handleEditProduct(product)}>
        Edit Stock
      </Button>
      <Button variant="destructive" size="sm" onClick={() => handleDeleteProduct(product.id)}>
        Delete
      </Button>
    </>
  ) : (
    <Button
      size="sm"
      className="bg-green-600 text-white hover:bg-green-700"
      onClick={() => handleActivateProduct(product.id)}
    >
      Restore
    </Button>
  )}
</div>




                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}


                      
                    </div>
                    
                    {/* Inactive Products Section */}
                    {getFilteredSortedProducts(true).length > 0 && (
                      <div className="mt-8">
                        <h3 className="text-lg font-semibold mb-4">Inactive Products</h3>
                        <p className="text-sm text-gray-500 mb-4">
                          These products are not visible to customers because their price have not been set.
                          They will become active  when their prices are set.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {getFilteredSortedProducts(true).map((product) => (
                            <Card key={product.id} className="overflow-hidden border-dashed border-gray-300">
                              <CardContent className="p-0">
                                <div className="space-y-4 p-6">
                                  {product.picture && (
                                    <div className="relative">
                                      <img
                                        src={product.picture}
                                        alt={product.name}
                                        className="w-full h-48 object-cover rounded-md opacity-60"
                                      />
                                      <div className="absolute top-2 right-2">
                                        <Badge variant="destructive">Inactive</Badge>
                                      </div>
                                    </div>
                                  )}
                                  <div>
                                    <h3 className="font-semibold text-lg">{product.name}</h3>
                                    <p className="text-sm text-gray-500">{product.model}</p>
                                  </div>
                                  <div className="grid grid-cols-2 gap-2">
                                    <div>
                                      <Label>Price</Label>
                                      <p className="font-medium">${product.price}</p>
                                    </div>
                                    <div>
                                      <Label>Stock</Label>
                                      <p className="font-medium">{product.stock}</p>
                                    </div>
                                  </div>
                                  <div className="text-sm text-red-600">
                                    Inactive product - Please contact sales manager to activate.
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="comments">
              <Card>
                <CardHeader>
  <div className="flex justify-between items-center w-full">
    <CardTitle>User Comments</CardTitle>
    <select
      id="commentFilter"
      className="p-2 border rounded-md"
      value={commentFilter}
      onChange={(e) => setCommentFilter(e.target.value as 'all' | 'pending')}
    >
      <option value="all">All Comments</option>
      <option value="pending">Pending Only</option>
    </select>
  </div>
</CardHeader>
                <CardContent>
                  {isLoadingComments ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                      <span className="ml-2">Loading comments...</span>
                    </div>
                  ) : comments.length === 0 ? (
                    <div className="text-center text-gray-500 py-4">No comments found</div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Product</TableHead>
                          <TableHead>User</TableHead>
                          <TableHead>Comment</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Created At</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {comments
  .filter(comment => commentFilter === 'all' || comment.status === 0)
  .map((comment) => (
                          <TableRow key={comment.id}>
                            <TableCell>{comment.productName || `Product #${comment.productId}`}</TableCell>
                            <TableCell>{comment.userName || `User #${comment.userId}`}</TableCell>
                            <TableCell className="whitespace-pre-wrap break-words">{comment.content}</TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  comment.status === 1
                                    ? 'default'
                                    : comment.status === -1
                                    ? 'destructive'
                                    : 'secondary'
                                }
                              >
                                {comment.status === 1 ? 'Accepted' : comment.status === -1 ? 'Rejected' : 'Pending'}
                              </Badge>
                            </TableCell>
                            <TableCell>{new Date(comment.createdAt).toLocaleString()}</TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button 
                                  size="sm" 
                                  onClick={() => handleAcceptComment(comment.id)} 
                                  disabled={comment.status === 1}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  Accept
                                </Button>
                                <Button 
                                  variant="destructive" 
                                  size="sm" 
                                  onClick={() => handleRejectComment(comment.id)} 
                                  disabled={comment.status === -1}
                                >
                                  Reject
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

            <TabsContent value="orders">
              <Card>
                <CardHeader>
                  <CardTitle>Orders</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoadingOrders ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                      <span className="ml-2">Loading orders...</span>
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="text-center text-gray-500 py-4">No orders found</div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Order ID</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Total</TableHead>
                          <TableHead>User Email</TableHead>
                          <TableHead>Address</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Invoice</TableHead>
                          <TableHead>Details</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {orders.map(({ mapped, raw }) => (
                          <React.Fragment key={mapped.id}>
                            <TableRow>
                              <TableCell>{mapped.id}</TableCell>
                              <TableCell>{mapped.date ? new Date(mapped.date).toLocaleDateString() : '-'}</TableCell>
                              <TableCell>${mapped.total?.toFixed ? mapped.total.toFixed(2) : mapped.total}</TableCell>
                              <TableCell>{mapped.userEmail || '-'}</TableCell>
                              <TableCell>{mapped.address || '-'}</TableCell>
                              <TableCell>
                                <select
                                  className="p-1 border rounded text-sm"
                                  value={raw.order_status}
                                  onChange={async (e) => {
                                    const newStatus = e.target.value;
                                    try {
                                      await changeOrderStatus(raw.order_id, newStatus);
                                      toast.success(`Order status changed to ${newStatus}`);
                                      fetchOrders();
                                    } catch (err) {
                                      toast.error('Failed to update order status');
                                    }
                                  }}
                                >
                                  <option value="processing">Processing</option>
                                  <option value="in-transit">In-Transit</option>
                                  <option value="delivered">Delivered</option>
                                  <option value="cancelled">Cancelled</option>
                                </select>
                              </TableCell>
                              <TableCell>
                                <Button size="icon" variant="outline" onClick={() => handleDownloadInvoice(raw.order_id)} disabled={downloadingOrderId === mapped.id}>
                                  {downloadingOrderId === mapped.id ? (
                                    <span className="flex items-center"><span className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900 mr-1"></span>...</span>
                                  ) : (
                                    <Download className="h-4 w-4" />
                                  )}
                                </Button>
                              </TableCell>
                              <TableCell>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setExpandedOrderId(expandedOrderId === mapped.id ? null : mapped.id)}
                                  className="flex items-center gap-1"
                                >
                                  {expandedOrderId === mapped.id ? (
                                    <>Hide Products <ChevronDown className="h-4 w-4" /></>
                                  ) : (
                                    <>View Products <ChevronRight className="h-4 w-4" /></>
                                  )}
                                </Button>
                              </TableCell>
                            </TableRow>
                            {expandedOrderId === mapped.id && (
                              <TableRow>
                                <TableCell colSpan={8} className="bg-gray-50 p-0">
                                  <div className="p-4">
                                    <div className="font-semibold mb-2">Products in this order:</div>
                                    <Table className="mb-0">
                                      <TableHeader>
                                        <TableRow>
                                          <TableHead>Product ID</TableHead>
                                          <TableHead>Product Name</TableHead>
                                          <TableHead>Quantity</TableHead>
                                          <TableHead>Price</TableHead>
                                          <TableHead>Status</TableHead>
                                        </TableRow>
                                      </TableHeader>
                                      <TableBody>
                                        {mapped.products && mapped.products.length > 0 ? (
                                          mapped.products.map((prod, idx) => (
                                            <TableRow key={prod.id || idx} className={prod.cancelStatus === 'cancelled' ? 'bg-red-50' : ''}>
                                              <TableCell className="font-medium">{prod.p_id || prod.id}</TableCell>
                                              <TableCell>{prod.name}</TableCell>
                                              <TableCell>{prod.quantity}</TableCell>
                                              <TableCell>${prod.price.toFixed(2)}</TableCell>
                                              <TableCell>
                                                {prod.cancelStatus === 'cancelled' ? (
                                                  <Badge variant="destructive">Cancelled</Badge>
                                                ) : (
                                                  <Badge variant="outline">{mapped.status}</Badge>
                                                )}
                                              </TableCell>
                                            </TableRow>
                                          ))
                                        ) : (
                                          <TableRow>
                                            <TableCell colSpan={5} className="text-center text-gray-400">No products found</TableCell>
                                          </TableRow>
                                        )}
                                      </TableBody>
                                    </Table>
                                  </div>
                                </TableCell>
                              </TableRow>
                            )}
                          </React.Fragment>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      ) : (
        <div className="text-center py-8">
          <h2 className="text-2xl font-bold text-red-600">Access Denied</h2>
          <p className="mt-2">You must be a product manager to access this page.</p>
        </div>
      )}
    </div>
  );
};

export default ProductManagerPage; 