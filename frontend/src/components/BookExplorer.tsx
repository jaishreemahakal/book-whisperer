import { useState, useMemo, useEffect, useCallback } from 'react';
import { Book, SearchFilters } from '@/types/book';
import { BookCard } from './BookCard';
import { SearchFiltersComponent } from './SearchFilters';
import { BookDetailModal } from './BookDetailModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, Library, TrendingUp, Bookmark, Loader2, RefreshCw } from 'lucide-react';
import heroImage from '@/assets/hero-banner.jpg';
import { toast } from '@/components/ui/use-toast';

export const BookExplorer = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<SearchFilters>({
    search: '',
    rating: null,
    priceRange: [0, 100],
    stockStatus: 'all',
    category: '',
  });
  
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const booksPerPage = 12;
  const [refreshing, setRefreshing] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalBooks: 0,
    booksPerPage: 12,
    hasNextPage: false,
    hasPrevPage: false
  });

  const fetchBooks = useCallback(async (page = currentPage, searchFilters = filters) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: booksPerPage.toString(),
      });

      if (searchFilters.search) {
        params.append('search', searchFilters.search);
      }
      if (searchFilters.category) {
        params.append('category', searchFilters.category);
      }
      if (searchFilters.rating !== null) {
        params.append('minRating', searchFilters.rating.toString());
      }
      if (searchFilters.priceRange[0] > 0) {
        params.append('minPrice', searchFilters.priceRange[0].toString());
      }
      if (searchFilters.priceRange[1] < 100) {
        params.append('maxPrice', searchFilters.priceRange[1].toString());
      }
      if (searchFilters.stockStatus === 'in-stock') {
        params.append('stockStatus', 'in-stock');
      } else if (searchFilters.stockStatus === 'out-of-stock') {
        params.append('stockStatus', 'out-of-stock');
      }

      const response = await fetch(`${import.meta.env.VITE_APP_API_URL}/books?${params}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const responseData = await response.json();
      const data: Book[] = responseData.data;
      setBooks(data);
      setPagination(responseData.pagination);
    } catch (e: any) {
      console.error("Failed to fetch books:", e);
      setError("Failed to load books. Please try again.");
      toast({
        title: "Error",
        description: "Failed to load books. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [booksPerPage]); 

  useEffect(() => {
    fetchBooks(currentPage, filters);
  }, [fetchBooks, currentPage, filters]);

  const handleRefreshScraper = async () => {
    setRefreshing(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_APP_API_URL}/refresh`, {
        method: 'POST',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      toast({
        title: "Scraper Refreshed",
        description: "Book data has been refreshed successfully.",
        variant: "default",
      });
      fetchBooks(); 
    } catch (e: any) {
      console.error("Failed to refresh scraper:", e);
      toast({
        title: "Error",
        description: `Failed to refresh scraper: ${e.message}`,
        variant: "destructive",
      });
    } finally {
      setRefreshing(false);
    }
  };

  const categories = useMemo(() => {
    const cats = books.map(book => book.category).filter(Boolean) as string[];
    return [...new Set(cats)].sort();
  }, [books]);

  const currentBooks = books;

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFilterChange = (newFilters: SearchFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const statistics = useMemo(() => {
    if (pagination.totalBooks === 0) {
      return {
        totalBooks: 0,
        inStock: 0,
        avgRating: '0.0',
      };
    }
    return {
      totalBooks: pagination.totalBooks,
      inStock: books.filter(b => b.stockAvailability === 'In stock').length,
      avgRating: books.length > 0 ? (books.reduce((sum, b) => sum + b.rating, 0) / books.length).toFixed(1) : '0.0',
    };
  }, [books, pagination]);

  return (
    <div className="min-h-screen bg-background">
      <div className="relative h-96 overflow-hidden">
        <img
          src={heroImage}
          alt="Book Explorer Hero"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-literary-brown/80 to-literary-navy/60" />
        <div className="absolute inset-0 flex items-center justify-center text-center">
          <div className="max-w-4xl px-4">
            <h1 className="font-serif text-5xl md:text-6xl font-bold text-literary-cream mb-4">
              Book Explorer
            </h1>
            <p className="text-xl text-literary-cream/90 mb-8">
              Discover your next great read from our curated collection of books
            </p>
            <div className="flex justify-center gap-8 text-literary-cream">
              <div className="text-center">
                <div className="text-2xl font-bold">{statistics.totalBooks}</div>
                <div className="text-sm opacity-90">Books Available</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{statistics.inStock}</div>
                <div className="text-sm opacity-90">In Stock</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{statistics.avgRating}⭐</div>
                <div className="text-sm opacity-90">Avg Rating</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="shadow-elegant">
            <CardContent className="flex items-center p-4">
              <Library className="w-8 h-8 text-literary-brown mr-3" />
              <div>
                <div className="font-semibold text-literary-brown">Total Collection</div>
                <div className="text-2xl font-bold">{statistics.totalBooks}</div>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-elegant">
            <CardContent className="flex items-center p-4">
              <TrendingUp className="w-8 h-8 text-literary-sage mr-3" />
              <div>
                <div className="font-semibold text-literary-brown">Average Rating</div>
                <div className="text-2xl font-bold">{statistics.avgRating} / 5</div>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-elegant">
            <CardContent className="flex items-center p-4">
              <Bookmark className="w-8 h-8 text-literary-gold mr-3" />
              <div>
                <div className="font-semibold text-literary-brown">In Stock</div>
                <div className="text-2xl font-bold">{statistics.inStock}</div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end mb-4">
          <Button onClick={handleRefreshScraper} disabled={refreshing}>
            {refreshing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            {refreshing ? "Refreshing..." : "Refresh Book Data"}
          </Button>
        </div>

        <SearchFiltersComponent
          filters={filters}
          onFiltersChange={handleFilterChange}
          categories={categories}
        />

        <div className="flex justify-between items-center mb-6">
          <div className="font-medium text-literary-brown">
            {pagination.totalBooks} book{pagination.totalBooks !== 1 ? 's' : ''} found
            {pagination.totalBooks > 0 && (
              <span className="text-sm text-muted-foreground ml-2">
                (Page {pagination.currentPage} of {pagination.totalPages})
              </span>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-12 w-12 animate-spin text-literary-brown" />
            <span className="ml-4 text-literary-brown text-lg">Loading books...</span>
          </div>
        ) : error ? (
          <div className="text-center py-12 text-red-500">
            <p>{error}</p>
            <Button onClick={() => window.location.reload()} className="mt-4">Retry</Button>
          </div>
        ) : currentBooks.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            {currentBooks.map((book, index) => (
              <BookCard
                key={book._id || book.id || index}
                book={book}
                onViewDetails={() => setSelectedBookId(book._id || book.id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Library className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-literary-brown mb-2">
              No books found
            </h3>
            <p className="text-muted-foreground">
              Try adjusting your search criteria or filters
            </p>
          </div>
        )}

        {pagination.totalPages > 1 && (
          <div className="flex justify-center items-center gap-2">
            <Button
              variant="outline"
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              disabled={!pagination.hasPrevPage}
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>
            
            {[...Array(pagination.totalPages)].map((_, i) => {
              const page = i + 1;
              if (
                page === 1 ||
                page === pagination.totalPages ||
                (page >= pagination.currentPage - 1 && page <= pagination.currentPage + 1)
              ) {
                return (
                  <Button
                    key={page}
                    variant={pagination.currentPage === page ? 'default' : 'outline'}
                    onClick={() => handlePageChange(page)}
                    className={pagination.currentPage === page ? 'bg-literary-brown hover:bg-literary-navy' : ''}
                  >
                    {page}
                  </Button>
                );
              } else if (page === pagination.currentPage - 2 || page === pagination.currentPage + 2) {
                return <span key={page} className="px-2">...</span>;
              }
              return null;
            })}
            
            <Button
              variant="outline"
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={!pagination.hasNextPage}
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      <BookDetailModal
        bookId={selectedBookId}
        isOpen={!!selectedBookId}
        onClose={() => setSelectedBookId(null)}
      />
    </div>
  );
};