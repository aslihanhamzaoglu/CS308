import React, { useState, useMemo, useEffect } from 'react';
import { ShoppingCart, User, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import ProductCard from '@/components/ProductCard';
import ProductFilters from '@/components/ProductFilters';
import FilterSidebar from '@/components/FilterSidebar';
import { getCustomerProducts } from '@/api/productApi';
import { getAllCategories } from '@/api/categoryApi';
import { getRatingsByProduct } from '@/api/rateApi';
import Logo from '@/components/Logo';
import { Link } from 'react-router-dom';
import { useSearchParams } from 'react-router-dom';
import { useSearch } from '@/contexts/SearchContext';


interface Category {
  id: number;
  name: string;
}

const ProductIndex = () => {
  
  const { searchTerm, setSearchTerm } = useSearch();
  
  const [searchParams] = useSearchParams();
  const initialCategory = searchParams.get('category');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(
  initialCategory ? parseInt(initialCategory, 10) : null
);



  const [sortOption, setSortOption] = useState('popularity');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [selectedRoast, setSelectedRoast] = useState<string | null>(null);
  const [selectedOrigin, setSelectedOrigin] = useState<string | null>(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [productRatings, setProductRatings] = useState<Record<number, number>>({});
  const [topThreeProductIds, setTopThreeProductIds] = useState<number[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch categories first
        const categoriesResponse = await getAllCategories();
        setCategories(categoriesResponse);

        // Fetch products - using getCustomerProducts to only get products with prices set
        const productsResponse = await getCustomerProducts();
        console.log('Raw products data from backend:', productsResponse);
        
        // Handle different response formats
        let productsData = productsResponse || [];

        // Transform the data to match the expected structure
        const transformedProducts = productsData.map(product => ({
          ...product,
          productId: product.id || product.productId,
          picture: product.imageUrl || product.picture,
          stock: product.inStock || product.stock,
          categoryId: product.category_id || product.categoryId,
          price: Number(product.price) || 0,
          rating: Number(product.rating) || 0,
          numReviews: Number(product.numReviews) || 0,
          popularity: Number(product.popularity) || 0,
          categoryType: categoriesResponse.find(cat => cat.id === (product.category_id || product.categoryId))?.name || "Unknown Category"
        }));

        console.log('Transformed products:', transformedProducts);
        
        // Calculate top 3 products by popularity
        const sortedByPopularity = [...transformedProducts].sort((a, b) => b.popularity - a.popularity);
        const topThree = sortedByPopularity.slice(0, 3).map(p => p.productId);
        setTopThreeProductIds(topThree);
        
        setProducts(transformedProducts);

        // Fetch ratings for all products
        const ratingsPromises = transformedProducts.map(product => 
          getRatingsByProduct(product.productId)
            .then(response => {
              const ratings = Array.isArray(response.ratings)
                ? response.ratings.map(r => Number(r.rate))
                : [];
              const avgRating = ratings.length > 0
                ? ratings.reduce((sum, val) => sum + val, 0) / ratings.length
                : 0;
              return [product.productId, avgRating];
            })
            .catch(() => [product.productId, 0])
        );

        const ratingsResults = await Promise.all(ratingsPromises);
        const ratingsMap = Object.fromEntries(ratingsResults);
        setProductRatings(ratingsMap);

      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  // Get unique categories from categories state
  const uniqueCategories = useMemo(() => {
    return categories.map(category => ({
      id: category.id,
      name: category.name
    }));
  }, [categories]);
  
  // Calculate min and max prices from products
  const { minPrice, maxPrice } = useMemo(() => {
    const prices = products.map(product => product.price);
    return {
      minPrice: Math.floor(Math.min(...prices)),
      maxPrice: Math.ceil(Math.max(...prices))
    };
  }, [products]);
  
  useEffect(() => {
    if (minPrice !== Infinity && maxPrice !== -Infinity) {
      setPriceRange([minPrice, maxPrice]);
    }
  }, [minPrice, maxPrice]);
  
  const [priceRange, setPriceRange] = useState<[number, number]>([minPrice, maxPrice]);
  
  // Get unique coffee origins
  const coffeeOrigins = useMemo(() => {
    return Array.from(new Set(products
      .filter(product => product.categoryId === 1) // Assuming 1 is the ID for Coffee Beans
      .map(product => product.origin)));
  }, [products]);
  
  // Filter products based on search, category, price, and availability
  const filteredproducts = useMemo(() => {
    console.log('Current products state:', products);
    let filtered = [...products];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply category filter
    if (selectedCategory) {
      filtered = filtered.filter(product => product.categoryId === selectedCategory);
    }

    // Apply price range filter
    if (priceRange && priceRange.length === 2) {
       const [min, max] = priceRange;
        filtered = filtered.filter(product => 
        product.price >= min && product.price <= max
      );
    }

    // Apply roast level filter
    if (selectedRoast && selectedCategory === 1) {
      filtered = filtered.filter(product => product.roastLevel === selectedRoast);
    }

    // Apply origin filter
    if (selectedOrigin && selectedCategory === 1) {
      filtered = filtered.filter(product => product.origin === selectedOrigin);
    }

    // Apply stock filter
    if (inStockOnly) {
      filtered = filtered.filter(product => product.stock);
    }

    console.log('Filtered products:', filtered);
    return filtered;
  }, [products, searchTerm, selectedCategory, selectedRoast, selectedOrigin, inStockOnly, priceRange]);


  
  // Sort products
  const sortedproducts = useMemo(() => {
    console.log('Filtered products before sorting:', filteredproducts);
    let filtered = [...filteredproducts];

    // Apply sorting
    switch (sortOption) {
      case 'priceLow':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'priceHigh':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filtered.sort((a, b) => {
          const ratingA = productRatings[a.productId] || 0;
          const ratingB = productRatings[b.productId] || 0;
          return ratingB - ratingA;
        });
        break;
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default: // popularity
        filtered.sort((a, b) => b.popularity - a.popularity);
    }

    console.log('Sorted products:', filtered);
    return filtered;
  }, [filteredproducts, sortOption, productRatings]);

  useEffect(() => {
    console.log('Products state updated:', products);
  }, [products]);

  return (
    <div className="min-h-screen bg-driftmood-cream">
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <ProductFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            sortOption={sortOption}
            setSortOption={setSortOption}
          />
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar with filters */}
          <div className="md:w-1/4 lg:w-1/5">
            <FilterSidebar
              categories={categories}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
              priceRange={priceRange}
              onPriceRangeChange={setPriceRange}
              inStockOnly={inStockOnly}
              onInStockChange={setInStockOnly}
              minPrice={minPrice}
              maxPrice={maxPrice}
              selectedRoast={selectedRoast}
              onRoastChange={setSelectedRoast}
              selectedOrigin={selectedOrigin}
              onOriginChange={setSelectedOrigin}
              coffeeOrigins={coffeeOrigins}
            />
          </div>
          
          {/* Product grid */}
          <div className="md:w-3/4 lg:w-4/5">
            {sortedproducts.length === 0 ? (
              <div className="bg-white border border-driftmood-lightlime rounded-xl p-8 text-center">
                <h3 className="font-serif text-xl font-medium text-driftmood-dark mb-2">
                  No products found
                </h3>
                <p className="text-driftmood-brown mb-4">
                  We couldn't find any products matching your search criteria.
                </p>
                <button
                  className="btn-secondary"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory(null);
                    setPriceRange([minPrice, maxPrice]);
                    setInStockOnly(false);
                    setSortOption('popularity');
                    setSelectedRoast(null);
                    setSelectedOrigin(null);
                  }}
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {sortedproducts.map((product) => (
                  <ProductCard 
                    key={product.productId} 
                    product={product} 
                    isTopThree={topThreeProductIds.includes(product.productId)}
                    
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProductIndex;