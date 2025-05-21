
export interface Product {
  id: number;
  name: string;
  model?: string;
  serialNumber?: string;
  description: string;
  quantity: number;
  price: number;
  warranty?: {
    status: boolean;
    expiryDate?: Date;
    details?: string;
  };
  distributor: {
    name: string;
    contactInfo?: string;
  };
  category: string;
  imageUrl: string;
  popularity?: number; // for sorting products
  createdAt: Date;
  updatedAt: Date;
  inStock: boolean;
}

export type ProductCategory = 
  | 'coffee-beans'
  | 'brewing-equipment'
  | 'accessories'
  | 'gifts'
  | 'subscriptions';

export interface ProductFilterOptions {
  category?: ProductCategory;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  sortBy?: 'price' | 'popularity' | 'newest';
  sortDirection?: 'asc' | 'desc';
  searchTerm?: string;
}
