import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface RefundRequestModalProps {
  onClose: () => void;
  onConfirm: () => void;
  status: 'idle' | 'processing' | 'success' | 'error';
}

const RefundRequestModal = ({ onClose, onConfirm, status }: RefundRequestModalProps) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg w-96 p-6 relative">
        
        {/* Close button */}
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
          onClick={onClose}
          disabled={status === 'processing'}
        >
          <X size={20} />
        </button>

        {/* Title */}
        <h2 className="text-xl font-semibold mb-4 text-coffee-green">
          Request Refund
        </h2>

        {/* Status Message */}
        {status === 'idle' && (
          <p className="text-coffee-brown mb-6">
            Are you sure you want to request a refund for this order?
          </p>
        )}
        {status === 'processing' && (
          <p className="text-coffee-brown mb-6">
            Processing your refund request...
          </p>
        )}
        {status === 'success' && (
          <p className="text-green-600 mb-6">
            Refund request submitted successfully! ✅
          </p>
        )}
        {status === 'error' && (
          <p className="text-red-600 mb-6">
            Failed to submit refund. Please try again. ❌
          </p>
        )}

        {/* Buttons */}
        <div className="flex justify-end gap-4">
          {status === 'idle' && (
            <>
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={onConfirm}>
                Confirm Refund
              </Button>
            </>
          )}
          {status === 'processing' && (
            <Button disabled>
              Processing...
            </Button>
          )}
          {(status === 'success' || status === 'error') && (
            <Button onClick={onClose}>
              Close
            </Button>
          )}
        </div>

      </div>
    </div>
  );
};

export default RefundRequestModal;
