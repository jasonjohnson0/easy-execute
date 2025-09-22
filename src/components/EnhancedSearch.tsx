import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Calendar } from '@/components/ui/calendar';
import { Separator } from '@/components/ui/separator';
import { Search, Filter, MapPin, Percent, Calendar as CalendarIcon, X, UserPlus } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '@/hooks/useAuth';
import { useDealsCountSearch } from '@/hooks/useDealsCountSearch';

export interface SearchFilters {
  query: string;
  category: string;
  location: string;
  discountMin: number;
  discountMax: number;
  expiresBy: Date | null;
  sortBy: 'recent' | 'expiring' | 'discount' | 'distance';
}

interface EnhancedSearchProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  categories: string[];
  onShowSignUp?: () => void;
}

export function EnhancedSearch({ filters, onFiltersChange, categories, onShowSignUp }: EnhancedSearchProps) {
  const { user } = useAuth();
  const [showFilters, setShowFilters] = useState(false);
  const [discountRange, setDiscountRange] = useState([filters.discountMin, filters.discountMax]);
  
  // Get search counts for unauthenticated users
  const { filteredCount, hasFilters, isAuthenticated } = useDealsCountSearch(filters);

  const updateFilters = (updates: Partial<SearchFilters>) => {
    onFiltersChange({ ...filters, ...updates });
  };

  const clearFilters = () => {
    onFiltersChange({
      query: '',
      category: 'All Categories',
      location: '',
      discountMin: 0,
      discountMax: 100,
      expiresBy: null,
      sortBy: 'recent'
    });
    setDiscountRange([0, 100]);
  };

  const activeFiltersCount = [
    filters.query,
    filters.category !== 'All Categories' ? filters.category : null,
    filters.location,
    filters.discountMin > 0 || filters.discountMax < 100 ? 'discount' : null,
    filters.expiresBy,
  ].filter(Boolean).length;

  return (
    <div className="space-y-4">
      {/* Main Search Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search deals, businesses, or locations..."
            value={filters.query}
            onChange={(e) => updateFilters({ query: e.target.value })}
            className="pl-10"
          />
        </div>
        
        <Popover open={showFilters} onOpenChange={setShowFilters}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Filter className="w-4 h-4" />
              Filters
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 w-5 rounded-full p-0 text-xs">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-96 p-6" align="end">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Filter Deals</h3>
                {activeFiltersCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    Clear All
                  </Button>
                )}
              </div>

              {/* Category Filter */}
              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={filters.category}
                  onValueChange={(value) => updateFilters({ category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Location Filter */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Location
                </Label>
                <Input
                  placeholder="Enter city, address, or ZIP code"
                  value={filters.location}
                  onChange={(e) => updateFilters({ location: e.target.value })}
                />
              </div>

              <Separator />

              {/* Discount Range */}
              <div className="space-y-3">
                <Label className="flex items-center gap-2">
                  <Percent className="w-4 h-4" />
                  Discount Range
                </Label>
                <div className="px-2">
                  <Slider
                    value={discountRange}
                    onValueChange={(value) => {
                      setDiscountRange(value);
                      updateFilters({ discountMin: value[0], discountMax: value[1] });
                    }}
                    max={100}
                    step={5}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground mt-1">
                    <span>{discountRange[0]}%</span>
                    <span>{discountRange[1]}%</span>
                  </div>
                </div>
              </div>

              {/* Expiration Filter */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4" />
                  Expires By
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      {filters.expiresBy ? (
                        format(filters.expiresBy, 'PPP')
                      ) : (
                        <span className="text-muted-foreground">Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={filters.expiresBy || undefined}
                      onSelect={(date) => updateFilters({ expiresBy: date || null })}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                {filters.expiresBy && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => updateFilters({ expiresBy: null })}
                    className="w-full"
                  >
                    Clear Date
                  </Button>
                )}
              </div>

              <Separator />

              {/* Sort Options */}
              <div className="space-y-2">
                <Label>Sort By</Label>
                <Select
                  value={filters.sortBy}
                  onValueChange={(value: any) => updateFilters({ sortBy: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent">Most Recent</SelectItem>
                    <SelectItem value="expiring">Expiring Soon</SelectItem>
                    <SelectItem value="discount">Highest Discount</SelectItem>
                    <SelectItem value="distance">Nearest Location</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Search Results Teaser for Unauthenticated Users */}
      {!isAuthenticated && hasFilters && onShowSignUp && (
        <div className="bg-gradient-to-r from-primary/10 to-secondary/10 border-2 border-dashed border-primary/30 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="font-semibold text-foreground">
                {filteredCount} deal{filteredCount !== 1 ? 's' : ''} match your search
              </h3>
              <p className="text-sm text-muted-foreground">
                Sign up to view exclusive local deals and save money
              </p>
            </div>
            <Button onClick={onShowSignUp} className="gap-2">
              <UserPlus className="w-4 h-4" />
              Sign Up to See Deals
            </Button>
          </div>
        </div>
      )}

      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.query && (
            <Badge variant="secondary" className="gap-1">
              Search: {filters.query}
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 ml-1"
                onClick={() => updateFilters({ query: '' })}
              >
                <X className="w-3 h-3" />
              </Button>
            </Badge>
          )}
          {filters.category !== 'All Categories' && (
            <Badge variant="secondary" className="gap-1">
              {filters.category}
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 ml-1"
                onClick={() => updateFilters({ category: 'All Categories' })}
              >
                <X className="w-3 h-3" />
              </Button>
            </Badge>
          )}
          {filters.location && (
            <Badge variant="secondary" className="gap-1">
              <MapPin className="w-3 h-3" />
              {filters.location}
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 ml-1"
                onClick={() => updateFilters({ location: '' })}
              >
                <X className="w-3 h-3" />
              </Button>
            </Badge>
          )}
          {(filters.discountMin > 0 || filters.discountMax < 100) && (
            <Badge variant="secondary" className="gap-1">
              <Percent className="w-3 h-3" />
              {filters.discountMin}%-{filters.discountMax}%
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 ml-1"
                onClick={() => {
                  updateFilters({ discountMin: 0, discountMax: 100 });
                  setDiscountRange([0, 100]);
                }}
              >
                <X className="w-3 h-3" />
              </Button>
            </Badge>
          )}
          {filters.expiresBy && (
            <Badge variant="secondary" className="gap-1">
              <CalendarIcon className="w-3 h-3" />
              By {format(filters.expiresBy, 'MMM d')}
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 ml-1"
                onClick={() => updateFilters({ expiresBy: null })}
              >
                <X className="w-3 h-3" />
              </Button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}