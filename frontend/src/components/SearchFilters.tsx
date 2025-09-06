import { useState } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { SearchFilters } from '@/types/book';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';

interface SearchFiltersProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  categories: string[];
}

export const SearchFiltersComponent = ({ filters, onFiltersChange, categories }: SearchFiltersProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const updateFilters = (updates: Partial<SearchFilters>) => {
    onFiltersChange({ ...filters, ...updates });
  };

  const clearFilters = () => {
    onFiltersChange({
      search: '',
      rating: null,
      priceRange: [0, 100],
      stockStatus: 'all',
      category: '',
    });
  };

  const hasActiveFilters = filters.search || filters.rating !== null || 
    filters.priceRange[0] > 0 || filters.priceRange[1] < 100 || 
    filters.stockStatus !== 'all' || filters.category;

  return (
    <Card className="mb-6 shadow-elegant">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="font-serif text-literary-brown flex items-center gap-2">
            <Search className="w-5 h-5" />
            Search & Filter Books
          </CardTitle>
          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="w-4 h-4 mr-1" />
                Clear
              </Button>
            )}
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <Filter className="w-4 h-4 mr-1" />
              {isExpanded ? 'Less' : 'More'}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search books by title..."
            value={filters.search}
            onChange={(e) => updateFilters({ search: e.target.value })}
            className="pl-10"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge 
            variant={filters.stockStatus === 'in-stock' ? 'default' : 'outline'}
            className="cursor-pointer hover:bg-literary-brown hover:text-literary-cream"
            onClick={() => updateFilters({ 
              stockStatus: filters.stockStatus === 'in-stock' ? 'all' : 'in-stock' 
            })}
          >
            In Stock Only
          </Badge>
          <Badge 
            variant={filters.rating === 4 ? 'default' : 'outline'}
            className="cursor-pointer hover:bg-literary-brown hover:text-literary-cream"
            onClick={() => updateFilters({ 
              rating: filters.rating === 4 ? null : 4 
            })}
          >
            4+ Stars
          </Badge>
          <Badge 
            variant={filters.priceRange[1] === 30 ? 'default' : 'outline'}
            className="cursor-pointer hover:bg-literary-brown hover:text-literary-cream"
            onClick={() => updateFilters({ 
              priceRange: filters.priceRange[1] === 30 ? [0, 100] : [0, 30]
            })}
          >
            Under £30
          </Badge>
        </div>

        {isExpanded && (
          <div className="space-y-4 pt-4 border-t">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-literary-brown mb-2 block">
                  Category
                </label>
                <Select 
                  value={filters.category} 
                  onValueChange={(value) => updateFilters({ category: value === 'all-categories' ? '' : value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-categories">All categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-literary-brown mb-2 block">
                  Availability
                </label>
                <Select 
                  value={filters.stockStatus} 
                  onValueChange={(value: any) => updateFilters({ stockStatus: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All books</SelectItem>
                    <SelectItem value="in-stock">In stock only</SelectItem>
                    <SelectItem value="out-of-stock">Out of stock</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-literary-brown mb-2 block">
                  Minimum Rating
                </label>
                <Select 
                  value={filters.rating?.toString() || ''} 
                  onValueChange={(value) => updateFilters({ rating: value === 'any-rating' ? null : parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Any rating" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any-rating">Any rating</SelectItem>
                    <SelectItem value="1">1+ stars</SelectItem>
                    <SelectItem value="2">2+ stars</SelectItem>
                    <SelectItem value="3">3+ stars</SelectItem>
                    <SelectItem value="4">4+ stars</SelectItem>
                    <SelectItem value="5">5 stars</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-literary-brown mb-3 block">
                Price Range: £{filters.priceRange[0]} - £{filters.priceRange[1]}
              </label>
              <Slider
                value={filters.priceRange}
                onValueChange={(value) => updateFilters({ priceRange: value as [number, number] })}
                max={100}
                min={0}
                step={5}
                className="w-full"
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};