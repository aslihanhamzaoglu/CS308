import { useState, useEffect } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ButtonCustom } from '@/components/ui/button-custom';
import { CreditCard, Mail, Map, User } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { getUserProfile } from '@/api/userApi';
import { getAddressInfo, updateAddress, updateDeliveryAddress, getLegalName, updateLegalName } from '@/api/customerInfoApi';
import { createOrder } from '@/api/orderApi';
import { toast } from 'sonner';

/* ---------------- validation ---------------- */

const checkoutFormSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  legalName: z.string().min(2, 'Legal name is required for delivery'),
  email: z.string().email('Valid email is required'),
  address: z.string().min(1, 'Shipping address is required'),
  cardNumber: z.string().regex(/^\d{16}$/, 'Card number must be 16 digits'),
  cardExpiry: z.string().regex(/^\d{2}\/\d{2}$/, 'Expiry date must be in MM/YY format'),
  cardCvc: z.string().regex(/^\d{3,4}$/, 'CVC must be 3 or 4 digits'),
  specialInstructions: z.string().optional(),
});

type CheckoutFormValues = z.infer<typeof checkoutFormSchema>;

interface CheckoutFormProps {
  /** Optional callback – parent can intercept successful checkout   */
  onSubmit?: (data: CheckoutFormValues) => Promise<void> | void;
  /** Spinner flag sent from parent; falls back to local state        */
  isProcessing?: boolean;
}

