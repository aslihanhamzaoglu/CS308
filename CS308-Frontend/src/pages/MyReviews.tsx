import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { getCommentsByUser } from '@/api/commentApi';

const MyReviews = () => {
  const [comments, setComments] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchComments = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login to see your reviews.');
        return;
      }

      try {
        const userComments = await getCommentsByUser(token);
        console.log("Fetched comments:", userComments);
        setComments(userComments || []);
      } catch (err) {
        console.error('Failed to fetch user comments:', err);
        setError('Failed to load your reviews. Please try again later.');
      }
    };

    fetchComments();
  }, []);

  return (
    <div className="max-w-5xl mx-auto py-10 px-4">
      <motion.h2
        className="text-3xl font-bold text-coffee-green mb-6 text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        My Reviews
      </motion.h2>

      {error && (
        <p className="text-center text-red-500 mb-4">{error}</p>
      )}

      {comments.length === 0 && !error ? (
        <p className="text-center text-gray-500">You haven't written any reviews yet.</p>
      ) : (
        <div className="space-y-6">
          {comments.map((comment) => (
            <motion.div
              key={comment.comment_id}
              onClick={() => navigate(`/product/${comment.product_id}`)}
              className="border border-gray-200 p-4 rounded-lg shadow-sm bg-white flex gap-4 cursor-pointer hover:shadow-md transition-shadow"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {comment.product_image && (
                <img
                  src={comment.product_image}
                  alt={comment.product_name}
                  className="w-20 h-20 object-cover rounded"
                />
              )}
              <div>
                <h3 className="text-lg font-semibold text-driftmood-dark">
                  {comment.product_name}
                </h3>
                <p className="text-driftmood-brown">{comment.comment}</p>
                <p className="text-sm text-gray-400 mt-1">
                  {new Date(comment.created_at).toLocaleDateString()}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyReviews;
