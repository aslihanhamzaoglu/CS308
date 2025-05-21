import axiosInstance from './axiosConfig';

export const getOrdersByUser = async (token) => {
  const response = await axiosInstance.post('/api/orders/getOrdersByUser', {
    token
  });
  return response.data.orders;
};

export const getOrderInvoice = async (token, orderId) => {
  const response = await axiosInstance.post('/api/orders/getInvoice', {
    token,
    orderId: String(orderId)
  });

  console.log("Invoice API response:", response.data);

  if (!response.data || !response.data.invoiceBase64) {
    throw new Error("Invalid response format from server");
  }

  return response.data.invoiceBase64;
};

export const getOrderInvoiceManager = async (token, orderId) => {
  const response = await axiosInstance.post('/api/orders/getInvoiceM', {
    token,
    orderId: String(orderId)
  });

  console.log("Invoice API response:", response.data);

  if (!response.data || !response.data.invoiceBase64) {
    throw new Error("Invalid response format from server");
  }

  return response.data.invoiceBase64;
};


export const createOrder = async (token) => {
  const response = await axiosInstance.post('/api/orders/checkout', {
    token
  });
  return response.data;
};


// orderApi.js
export const getAll = async (token) => {
  try {
    const response = await axiosInstance.post('/api/items/getAll', {
      token
    });
    return response.data;
  } catch (error) {
    console.error("Fetching all items failed:", error);
    throw error;
  }
};


export const getRevenueGraph = async (token, startDate, endDate) => {
  const response = await axiosInstance.post('/api/orders/revenueGraph', {
    token,
    startDate,
    endDate,
  });
  return response.data.data; 
};

export const acceptRefund = async ({ token, orderId }) => {
  const response = await axiosInstance.post('/api/orders/acceptRefund', { token, orderId });
  return response.data;
};
  
export const getAllOrders = async (token) => {
  console.log("here in get all orders", token);
  try {
    const response = await axiosInstance.post('/api/orders/all', {
      token
    });
    return response.data.orders; 
  } catch (error) {
    console.error("Fetching all orders failed:", error);
    throw error;
  }
};

export const cancelOrder = async (token, orderId) => {
  try {
    const response = await axiosInstance.post('/api/orders/cancelOrder', {
      token,
      orderId
    });
    return response.data;
  } catch (error) {
    console.error('Error cancelling order:', error);
    throw error;
  }
};



export const changeOrderStatus = async (orderId, newStatus) => {
  try {
    const response = await axiosInstance.post('/api/orders/changeOrderStatus', {
      orderId,
      newStatus
    });
    return response.data;
  } catch (error) {
    console.error("Changing order status failed:", error);
    throw error;
  }
};