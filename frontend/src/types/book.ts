export interface Book {
  _id: string;
  id?: string; // For backward compatibility
  title: string;
  price: number;
  stockAvailability: 'In stock' | 'Out of stock';
  rating: number;
  bookDetailPageUrl: string;
  thumbnailImageUrl: string;
  description?: string;
  category?: string;
  author?: string;
  isbn?: string;
  scrapedAt?: string;
  lastUpdated?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SearchFilters {
  search: string;
  rating: number | null;
  priceRange: [number, number];
  stockStatus: 'all' | 'in-stock' | 'out-of-stock';
  category: string;
}