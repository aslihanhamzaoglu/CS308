
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
  } from "@/components/ui/dialog"
  import { AlertCircle } from "lucide-react"
  
  interface OutOfStockDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    productName: string;
  }
  
  const OutOfStockDialog = ({ isOpen, onOpenChange, productName }: OutOfStockDialogProps) => {
    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex gap-2 items-center text-coffee-brown">
              <AlertCircle className="h-5 w-5 text-red-500" />
              Out of Stock
            </DialogTitle>
            <DialogDescription>
              Sorry, this product is currently out of stock. Please check back later or browse our other products.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    )
  }
  
  export default OutOfStockDialog;