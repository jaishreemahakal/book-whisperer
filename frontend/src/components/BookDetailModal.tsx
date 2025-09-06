import { useState, useEffect } from 'react';
import { Star, ShoppingCart, ExternalLink, Heart, Share2, Loader2 } from 'lucide-react';
import { Book } from '@/types/book';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/components/ui/use-toast';

interface BookDetailModalProps {
  bookId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export const BookDetailModal = ({ bookId, isOpen, onClose }: BookDetailModalProps) => {
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const fetchBookDetails = async () => {
      if (!bookId || !isOpen) {
        setBook(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      setImageError(false);
      setBook(null);
      try {
        const response = await fetch(`${import.meta.env.VITE_APP_API_URL}/books/${bookId}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const responseData = await response.json();
        const data: Book = responseData.data;
        setBook(data);
      } catch (e: any) {
        console.error("Failed to fetch book details:", e);
        setError("Failed to load book details. Please try again.");
        toast({
          title: "Error",
          description: "Failed to load book details. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchBookDetails();
  }, [bookId, isOpen]);

  if (!isOpen) return null;

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-literary-brown" />
          <span className="ml-2 text-literary-brown">Loading book details...</span>
        </DialogContent>
      </Dialog>
    );
  }

  if (error) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl text-literary-brown">Error</DialogTitle>
          </DialogHeader>
          <div className="text-center text-red-500">{error}</div>
          <Button onClick={onClose}>Close</Button>
        </DialogContent>
      </Dialog>
    );
  }

  if (!book) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl text-literary-brown">Book Not Found</DialogTitle>
          </DialogHeader>
          <div className="text-center text-muted-foreground">No book data available.</div>
          <Button onClick={onClose}>Close</Button>
        </DialogContent>
      </Dialog>
    );
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-5 h-5 ${
          i < rating ? 'fill-literary-gold text-literary-gold' : 'text-muted-foreground'
        }`}
      />
    ));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl text-literary-brown">
            {book.title}
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="relative">
              <img
                src={imageError ? '/placeholder.svg' : book.thumbnailImageUrl}
                alt={book.title}
                className="w-full max-w-md mx-auto rounded-lg shadow-book"
                onError={() => setImageError(true)}
              />
              <div className="absolute top-4 right-4">
                <Badge 
                  variant={book.stockAvailability === 'In stock' ? 'default' : 'destructive'}
                  className="bg-literary-brown/90 text-literary-cream"
                >
                  {book.stockAvailability}
                </Badge>
              </div>
            </div>
            
            <div className="flex gap-2 justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsFavorite(!isFavorite)}
                className={isFavorite ? 'text-red-500 border-red-500' : ''}
              >
                <Heart className={`w-4 h-4 mr-1 ${isFavorite ? 'fill-current' : ''}`} />
                {isFavorite ? 'Favorited' : 'Add to Favorites'}
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="w-4 h-4 mr-1" />
                Share
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            {book.author && (
              <div>
                <h3 className="text-lg font-medium text-literary-brown">
                  by {book.author}
                </h3>
              </div>
            )}
            
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                {renderStars(book.rating)}
              </div>
              <span className="text-sm text-muted-foreground">
                ({book.rating}/5 stars)
              </span>
            </div>

            {book.category && (
              <div>
                <Badge variant="secondary" className="text-sm">
                  {book.category}
                </Badge>
              </div>
            )}
            
            <div className="flex items-center gap-2">
              <span className="text-3xl font-bold text-literary-brown">
                £{book.price.toFixed(2)}
              </span>
            </div>
            
            <Separator />
            
            {book.description && (
              <div>
                <h4 className="font-semibold text-literary-brown mb-2">Description</h4>
                <p className="text-muted-foreground leading-relaxed">
                  {book.description}
                </p>
              </div>
            )}
            
            <Separator />

            <div className="space-y-3">
              <Button 
                className="w-full bg-literary-brown hover:bg-literary-navy text-literary-cream"
                size="lg"
                disabled={book.stockAvailability === 'Out of stock'}
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                {book.stockAvailability === 'In stock' ? 'Add to Cart' : 'Out of Stock'}
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => window.open(book.bookDetailPageUrl, '_blank')}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                View Original Page
              </Button>
            </div>

            <div className="text-sm text-muted-foreground space-y-1">
              <p><strong>Availability:</strong> {book.stockAvailability}</p>
              <p><strong>Book ID:</strong> #{book._id || book.id}</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};