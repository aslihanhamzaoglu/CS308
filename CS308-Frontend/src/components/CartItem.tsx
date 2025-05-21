import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trash, Plus, Minus } from 'lucide-react';
import { ButtonCustom } from '@/components/ui/button-custom';
import { toast } from 'sonner';
import { getStockById } from "@/api/productApi";
import OutOfStockDialog from '@/components/OutOfStockDialog';

interface CartItemProps {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  grind?: string;
  onRemove: (id: string) => void;
  onQuantityChange: (id: string, newQuantity: number) => void;
}

const CartItem = ({
  id,
  name,
  price,
  image,
  quantity,
  grind,
  onRemove,
  onQuantityChange
}: CartItemProps) => {
  const [isRemoving, setIsRemoving] = useState(false);
  const [actualStock, setActualStock] = useState<number | null>(null);
  const [isOutOfStockDialogOpen, setIsOutOfStockDialogOpen] = useState(false);
  const [insufficientStockMessage, setInsufficientStockMessage] = useState('');

  useEffect(() => {
    const fetchStock = async () => {
      try {
        const stockAmount = await getStockById(Number(id));
        setActualStock(stockAmount);
      } catch (error) {
        console.error('Error fetching stock:', error);
      }
    };
    fetchStock();
  }, [id]);

  const handleRemoveItem = () => {
    setIsRemoving(true);
    setTimeout(() => {
      onRemove(id);
      toast.success(`${name} removed from cart`);
    }, 300);
  };

  const incrementQuantity = async () => {
    if (actualStock !== null) {
      if (quantity >= actualStock) {
        setInsufficientStockMessage(`Sorry, ${name} has limited stock (${actualStock} items available).`);
        setIsOutOfStockDialogOpen(true);
        return;
      }
    }
    
    if (quantity < 10) {
      onQuantityChange(id, quantity + 1);
      // Refresh stock after updating quantity
      const newStock = await getStockById(Number(id));
      setActualStock(newStock);
    } else {
      toast.info("Maximum quantity reached");
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      onQuantityChange(id, quantity - 1);
    } else {
      handleRemoveItem();
    }
  };

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: isRemoving ? 0 : 1, y: isRemoving ? -20 : 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-lg bg-white shadow-sm border border-coffee-green/10 mb-4"
      >
        <div className="relative w-20 h-20 rounded-md overflow-hidden bg-coffee-green-light/30 flex-shrink-0">
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover object-center"
            loading="lazy"
          />
        </div>
        
        <div className="flex-grow space-y-1 text-center sm:text-left">
          <h3 className="font-medium text-coffee-green text-lg">{name}</h3>
          {grind && (
            <p className="text-sm text-coffee-brown">Grind: {grind}</p>
          )}
          <p className="font-medium text-coffee-green">${price.toFixed(2)}</p>
          {actualStock !== null && actualStock <= 5 && actualStock > 0 && (
            <p className="text-sm text-yellow-600">Only {actualStock} left in stock!</p>
          )}
          {actualStock === 0 && (
            <p className="text-sm text-red-600">Out of stock!</p>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <ButtonCustom 
            variant="outline" 
            size="icon"
            onClick={decrementQuantity}
            className="h-8 w-8 rounded-full"
          >
            <Minus size={14} />
          </ButtonCustom>
          
          <span className="w-8 text-center font-medium">{quantity}</span>
          
          <ButtonCustom 
            variant="outline" 
            size="icon"
            onClick={incrementQuantity}
            className="h-8 w-8 rounded-full"
            disabled={actualStock !== null && quantity >= actualStock}
          >
            <Plus size={14} />
          </ButtonCustom>
        </div>
        
        <div className="flex items-center justify-between w-full sm:w-auto">
          <p className="font-semibold text-coffee-green sm:hidden">
            ${(price * quantity).toFixed(2)}
          </p>
          
          <ButtonCustom
            variant="ghost"
            size="icon"
            onClick={handleRemoveItem}
            className="text-coffee-brown hover:text-red-500 h-8 w-8"
          >
            <Trash size={16} />
          </ButtonCustom>
          
          <p className="font-semibold text-coffee-green hidden sm:block min-w-[70px] text-right">
            ${(price * quantity).toFixed(2)}
          </p>
        </div>
      </motion.div>

      <OutOfStockDialog 
        isOpen={isOutOfStockDialogOpen}
        onOpenChange={setIsOutOfStockDialogOpen}
        productName={insufficientStockMessage}
      />
    </>
  );
};

export default CartItem;