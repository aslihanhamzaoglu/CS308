import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SearchProvider } from "./contexts/SearchContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import NotFound from "./pages/NotFound";
import Cart from "./pages/Cart";
import ProductIndex from "./pages/ProductIndex"; 
import OrderSuccess from "./pages/OrderSuccess";
import About from './pages/About';
import Contacts from './pages/Contact';
import Profile from './pages/Profile';
import PastOrders from './pages/PastOrders';
import Checkout from './pages/Checkout';
import "./styles/colors.css";
import "./styles/global.css";
import ProductDetailPage from "./pages/ProductDetailPage";
import AccountSettings from './pages/AccountSettings'; 
import MyReviews from './pages/MyReviews';

import WishlistPage from './pages/WishlistPage';
import ProductManagerPage from './pages/ProductManagerPage';
import SalesManagerPage from "./pages/SalesManagerPage";


const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner />
      <SearchProvider>
        <BrowserRouter>
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/wishlist" element={<WishlistPage />} />
              <Route path="/products" element={<ProductIndex />} />
              <Route path="/product/:id" element={<ProductDetailPage />} />
              <Route path="/order-success" element={<OrderSuccess />} />
              <Route path="/about" element={<About />}/>
              <Route path="/past-orders" element={<PastOrders />}/>
              <Route path="/checkout" element={<Checkout />}/>
              <Route path="/contact" element={<Contacts />}/>
              <Route path="/profile" element={<Profile />}/>
              <Route path="/account" element={<AccountSettings />} />
              <Route path="/my-reviews" element={<MyReviews />} />
              <Route path="/product-manager" element={<ProductManagerPage />} />
              <Route path="/sales-manager" element={<SalesManagerPage />} />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </BrowserRouter>
      </SearchProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
