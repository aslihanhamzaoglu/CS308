import axiosInstance from './axiosConfig';

export const getAllCategories = async () => {
    console.log('Fetching categories from backend');
    const response = await axiosInstance.get('/api/categories');
    return response.data.categories;
};

export const addCategory = async (categoryName) => {
    const response = await axiosInstance.post('/api/categories', {
        name: categoryName
    });
    return response.data;
};

export const addCategoryByProductManager = async (categoryName) => {
    const token = localStorage.getItem('token');
    const response = await axiosInstance.post('/api/categories/add',
        { name: categoryName },
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );
    return response.data;
};

// Get all categories for product managers
export const getAllCategoriesManager = async () => {
    const token = localStorage.getItem('token');
    const response = await axiosInstance.get('/api/categories/all', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data.categories;
  };
  
  // Deactivate a category (visible = 0)
  export const deactivateCategory = async (categoryId) => {
    const token = localStorage.getItem('token');
    await axiosInstance.post(
      '/api/categories/deactivate',
      { categoryId },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  };
  
  // Activate a category (visible = 1)
  export const activateCategory = async (categoryId) => {
    const token = localStorage.getItem('token');
    await axiosInstance.post(
      '/api/categories/activate',
      { categoryId },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  };
  