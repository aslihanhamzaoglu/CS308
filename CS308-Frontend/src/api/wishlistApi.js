import axiosInstance from './axiosConfig';

export const getWishlist = async (token) => {
  const res = await axiosInstance.post('api/wishlists/get', { token });
  return Array.isArray(res.data.products) ? res.data.products : [];
};

export const addProductToWishlist = async (token, productId) => {
  const res = await axiosInstance.post('api/wishlists/add', { token, productId });
  return res.data;
};

export const removeProductFromWishlist = async (token, productId) => {
  const res = await axiosInstance.post('api/wishlists/remove', { token, productId });
  return res.data;
};

export const clearWishlist = async (token) => {
  const res = await axiosInstance.post('api/wishlists/clear', { token });
  return res.data;
};