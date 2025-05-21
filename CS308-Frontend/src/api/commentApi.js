import axiosInstance from './axiosConfig';

export const getCommentsByProduct = async (productId) => {
  try {
    const response = await axiosInstance.post('/api/comments/', {
      productId
    });
    return response.data.comments;
  } catch (error) {
    console.error('Failed to fetch comments:', error);
    return [];
  }
};

export const addComment = async (token, productId, comment) => {
  try {
    const response = await axiosInstance.post('/api/comments/add', {
      token,
      productId,
      comment
    });
    return response.data;
  } catch (error) {
    console.error("Failed to add comment:", error);
    throw error;
  }
};

export const getCommentsByUser = async (token) => {
  try {
    const response = await axiosInstance.post('/api/comments/by-user', {
      token
    });
    return response.data.comments;
  } catch (error) {
    console.error('Error fetching user comments:', error);
    throw error;
  }
};

export const getAllComments = async () => {
  try {
    // First get all products
    const productsResponse = await axiosInstance.get('/api/products');
    const products = productsResponse.data.products;
    
    // Then get comments for each product
    const allComments = [];
    for (const product of products) {
      const commentsResponse = await axiosInstance.post('/api/comments/', {
        productId: product.id
      });
      if (commentsResponse.data.comments) {
        allComments.push(...commentsResponse.data.comments.map(comment => ({
          ...comment,
          productName: product.name
        })));
      }
    }
    
    return allComments;
  } catch (error) {
    console.error('Failed to fetch all comments:', error);
    return [];
  }
};

export const getAllCommentsPM = async () => {
  try {
    // First get all products
    const productsResponse = await axiosInstance.get('/api/products');
    const products = productsResponse.data.products;
    
    // Then get comments for each product
    const allComments = [];
    for (const product of products) {
      const commentsResponse = await axiosInstance.post('/api/comments/all', {
        productId: product.id
      });
      if (commentsResponse.data.comments) {
        allComments.push(...commentsResponse.data.comments.map(comment => ({
        id: comment.id,
        productId: comment.product_id,
        userId: comment.user_id,
        userName: comment.user_name,
        productName: product.name,
        content: comment.content,
        status: comment.status,
        createdAt: comment.created_at
})));
      }
    }
    
    return allComments;
  } catch (error) {
    console.error('Failed to fetch all comments:', error);
    return [];
  }
};

/*
export const deleteComment = async (commentId) => {
  try {
    const response = await axiosInstance.post('/api/comments/delete', { commentId });
    return response.data;
  } catch (error) {
    console.error('Failed to delete comment:', error);
    throw error;
  }
};
*/

export const acceptComment = async (token, commentId) => {
  try {
    const response = await axiosInstance.post('/api/comments/accept', {
      token,
      commentId
    })
    return response.data;
  } catch (error) {
    console.error('Failed to accept comment:', error);
    throw error;
  }
};

export const rejectComment = async (token, commentId) => {
  try {
    const response = await axiosInstance.post('/api/comments/decline', {
      token,
      commentId
    });
    return response.data;
  } catch (error) {
    console.error('Failed to reject comment:', error);
    throw error;
  }
};
