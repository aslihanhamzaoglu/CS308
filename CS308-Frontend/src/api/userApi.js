import axiosInstance from './axiosConfig';

// Signin Function
export const signin = async (user) => {
    const response = await axiosInstance.post('/api/users/signin', user);
    console.log("User signed in:", response.data);
    return response.data;
};

// Signup Function
export const signup = async (newuser) => {
    const response = await axiosInstance.post('/api/users/signup', newuser);
    console.log("User registered:", response.data);
    return response.data;
};

export const getUserProfile = async (token) => {
  const response = await axiosInstance.post('/api/users/profile', {
    token
  });
  return response.data.user; // { name, email }
};

// Get user orders
export const getUserOrders = async () => {
    const response = await axiosInstance.get('/api/users/orders');
    return response.data;
};
export const changeName = async (token, name) => {
  const response = await axiosInstance.post('/api/users/changeName', {
    token,
    name,
  });
  console.log('Name updated:', response.data);
  return response.data;
};

export const changeUserRole = async (token, role) => {
  const response = await axiosInstance.post('/api/users/changeUserRole', {
    token,
    role
  });
  return response.data;
};
