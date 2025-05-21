import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Package, Download } from 'lucide-react';
import { ButtonCustom } from '@/components/ui/button-custom';
import jsPDF from 'jspdf';

const OrderSuccess = () => {
  // Generate a random order ID
  const [orderId, setOrderId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [orderDetails, setOrderDetails] = useState<any>(null);

  useEffect(() => {
    // Get user email and order details if logged in
    const userData = localStorage.getItem('userData');
    const orderData = localStorage.getItem('lastOrder');

    
    if (userData) {
      const parsedData = JSON.parse(userData);
      setUserEmail(parsedData.email);
    }
    
    if (orderData) {
      const parsed = JSON.parse(orderData);
      setOrderDetails(parsed);
      setOrderId(parsed?.order?.order_id?.toString() ?? null);
    }

    // Dispatch storage event to ensure cart is updated across tabs
    window.dispatchEvent(new Event('storage'));
  }, []);

  const downloadBackendPDF = () => {
    console.log("order details", orderDetails);
    if (!orderDetails?.invoiceBase64) {
      alert('No invoice found.');
      return;
    }

    const link = document.createElement('a');
    link.href = `data:application/pdf;base64,${orderDetails.invoiceBase64}`;
    link.download = `DriftMood-Order-${orderDetails.order?.order_id ?? 'Invoice'}.pdf`;
    document.body.appendChild(link); // ← Firefox needs it in the DOM
    link.click();
    link.remove();
  };


  return (
    <>
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto text-center"
        >
          <div className="inline-flex items-center justify-center p-4 bg-green-100 rounded-full mb-6">
            <CheckCircle size={60} className="text-green-600" />
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold text-coffee-green mb-4">
            Order Successfully Placed!
          </h1>
          
          <p className="text-xl text-coffee-brown mb-2">
            Thank you for your purchase
          </p>
          
          <p className="text-coffee-brown mb-8">
            {userEmail ? 
              `We've sent a confirmation and receipt to ${userEmail}.` :
              `We've sent a confirmation and receipt to your email address.`
            }
          </p>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-coffee-green/10 mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Package size={24} className="text-coffee-green" />
              <h2 className="text-xl font-semibold text-coffee-green">Order Details</h2>
            </div>
            
            <p className="text-coffee-brown mb-1">Order ID: <span className="font-medium">{orderId ?? '—'}</span></p>
            <p className="text-coffee-brown">Estimated Delivery: <span className="font-medium">3-5 business days</span></p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <ButtonCustom asChild>
              <Link to="/products">Continue Shopping</Link>
            </ButtonCustom>
            
            <ButtonCustom
              variant="outline"
              onClick={downloadBackendPDF}
              className="flex items-center gap-2"
            >
              <Download size={18} />
              Download Receipt
            </ButtonCustom>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default OrderSuccess;