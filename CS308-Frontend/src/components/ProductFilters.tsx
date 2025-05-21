
import React from 'react';
import { Search, SlidersHorizontal, ArrowDownUp } from 'lucide-react';

interface ProductFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  sortOption: string;
  setSortOption: (value: string) => void;
}

const ProductFilters: React.FC<ProductFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  sortOption,
  setSortOption,
}) => {
  return (
    <div className="bg-white border border-driftmood-lightlime rounded-xl p-4 mb-6 animate-slideUp">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-driftmood-brown" />
          </div>
          <input
            type="text"
            placeholder="Search products..."
            className="pl-10 w-full h-10 rounded-lg border border-driftmood-lightlime focus:ring-2 focus:ring-driftmood-lime focus:border-driftmood-lime outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2">
          <div className="relative">
            <select
              className="appearance-none bg-driftmood-lightlime text-driftmood-dark pl-4 pr-10 py-2 rounded-lg border border-driftmood-lightlime focus:ring-2 focus:ring-driftmood-lime focus:border-driftmood-lime outline-none"
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
            >
              <option value="popularity">Sort by popularity</option>
              <option value="priceLow">Price: Low to High</option>
              <option value="priceHigh">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
              <option value="name">Name A-Z</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <ArrowDownUp size={16} className="text-driftmood-dark" />
            </div>
          </div>
          
          <button className="btn-secondary">
            <SlidersHorizontal size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductFilters;