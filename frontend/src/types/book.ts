export interface Book {
  id: string;
  title: string;
  price: number;
  stockAvailability: 'In stock' | 'Out of stock';
  rating: number;
  bookDetailPageUrl: string;
  thumbnailImageUrl: string;
  description?: string;
  category?: string;
  author?: string;
}

export interface SearchFilters {
  search: string;
  rating: number | null;
  priceRange: [number, number];
  stockStatus: 'all' | 'in-stock' | 'out-of-stock';
  category: string;
}