const sanitizeAddress = (address: string) => {
  // Decode any encoded characters first to prevent double encoding
  const decodedAddress = decodeURIComponent(address);
  // Remove any potentially problematic characters but keep Turkish characters
  return decodedAddress.replace(/[^\p{L}\p{N}\s.,#-]/gu, '');
};

const CheckoutForm = ({ onSubmit, isProcessing = false }: CheckoutFormProps) => {
  const [isAddressExpanded, setIsAddressExpanded] = useState(false);
  const [userName, setUserName] = useState('');
  const [localProcessing, setLocalProcessing] = useState(false);
  const [originalAddress, setOriginalAddress] = useState('');
  const [hasAddressChanged, setHasAddressChanged] = useState(false);

  const isLoggedIn = !!localStorage.getItem('token');
  const navigate = useNavigate();

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      fullName: '',
      legalName: '',
      email: '',
      address: '',
      cardNumber: '',
      cardExpiry: '',
      cardCvc: '',
      specialInstructions: '',
    },
  });

  /* ------------ pre‑fill user & address data ------------- */
  useEffect(() => {
    const fetchUserData = async () => {
      if (!isLoggedIn) return;

      try {
        const token = localStorage.getItem('token')!;
        const user = await getUserProfile(token);
        form.setValue('fullName', user.name ?? '');
        form.setValue('email', user.email ?? '');
        setUserName(user.name ?? '');

        // Fetch legal name
        const legalNameResponse = await getLegalName(token);
        form.setValue('legalName', legalNameResponse?.legal_name ?? '');

        const addressData = await getAddressInfo(token);
        const info = addressData?.adressInfo ?? {};

        // Sanitize addresses before displaying
        const addressToShow = sanitizeAddress(info.delivery_address || info.address || '');
        form.setValue('address', addressToShow);
        setOriginalAddress(sanitizeAddress(info.address || '')); 

        if (info.address) {
          setIsAddressExpanded(true);
        }
      } catch (err) {
        console.error('Prefill failed:', err);
      }
    };

    fetchUserData();
  }, [isLoggedIn, form]);

  // Watch for address changes
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'address') {
        setHasAddressChanged(value.address !== originalAddress);
      }
    });
    return () => subscription.unsubscribe();
  }, [form.watch, originalAddress]);

  /* ---------------- actual submit ----------------- */
  const handleSubmit = async (values: CheckoutFormValues) => {
    if (!isLoggedIn) {
      navigate('/login?returnUrl=/checkout');
      return;
    }

    if (!values.address) {
      toast.error('Please provide a shipping address');
      return;
    }

    setLocalProcessing(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error("Token not found");

      // Update legal name
      await updateLegalName(token, values.legalName);

      // Sanitize address before sending
      const sanitizedAddress = sanitizeAddress(values.address);

      if (!originalAddress) {
        await updateAddress(token, sanitizedAddress);
        await updateDeliveryAddress(token, sanitizedAddress);
      } else if (!hasAddressChanged) {
        await updateDeliveryAddress(token, originalAddress);
      } else {
        await updateDeliveryAddress(token, sanitizedAddress);
      }

      // Create order with legal name
      const orderResponse = await createOrder(token);
      console.log("api response", orderResponse);

      localStorage.setItem('lastOrder', JSON.stringify({
        ...orderResponse,
        legalName: values.legalName // Store legal name for invoice
      }));

      if (onSubmit) await onSubmit({
        ...values,
        address: sanitizedAddress
      });

      navigate('/order-success');
    } catch (err) {
      console.error('Checkout failed:', err);
      toast.error('Failed to process order. Please try again.');
    } finally {
      setLocalProcessing(false);
    }
  };

  /* ================== UI =================== */
  return (
    <div className="bg-white p-6 rounded-lg border border-coffee-green/10 shadow-sm">
      <Form {...form}>
        {/* standard shadcn pattern */}
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">

          {/* ---------- Contact info ---------- */}
          <section className="space-y-4">
            <h2 className="text-xl font-medium text-coffee-green flex items-center gap-2">
              <User size={20} />
              Contact Information
              {!isLoggedIn && (
                <span className="text-sm font-normal ml-2">
                  Already have an account?&nbsp;
                  <Link to="/login?returnUrl=/checkout" className="underline">Sign in</Link>
                </span>
              )}
            </h2>

            {isLoggedIn
              ? (
                <>
                  <p className="text-coffee-brown">Continue your order, {userName}</p>
                  <div className="mt-4">
                    <FormField
                      control={form.control}
                      name="legalName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Legal name (for delivery)</FormLabel>
                          <FormControl><Input {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </>
              )
              : (
                <>
                  {/* Full name & e‑mail shown only when guest */}
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full name</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="legalName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Legal name (for delivery)</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}
          </section>

          {/* ---------- Address ---------- */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-medium text-coffee-green flex items-center gap-2">
                <Map size={20} /> Shipping Address
              </h2>
              {originalAddress && (
                <button
                  type="button"
                  className="text-sm underline"
                  onClick={() => {
                    if (!isAddressExpanded) {
                      form.setValue('address', originalAddress);
                      setHasAddressChanged(false);
                    }
                    setIsAddressExpanded((v) => !v);
                  }}
                >
                  {isAddressExpanded ? 'Use Default Address' : 'Edit Delivery Address'}
                </button>
              )}
            </div>

            {(isAddressExpanded || !originalAddress) && (
              <div className="space-y-4 animate-in fade-in">
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{originalAddress ? 'Delivery Address' : 'Address'}</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="Enter your shipping address"
                          onChange={(e) => {
                            field.onChange(e);
                            setHasAddressChanged(e.target.value !== originalAddress);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}
            
            {!isAddressExpanded && originalAddress && (
              <p className="text-sm text-coffee-brown">
                Delivering to: {form.getValues('address')}
              </p>
            )}
          </section>

          {/* ---------- Payment ---------- */}
          <section className="space-y-4">
            <h2 className="text-xl font-medium text-coffee-green flex items-center gap-2">
              <CreditCard size={20} /> Payment Details
            </h2>

            {/* Card number */}
            <FormField
              control={form.control}
              name="cardNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Card Number</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="1234 5678 9012 3456"
                      maxLength={16}
                      onChange={(e) => field.onChange(e.target.value.replace(/\D/g, ''))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Expiry & CVC */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="cardExpiry"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expiry (MM/YY)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="MM/YY"
                        maxLength={5}
                        onChange={(e) => {
                          let v = e.target.value.replace(/\D/g, '');
                          if (v.length > 2) v = `${v.slice(0, 2)}/${v.slice(2, 4)}`;
                          field.onChange(v);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="cardCvc"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CVC</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="123"
                        maxLength={4}
                        onChange={(e) => field.onChange(e.target.value.replace(/\D/g, ''))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </section>

          {/* ---------- Special instructions ---------- */}
          <section className="space-y-4">
            <h2 className="text-xl font-medium text-coffee-green flex items-center gap-2">
              <Mail size={20} /> Special Instructions
            </h2>
            <FormField
              control={form.control}
              name="specialInstructions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (optional)</FormLabel>
                  <FormControl><Textarea {...field} placeholder="…" /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </section>

          {/* ---------- Submit ---------- */}
          <ButtonCustom
            type="submit"
            disabled={isProcessing || localProcessing}
            className="w-full text-lg mt-6"
          >
            {(isProcessing || localProcessing) ? 'Processing…' : 'Place Order'}
          </ButtonCustom>
        </form>
      </Form>
    </div>
  );
};

export default CheckoutForm;
