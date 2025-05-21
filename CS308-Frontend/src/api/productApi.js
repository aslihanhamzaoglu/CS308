import axiosInstance from './axiosConfig';

// Get all products (for admin/managers)
export const getAllProducts = async (token) => {
    const response = await axiosInstance.get('/api/products/');
    return response.data.products; 
};

// Get all products (for admin/managers)
export const getAllProductsM = async (token) => {
    const response = await axiosInstance.post('/api/products/get-all',{token});
    return response.data.products; 
};

// Get all products for customers (filters out products with price = 0)
export const getCustomerProducts = async () => {
    const response = await axiosInstance.get('/api/products');
    // Filter out products with price = 0 (not yet priced by sales manager)
    const products = response.data.products.filter(product => product.price > 0);
    return products;
};

// Get product by ID
export const getProductById = async (productId) => {
    const response = await axiosInstance.get(`/api/products/${productId}`);
    return response.data;
};

// Get products by category
export const getProductsByCategory = async (categoryId) => {
    const response = await axiosInstance.get(`/api/products/category/${categoryId}`);
    return response.data.products;
};

// Get products by category for customers (filters out products with price = 0)
export const getCustomerProductsByCategory = async (categoryId) => {
    const response = await axiosInstance.get(`/api/products/category/${categoryId}`);
    // Filter out products with price = 0 (not yet priced by sales manager)
    const products = response.data.products.filter(product => product.price > 0);
    return products;
};

// Add new product
export const addProduct = async (productData) => {
    const response = await axiosInstance.post('/api/products', productData);
    return response.data;
};

// Update product
export const updateProduct = async (productId, productData) => {
    const response = await axiosInstance.put(`/api/products/${productId}`, productData);
    return response.data;
};

// Delete product
export const deleteProduct = async (token, productId) => {
    console.log("on delete", token, productId);
    const response = await axiosInstance.post(`/api/products/delete`, 
        {
            token,
            productId
        }
    );
    return response.data;
};

// Reverse deletion of a product
export const activateProduct = async (token, productId) => {
    const response = await axiosInstance.post(`/api/products/activate`, 
        {
            token,
            productId
        }
    );
    return response.data;
};


export const getStockById = async (productId) => {
    try {
        const res = await axiosInstance.post('/api/products/get-stock', { productId });
        return res.data.stock;
    } catch (error) {
        console.error('Error fetching stock:', error);
        return null;
    }
};

// Get product stock (POST)
export const getStock = async (productId) => {
    const response = await axiosInstance.post('/api/products/get-stock', { productId });
    return response.data.stock;
};

// Set product price (POST)
export const setPrice = async ({ token, productId, price }) => {
    // If price is greater than 0, also set status to 1 (active)
    const status = price > 0 ? 1 : 0;
    
    const response = await axiosInstance.post(
      '/api/products/setPrice',
      { productId, price, status },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  };
  
  

// Add new product (with token)
export const addProductWithToken = async (productData) => {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('No authentication token found');
        }
        
        // Ensure all numeric fields are properly formatted
        const formattedData = {
            ...productData,
            price: Number(productData.price || 0),
            stock: Number(productData.stock || 0),
            category_id: Number(productData.category_id || 0)
        };
        
        console.log('Sending formatted product data:', formattedData);
        
        const response = await axiosInstance.post('/api/products/add', formattedData, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        
        return response.data;
    } catch (error) {
        console.error('Error in addProductWithToken:', error.response?.data || error.message);
        throw error;
    }
};

// Set product stock (POST)
export const setStock = async (token, productId, stock) => {
    const response = await axiosInstance.post('/api/products/set-stock', {
        token,
        productId,
        stock
    });
    return response.data;
};

export const setDiscount = async (token, productId, discount) => {
    return await axiosInstance.post(
      '/api/products/setDiscount',
      { productId, discount },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
  };


  
