import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { usePlatformBusinesses } from '@/hooks/usePlatformData';
import { Building2, Mail, Phone, MapPin } from 'lucide-react';
import { format } from 'date-fns';

export function BusinessManagement() {
  const { data: businesses, isLoading, error } = usePlatformBusinesses();

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-destructive">
            Error loading businesses: {error.message}
          </div>
        </CardContent>
      </Card>
    );
  }

  const getSubscriptionBadgeVariant = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'trial': return 'secondary';
      case 'past_due': return 'destructive';
      case 'canceled': return 'outline';
      default: return 'secondary';
    }
  };

  const getPlanBadgeVariant = (plan: string) => {
    switch (plan) {
      case 'enterprise': return 'default';
      case 'pro': return 'secondary';
      case 'basic': return 'outline';
      default: return 'outline';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          <CardTitle>Business Management</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8">Loading businesses...</div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Business</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Subscription</TableHead>
                  <TableHead>Deals</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {businesses?.map((business) => (
                  <TableRow key={business.id}>
                    <TableCell>
                      <div className="font-medium">{business.name}</div>
                      {business.description && (
                        <div className="text-xs text-muted-foreground mt-1 max-w-xs truncate">
                          {business.description}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-sm">
                          <Mail className="h-3 w-3" />
                          {business.email}
                        </div>
                        {business.phone && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Phone className="h-3 w-3" />
                            {business.phone}
                          </div>
                        )}
                        {business.address && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            <span className="max-w-xs truncate">{business.address}</span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{business.category}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <Badge variant={getSubscriptionBadgeVariant(business.subscription_status)}>
                          {business.subscription_status}
                        </Badge>
                        <div>
                          <Badge variant={getPlanBadgeVariant(business.subscription_plan)} className="text-xs">
                            {business.subscription_plan}
                          </Badge>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-medium">{business.active_deal_count} active</div>
                        <div className="text-muted-foreground">{business.deal_count} total</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {format(new Date(business.created_at), 'MMM dd, yyyy')}
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