import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface CategoryFilterProps {
  categories: string[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

export function CategoryFilter({ categories, selectedCategory, onCategoryChange }: CategoryFilterProps) {
  const [showAllCategories, setShowAllCategories] = useState(false);
  
  // Popular categories (first 5)
  const popularCategories = categories.slice(0, 5);
  const remainingCategories = categories.slice(5);
  
  const displayedCategories = showAllCategories ? categories : popularCategories;

  return (
    <div className="border-t bg-muted/30">
      <div className="container px-4 py-3">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {displayedCategories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "ghost"}
              size="sm"
              onClick={() => onCategoryChange(category)}
              className="whitespace-nowrap flex-shrink-0"
            >
              {category}
            </Button>
          ))}
          
          {remainingCategories.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAllCategories(!showAllCategories)}
              className="whitespace-nowrap flex-shrink-0 gap-1"
            >
              {showAllCategories ? (
                <>
                  Less <ChevronUp className="w-3 h-3" />
                </>
              ) : (
                <>
                  More Categories <ChevronDown className="w-3 h-3" />
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}