import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Clock, Eye, Zap } from 'lucide-react';

interface DealTeaserCardProps {
  category: string;
  layout?: 'grid' | 'coupon';
  onSignUp: () => void;
}

export function DealTeaserCard({ category, layout = 'grid', onSignUp }: DealTeaserCardProps) {
  if (layout === 'coupon') {
    return (
      <Card className="relative overflow-hidden border-2 border-dashed border-muted-foreground/30 bg-muted/10">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />
        <CardContent className="p-8">
          <div className="flex justify-between items-start mb-6">
            <div className="space-y-3">
              <Badge variant="outline" className="text-xs">
                {category}
              </Badge>
              <div className="space-y-2">
                <div className="h-6 w-48 bg-muted animate-pulse rounded" />
                <div className="h-4 w-32 bg-muted animate-pulse rounded" />
              </div>
            </div>
            <div className="text-right">
              <div className="h-12 w-20 bg-primary/20 rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6 text-primary" />
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <div className="h-3 w-16 bg-muted animate-pulse rounded" />
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <div className="h-3 w-20 bg-muted animate-pulse rounded" />
              </div>
            </div>
            
            <div className="pt-4 border-t border-dashed">
              <Button 
                onClick={onSignUp}
                className="w-full"
                variant="default"
              >
                Sign Up to Reveal Deal
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="relative overflow-hidden border-2 border-dashed border-muted-foreground/30 bg-muted/10 hover:border-primary/30 transition-colors">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <Badge variant="outline" className="text-xs">
            {category}
          </Badge>
          <div className="h-8 w-16 bg-primary/20 rounded flex items-center justify-center">
            <Zap className="w-4 h-4 text-primary" />
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="h-5 w-3/4 bg-muted animate-pulse rounded" />
          <div className="h-4 w-1/2 bg-muted animate-pulse rounded" />
        </div>
        
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Eye className="w-4 h-4" />
            <span>Hidden</span>
          </div>
          <div className="flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            <div className="h-3 w-12 bg-muted animate-pulse rounded" />
          </div>
        </div>
        
        <Button 
          onClick={onSignUp}
          size="sm" 
          className="w-full mt-4"
          variant="secondary"
        >
          Sign Up to View
        </Button>
      </CardContent>
    </Card>
  );
}