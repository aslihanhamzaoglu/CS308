// full updated component with product-level cancellation and modal
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ButtonCustom } from '@/components/ui/button-custom';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ChevronLeft, Download, Star, X } from 'lucide-react';
import { toast } from 'sonner';
import OrderReviewModal from '@/components/OrderReviewModal';
import { getOrdersByUser, getOrderInvoice, cancelOrder } from '@/api/orderApi';
import { addComment } from "@/api/commentApi"; 
import { addRate, getRatesByUser } from "@/api/rateApi";

const RefundRequestModal = ({ onClose, onConfirm, product }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
    <div className="bg-white rounded-lg shadow-lg w-96 p-6 relative">
      <button className="absolute top-3 right-3 text-gray-400 hover:text-gray-600" onClick={onClose}>
        <X size={20} />
      </button>
      <h2 className="text-xl font-semibold mb-4 text-coffee-green">Request Refund</h2>
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <img src={product.image} alt={product.name} className="w-16 h-16 object-cover rounded-md" />
          <div>
            <div className="font-medium text-coffee-green">{product.name}</div>
            {product.grind && <div className="text-sm text-coffee-brown">Grind: {product.grind}</div>}
            <div className="text-sm text-coffee-brown">Quantity: {product.quantity}</div>
            <div className="text-sm text-coffee-brown">Price: ${product.price.toFixed(2)}</div>
          </div>
        </div>
        <p className="text-coffee-brown">Are you sure you want to request a refund for this product?</p>
      </div>
      <div className="flex justify-end gap-4">
        <ButtonCustom variant="outline" onClick={onClose}>Cancel</ButtonCustom>
        <ButtonCustom onClick={onConfirm}>Confirm Refund</ButtonCustom>
      </div>
    </div>
  </div>
);

const CancelRequestModal = ({ onClose, onConfirm, product }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
    <div className="bg-white rounded-lg shadow-lg w-96 p-6 relative">
      <button className="absolute top-3 right-3 text-gray-400 hover:text-gray-600" onClick={onClose}>
        <X size={20} />
      </button>
      <h2 className="text-xl font-semibold mb-4 text-red-600">Cancel Product</h2>
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <img src={product.image} alt={product.name} className="w-16 h-16 object-cover rounded-md" />
          <div>
            <div className="font-medium text-red-600">{product.name}</div>
            <div className="text-sm text-gray-700">Quantity: {product.quantity}</div>
            <div className="text-sm text-gray-700">Price: ${product.price.toFixed(2)}</div>
          </div>
        </div>
        <p className="text-gray-800">
          Are you sure you want to cancel this item from your order?
        </p>
      </div>
      <div className="flex justify-end gap-4">
        <ButtonCustom variant="outline" onClick={onClose}>No</ButtonCustom>
        <ButtonCustom variant="primary" onClick={onConfirm}>Yes, Cancel</ButtonCustom>
      </div>
    </div>
  </div>
);

export default CancelRequestModal;
