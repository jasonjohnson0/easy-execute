import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { usePlatformDeals } from '@/hooks/usePlatformData';
import { Ticket, Eye, Printer, Building2 } from 'lucide-react';
import { format } from 'date-fns';

export function DealManagement() {
  const { data: deals, isLoading, error } = usePlatformDeals();

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-destructive">
            Error loading deals: {error.message}
          </div>
        </CardContent>
      </Card>
    );
  }

  const getStatusBadgeVariant = (isActive: boolean, expiresAt: string) => {
    if (!isActive) return 'secondary';
    if (new Date(expiresAt) < new Date()) return 'destructive';
    return 'default';
  };

  const getStatusText = (isActive: boolean, expiresAt: string) => {
    if (!isActive) return 'Inactive';
    if (new Date(expiresAt) < new Date()) return 'Expired';
    return 'Active';
  };

  const getDiscountTypeVariant = (type: string) => {
    switch (type) {
      case 'percentage': return 'default';
      case 'fixed': return 'secondary';
      case 'bogo': return 'outline';
      default: return 'outline';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Ticket className="h-5 w-5" />
          <CardTitle>Deal Management</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8">Loading deals...</div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Deal</TableHead>
                  <TableHead>Business</TableHead>
                  <TableHead>Discount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Engagement</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {deals?.map((deal) => (
                  <TableRow key={deal.id}>
                    <TableCell>
                      <div className="font-medium max-w-xs">{deal.title}</div>
                      <div className="text-xs text-muted-foreground mt-1 max-w-xs truncate">
                        {deal.description}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Building2 className="h-3 w-3" />
                        <div>
                          <div className="font-medium text-sm">{deal.business_name}</div>
                          <Badge variant="outline" className="text-xs">
                            {deal.business_category}
                          </Badge>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">{deal.discount_value}</div>
                        <Badge variant={getDiscountTypeVariant(deal.discount_type)} className="text-xs">
                          {deal.discount_type}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(deal.is_active, deal.expires_at)}>
                        {getStatusText(deal.is_active, deal.expires_at)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          <span>{deal.views} views</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Printer className="h-3 w-3" />
                          <span>{deal.prints} prints</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {format(new Date(deal.expires_at), 'MMM dd, yyyy')}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {format(new Date(deal.created_at), 'MMM dd, yyyy')}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}