import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { getAddressInfo, updateAddress, updateLegalName, getLegalName } from '@/api/customerInfoApi';
import { getUserProfile, changeName } from '@/api/userApi';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserRound, Package, ShoppingBag, Star, Settings, LogOut } from 'lucide-react';

const AccountSettings = () => {
  const [name, setName] = useState('');
  const [fullName, setFullName] = useState('');

  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInfo = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
  
      try {
        const user = await getUserProfile(token);
        setName(user?.name || '');
        setEmail(user?.email || '');
        const response  = await getLegalName(token);
        setFullName(response?.legal_name ?? '');
  
        const addressData = await getAddressInfo(token);
        setAddress(addressData?.adressInfo?.address || '');
      } catch (err) {
        console.error('Failed to load profile or address info:', err);
      }
    };
  
    fetchInfo();
  }, []);
  const handleNameChange = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      await changeName(token, name);
      alert('Name updated successfully!');
    } catch {
      alert('Failed to update name.');
    } finally {
      setLoading(false);
    }
  };

    const handleFullNameChange = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      await updateLegalName(token, fullName);
      alert('Name updated successfully!');
    } catch {
      alert('Failed to update name.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleAddressUpdate = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      await updateAddress(token, address);
      alert('Address updated successfully!');
    } catch {
      alert('Failed to update address.');
    } finally {
      setLoading(false);
    }
  };
  

  const handleSignOut = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
      {/* Sidebar */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="bg-white shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex flex-col items-center">
              <div className="h-20 w-20 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                <UserRound size={48} className="text-black" />
              </div>
              <CardTitle className="text-2xl font-bold text-black mb-1">{name || 'User'}</CardTitle>
              <p className="text-base text-gray-600">{email || 'Email not found'}</p>
            </div>
          </CardHeader>
          <CardContent>
            <nav className="space-y-2 mt-4">
              <Link to="/profile" className="flex items-center p-3 rounded-md hover:bg-gray-100 text-black hover:text-coffee-green transition">
                <UserRound size={18} className="mr-2" /> Profile
              </Link>
              <Link to="/past-orders" className="flex items-center p-3 rounded-md hover:bg-gray-100 text-black hover:text-coffee-green transition">
                <Package size={18} className="mr-2" /> Past Orders
              </Link>
              <Link to="/cart" className="flex items-center p-3 rounded-md hover:bg-gray-100 text-black hover:text-coffee-green transition">
                <ShoppingBag size={18} className="mr-2" /> Cart
              </Link>
              <Link to="/my-reviews" className="flex items-center p-3 rounded-md hover:bg-gray-100 text-black hover:text-coffee-green transition">
                <Star size={18} className="mr-2" /> My Reviews
              </Link>
              <Link to="/account" className="flex items-center p-3 rounded-md hover:bg-gray-100 text-black hover:text-coffee-green transition font-semibold">
                <Settings size={18} className="mr-2" /> Account Settings
              </Link>
              <button
                onClick={handleSignOut}
                className="flex items-center p-3 rounded-md hover:bg-gray-100 text-black hover:text-coffee-green transition w-full text-left"
              >
                <LogOut size={18} className="mr-2" /> Sign Out
              </button>
            </nav>
          </CardContent>
        </Card>
      </motion.div>

      {/* Account Info */}
      <motion.div
        className="md:col-span-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-3xl font-bold text-black mb-6">Account Details</h2>

          <div className="space-y-6">

            {/* Email (read-only) */}
            <div>
              <label className="block text-sm font-semibold mb-1 text-gray-700">Email</label>
              <Input
                value={email}
                disabled
                className="bg-gray-100 cursor-not-allowed"
                placeholder="Email"
              />
            </div>
            {/* Name */}
            <div>
              <label className="block text-sm font-semibold mb-1 text-gray-700">Username</label>
              <Input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Username"
              />
              <div className="mt-2">
                <Button onClick={handleNameChange} disabled={loading}>
                {loading ? 'Saving...' : 'Save Username'}
                </Button>
            </div>
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-sm font-semibold mb-1 text-gray-700">Full Name</label>
              <Input
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="Full Name"
              />
              <div className="mt-2">
                <Button onClick={handleFullNameChange} disabled={loading}>
                {loading ? 'Saving...' : 'Save Name'}
                </Button>
            </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-semibold mb-1 text-gray-700">Address</label>
              <Input
                value={address}
                onChange={e => setAddress(e.target.value)}
                placeholder="Address"
              />
         <div className="mt-2">
            <Button onClick={handleAddressUpdate} disabled={loading}>
            {loading ? 'Saving...' : 'Save Address'}
            </Button>
        </div>
        </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AccountSettings;
