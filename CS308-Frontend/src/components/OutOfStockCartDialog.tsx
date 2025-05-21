import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
  } from "@/components/ui/dialog"
  import { AlertCircle } from "lucide-react"
  
  interface OutOfStockCartDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    productName: string;
  }
  
  const OutOfStockCartDialog = ({ isOpen, onOpenChange, productName }: OutOfStockCartDialogProps) => {
    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex gap-2 items-center text-coffee-brown">
              <AlertCircle className="h-5 w-5 text-red-500" />
              Out of Stock Items
            </DialogTitle>
            <DialogDescription className="space-y-2">
              <p>
                The following items in your cart are currently out of stock or have insufficient stock:
              </p>
              <p className="font-medium text-coffee-brown">
                {productName}
              </p>
              <p>
                Please remove these items from your cart or adjust their quantities before proceeding to checkout.
              </p>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    )
  }
  
  export default OutOfStockCartDialog;