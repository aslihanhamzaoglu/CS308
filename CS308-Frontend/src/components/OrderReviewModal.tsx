
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { ButtonCustom } from '@/components/ui/button-custom';
import { Textarea } from "@/components/ui/textarea";
import { Star } from 'lucide-react';

interface OrderProduct {
  id: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  grind?: string;
  reviewed?: boolean;
  rating?: number;
}

interface OrderReviewModalProps {
  product: OrderProduct;
  onClose: () => void;
  onSubmit: (rating: number, comment: string) => void;
}

const OrderReviewModal = ({ product, onClose, onSubmit }: OrderReviewModalProps) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      alert('Please select a rating');
      return;
    }
    onSubmit(rating, comment);
  };
  
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-serif text-coffee-green">Review Your Purchase</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <div className="flex items-center gap-4 mb-6">
            <div className="relative w-16 h-16 rounded-md overflow-hidden bg-coffee-green-light/30 flex-shrink-0">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover object-center"
              />
            </div>
            <div>
              <h3 className="font-medium text-coffee-green text-lg">{product.name}</h3>
              {product.grind && (
                <p className="text-sm text-coffee-brown">Grind: {product.grind}</p>
              )}
            </div>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="block mb-2 text-sm font-medium text-coffee-green">Your Rating</label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className="text-coffee-green focus:outline-none"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                  >
                    <Star 
                      size={24} 
                      className={
                        (hoveredRating ? hoveredRating >= star : rating >= star) 
                          ? "fill-coffee-green" 
                          : "stroke-coffee-green"
                      }
                    />
                  </button>
                ))}
                <span className="ml-2 text-sm text-coffee-brown">
                  {rating > 0 ? `${rating} out of 5 stars` : 'Select your rating'}
                </span>
              </div>
            </div>
            
            <div className="mb-6">
              <label htmlFor="comment" className="block mb-2 text-sm font-medium text-coffee-green">
                Your Review (Optional)
              </label>
              <Textarea
                id="comment"
                placeholder="Share your thoughts about this product..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="min-h-[120px]"
              />
            </div>
            
            <div className="flex justify-end gap-2">
              <DialogClose asChild>
                <ButtonCustom type="button" variant="outline">Cancel</ButtonCustom>
              </DialogClose>
              <ButtonCustom type="submit">Submit Review</ButtonCustom>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OrderReviewModal;