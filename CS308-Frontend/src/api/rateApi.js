import axiosInstance from './axiosConfig';

export const getRatingsByProduct = async (productId) => {
  try {
    const response = await axiosInstance.post('/api/rates/getall', {
      product_id: productId
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching ratings:', error);
    throw error;
  }
};

export const addRate = async (token, productId, rate) => {
  const response = await axiosInstance.post('/api/rates/rate', {
    token,
    product_id: productId,
    rate
  });

  return response.data;
};

export const getRatesByUser = async (token) => {
  try {
    const response = await axiosInstance.post('/api/rates/getRatesByUser', { token });
    return response.data.rates;
  } catch (error) {
    console.error('Error fetching rates by user:', error);
    return [];
  }
};
