import { Badge } from '@/components/ui/badge';
import { Clock } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface OpenStatusBadgeProps {
  businessId: string;
  className?: string;
}

export function OpenStatusBadge({ businessId, className }: OpenStatusBadgeProps) {
  const { data: isOpen, isLoading } = useQuery({
    queryKey: ['business-open-status', businessId],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc('is_business_open_now', { business_uuid: businessId });
      
      if (error) throw error;
      return data;
    },
    refetchInterval: 60000, // Refetch every minute
  });

  if (isLoading) {
    return (
      <Badge variant="outline" className={className}>
        <Clock className="h-3 w-3 mr-1" />
        Checking...
      </Badge>
    );
  }

  return (
    <Badge 
      variant={isOpen ? "default" : "secondary"} 
      className={`${className} ${isOpen ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'} text-white`}
    >
      <Clock className="h-3 w-3 mr-1" />
      {isOpen ? 'Open Now' : 'Closed'}
    </Badge>
  );
}