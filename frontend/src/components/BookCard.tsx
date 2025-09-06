import { useState } from 'react';
import { Star, ShoppingCart, Eye } from 'lucide-react';
import { Book } from '@/types/book';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface BookCardProps {
  book: Book;
  onViewDetails: (book: Book) => void;
}

export const BookCard = ({ book, onViewDetails }: BookCardProps) => {
  const [imageError, setImageError] = useState(false);
  
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? 'fill-literary-gold text-literary-gold' : 'text-muted-foreground'
        }`}
      />
    ));
  };

  return (
    <Card className="group h-full overflow-hidden bg-gradient-card shadow-elegant hover:shadow-book transition-all duration-300 hover:-translate-y-1 cursor-pointer">
      <div className="relative overflow-hidden">
        <img
          src={imageError ? '/placeholder.svg' : book.thumbnailImageUrl}
          alt={book.title}
          className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
          onError={() => setImageError(true)}
        />
        <div className="absolute top-2 right-2">
          <Badge 
            variant={book.stockAvailability === 'In stock' ? 'default' : 'destructive'}
            className="bg-literary-brown/90 text-literary-cream hover:bg-literary-brown"
          >
            {book.stockAvailability}
          </Badge>
        </div>
      </div>
      
      <CardContent className="p-4 flex flex-col flex-1">
        <div className="flex-1">
          <h3 className="font-serif font-semibold text-lg text-literary-brown line-clamp-2 mb-2 group-hover:text-literary-navy transition-colors">
            {book.title}
          </h3>
          
          {book.author && (
            <p className="text-sm text-muted-foreground mb-2">by {book.author}</p>
          )}
          
          <div className="flex items-center gap-1 mb-2">
            {renderStars(book.rating)}
            <span className="text-sm text-muted-foreground ml-1">
              ({book.rating}/5)
            </span>
          </div>
          
          {book.category && (
            <Badge variant="secondary" className="mb-3 text-xs">
              {book.category}
            </Badge>
          )}
        </div>
        
        <div className="mt-auto">
          <div className="flex items-center justify-between mb-3">
            <span className="text-2xl font-bold text-literary-brown">
              £{book.price.toFixed(2)}
            </span>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={(e) => {
                e.stopPropagation();
                onViewDetails(book);
              }}
            >
              <Eye className="w-4 h-4 mr-1" />
              View
            </Button>
            <Button 
              size="sm" 
              className="flex-1 bg-literary-brown hover:bg-literary-navy"
              disabled={book.stockAvailability === 'Out of stock'}
            >
              <ShoppingCart className="w-4 h-4 mr-1" />
              Add to Cart
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};