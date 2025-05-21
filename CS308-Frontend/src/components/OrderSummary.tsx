import { motion } from 'framer-motion';

interface OrderSummaryProps {
  cartItems: any[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
}

const OrderSummary = ({ cartItems, subtotal, tax, shipping, total }: OrderSummaryProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="rounded-lg bg-white shadow-sm border border-coffee-green/10 p-5"
    >
      <h2 className="text-xl font-semibold text-coffee-green mb-4">Order Summary</h2>
      
      <div className="space-y-4 mb-6">
        {cartItems.map((item) => (
          <div key={item.product.id} className="flex items-center justify-between text-coffee-brown">
            <div className="flex items-center gap-2">
              <span>{item.count}x</span>
              <span>{item.product.name}</span>
            </div>
            <span>${(item.product.price * item.count).toFixed(2)}</span>
          </div>
        ))}
      </div>

      <div className="space-y-3 mb-6">
        <div className="flex justify-between text-coffee-brown">
          <span>Subtotal</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-coffee-brown">
          <span>Tax</span>
          <span>${tax.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-coffee-brown">
          <span>Shipping</span>
          <span>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
        </div>
        
        <div className="border-t border-dashed border-coffee-green/20 pt-3 mt-3">
          <div className="flex justify-between font-semibold text-coffee-green">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>
      </div>
      
      <div className="mt-6 space-y-3">
        <div className="flex items-center text-sm text-coffee-brown">
          <div className="w-10 h-6 mr-2 bg-coffee-green-light/50 rounded flex items-center justify-center text-coffee-green font-medium">
            30d
          </div>
          <span>30-day money back guarantee</span>
        </div>
        
        <div className="flex items-center text-sm text-coffee-brown">
          <div className="w-10 h-6 mr-2 bg-coffee-green-light/50 rounded flex items-center justify-center text-coffee-green font-medium">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span>Secure checkout</span>
        </div>
      </div>
    </motion.div>
  );
};

export default OrderSummary; 