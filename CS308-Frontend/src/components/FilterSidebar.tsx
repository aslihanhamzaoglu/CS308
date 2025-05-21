import React from 'react';
import { Filter, Tag, Coffee, Coffee as CoffeeIcon, PieChart, Sliders } from 'lucide-react';

interface Category {
  id: number;
  name: string;
}

interface FilterSidebarProps {
  categories: Category[];
  selectedCategory: number | null;
  onCategoryChange: (category: number | null) => void;
  priceRange: [number, number];
  onPriceRangeChange: (range: [number, number]) => void;
  inStockOnly: boolean;
  onInStockChange: (inStock: boolean) => void;
  selectedRoast?: string | null;
  onRoastChange?: (roast: string | null) => void;
  selectedOrigin?: string | null;
  onOriginChange?: (origin: string | null) => void;
  minPrice: number;
  maxPrice: number;
  coffeeOrigins?: string[];
}


const FilterSidebar: React.FC<FilterSidebarProps> = ({
  categories,
  selectedCategory,
  onCategoryChange,
  priceRange,
  onPriceRangeChange,
  inStockOnly,
  onInStockChange,
  selectedRoast,
  onRoastChange,
  selectedOrigin,
  onOriginChange,
  minPrice,
  maxPrice,
  coffeeOrigins,
}) => {
  return (
    <div className="bg-white border border-driftmood-lightlime rounded-xl p-5 h-fit sticky top-24 max-h-[80vh] overflow-y-auto">
      <div className="mb-6">
        <h3 className="font-serif font-medium text-lg flex items-center mb-4">
          <Filter size={18} className="mr-2 text-driftmood-dark" />
          Filters
        </h3>
        <div className="border-t border-driftmood-lightlime pt-4">
          <button
            onClick={() => {
              onCategoryChange(null);
              onPriceRangeChange([minPrice, maxPrice]);
              onInStockChange(false);
              onRoastChange?.(null);
              onOriginChange?.(null);
            }}
            className="text-sm text-driftmood-brown hover:text-driftmood-dark transition-colors flex items-center mb-4"
          >
            <Sliders size={15} className="mr-2" />
            Reset All Filters
          </button>
        </div>
      </div>
      
      <div className="mb-6">
        <h4 className="font-medium text-sm flex items-center mb-3">
          <Tag size={16} className="mr-2 text-driftmood-dark" />
          Categories
        </h4>
        <div className="space-y-2">
          <button
            className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
              selectedCategory === null 
                ? 'bg-driftmood-lightlime font-medium text-driftmood-dark' 
                : 'text-driftmood-brown hover:bg-driftmood-cream'
            }`}
            onClick={() => onCategoryChange(null)}
          >
            All Products
          </button>
          
          {categories.map((category) => (
            <button
              key={category.id}
              className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                selectedCategory === category.id 
                  ? 'bg-driftmood-lightlime font-medium text-driftmood-dark' 
                  : 'text-driftmood-brown hover:bg-driftmood-cream'
              }`}
              onClick={() => onCategoryChange(category.id)}
            >
              <div className="flex items-center">
                {category.name === 'Beverages' ? (
                  <CoffeeIcon size={14} className="mr-2" />
                ) : (
                  <Coffee size={14} className="mr-2" />
                )}
                {category.name}
              </div>
            </button>
          ))}
        </div>
      </div>
      
      <div className="mb-6">
        <h4 className="font-medium text-sm flex items-center mb-3">
          <PieChart size={16} className="mr-2 text-driftmood-dark" />
          Price Range
        </h4>
        <div className="px-1">
          <div className="mb-4">
            <div className="flex justify-between text-xs text-driftmood-brown mb-1">
              <span>${priceRange[0].toFixed(2)}</span>
              <span>${priceRange[1].toFixed(2)}</span>
            </div>
            <div className="relative h-1 bg-driftmood-cream rounded-full">
              <div 
                className="absolute h-1 bg-driftmood-lime rounded-full"
                style={{
                  left: `${((priceRange[0] - minPrice) / (maxPrice - minPrice)) * 100}%`,
                  right: `${100 - ((priceRange[1] - minPrice) / (maxPrice - minPrice)) * 100}%`
                }}
              />
            </div>
          </div>
          
          <div className="flex space-x-2">
            <div className="w-1/2">
              <label htmlFor="min-price" className="text-xs text-driftmood-brown">Min</label>
              <input
                id="min-price"
                type="number"
                min={minPrice}
                max={priceRange[1]}
                value={priceRange[0]}
                onChange={(e) => {
                  const value = Number(e.target.value);
                  if (value <= priceRange[1]) {
                    onPriceRangeChange([value, priceRange[1]]);
                  }
                }}
                className="w-full border border-driftmood-lightlime rounded-md px-2 py-1 text-sm focus:ring-2 focus:ring-driftmood-lime focus:border-driftmood-lime outline-none"
              />
            </div>
            <div className="w-1/2">
              <label htmlFor="max-price" className="text-xs text-driftmood-brown">Max</label>
              <input
                id="max-price"
                type="number"
                min={priceRange[0]}
                max={maxPrice}
                value={priceRange[1]}
                onChange={(e) => {
                  const value = Number(e.target.value);
                  if (value >= priceRange[0]) {
                    onPriceRangeChange([priceRange[0], value]);
                  }
                }}
                className="w-full border border-driftmood-lightlime rounded-md px-2 py-1 text-sm focus:ring-2 focus:ring-driftmood-lime focus:border-driftmood-lime outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {selectedCategory === "Coffee Beans" && (
        <>
        <div className="mb-6">
          <h4 className="font-medium text-sm mb-3">Roast Level</h4>
          <div className="space-y-2">
            {["Light", "Medium", "Dark"].map((roast) => (
              <button
              key={roast}
              className={`w-full text-left px-3 py-1.5 rounded-md text-sm transition-colors ${
              selectedRoast === roast
                ? "bg-driftmood-lightlime font-medium text-driftmood-dark"
                : "text-driftmood-brown hover:bg-driftmood-cream"
            }`}
            onClick={() =>
              onRoastChange?.(selectedRoast === roast ? null : roast)
            }
            >
              {roast}
              </button>
            ))}
            </div>
            </div>

    <div className="mb-6">
      <h4 className="font-medium text-sm mb-3">Origin</h4>
      <div className="space-y-2">
        {coffeeOrigins?.map((origin) => (
          <button
            key={origin}
            className={`w-full text-left px-3 py-1.5 rounded-md text-sm transition-colors ${
              selectedOrigin === origin
                ? "bg-driftmood-lightlime font-medium text-driftmood-dark"
                : "text-driftmood-brown hover:bg-driftmood-cream"
            }`}
            onClick={() =>
              onOriginChange?.(selectedOrigin === origin ? null : origin)
            }
          >
            {origin}
          </button>
        ))}
      </div>
    </div>
  </>
)}
      
      <div>
        <h4 className="font-medium text-sm mb-3">Availability</h4>
        <div className="flex items-center">
          <input
            id="in-stock-only"
            type="checkbox"
            checked={inStockOnly}
            onChange={(e) => onInStockChange(e.target.checked)}
            className="h-4 w-4 rounded border-driftmood-lightlime text-driftmood-dark focus:ring-driftmood-lime"
          />
          <label htmlFor="in-stock-only" className="ml-2 text-sm text-driftmood-brown">
            In Stock Only
          </label>
        </div>
      </div>
    </div>
  );
};

export default FilterSidebar;