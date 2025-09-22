import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Plus, Users, DollarSign, TrendingUp, Edit, Eye } from 'lucide-react';
import { useReferralAnalytics, useCreateOrganization, useUpdateOrganization, Organization } from '@/hooks/useReferralData';
import { toast } from 'sonner';

const ReferralManagement = () => {
  const { data: analytics, isLoading } = useReferralAnalytics();
  const createOrganization = useCreateOrganization();
  const updateOrganization = useUpdateOrganization();
  
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingOrg, setEditingOrg] = useState<Organization | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    keyword: '',
    contact_email: '',
    commission_rate: 0.25,
  });

  const resetForm = () => {
    setFormData({
      name: '',
      keyword: '',
      contact_email: '',
      commission_rate: 0.25,
    });
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await createOrganization.mutateAsync(formData);
      setShowCreateDialog(false);
      resetForm();
    } catch (error) {
      // Error is handled in the mutation
    }
  };

  const handleEdit = (org: Organization) => {
    setEditingOrg(org);
    setFormData({
      name: org.name,
      keyword: org.keyword,
      contact_email: org.contact_email,
      commission_rate: org.commission_rate,
    });
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingOrg) return;
    
    try {
      await updateOrganization.mutateAsync({
        id: editingOrg.id,
        updates: formData,
      });
      setEditingOrg(null);
      resetForm();
    } catch (error) {
      // Error is handled in the mutation
    }
  };

  const toggleOrganizationStatus = async (org: Organization) => {
    try {
      await updateOrganization.mutateAsync({
        id: org.id,
        updates: { is_active: !org.is_active },
      });
    } catch (error) {
      // Error is handled in the mutation
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatPercentage = (rate: number) => {
    return `${(rate * 100).toFixed(1)}%`;
  };

  if (isLoading) {
    return <div className="p-6">Loading referral data...</div>;
  }

  const organizations = analytics?.organizations || [];

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Organizations</p>
                <p className="text-2xl font-bold">{organizations.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Total Conversions</p>
                <p className="text-2xl font-bold">{analytics?.total_conversions || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Commission Paid</p>
                <p className="text-2xl font-bold">{formatCurrency(analytics?.total_commission_paid || 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Active Members</p>
                <p className="text-2xl font-bold">{analytics?.active_memberships || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Organizations Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Referral Organizations</CardTitle>
              <CardDescription>
                Manage schools, teams, and other organizations with referral programs
              </CardDescription>
            </div>
            
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Organization
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Organization</DialogTitle>
                  <DialogDescription>
                    Add a new organization to the referral program
                  </DialogDescription>
                </DialogHeader>
                
                <form onSubmit={handleCreate} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Organization Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Pirates Soccer Team"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="keyword">Referral Keyword</Label>
                    <Input
                      id="keyword"
                      value={formData.keyword}
                      onChange={(e) => setFormData({ ...formData, keyword: e.target.value.toLowerCase() })}
                      placeholder="e.g., pirates"
                      pattern="[a-z0-9]+"
                      title="Only lowercase letters and numbers allowed"
                      required
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Only lowercase letters and numbers. This will be used in URLs like: ?ref=pirates
                    </p>
                  </div>
                  
                  <div>
                    <Label htmlFor="email">Contact Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.contact_email}
                      onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                      placeholder="contact@organization.com"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="commission">Commission Rate (%)</Label>
                    <Input
                      id="commission"
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={(formData.commission_rate * 100).toString()}
                      onChange={(e) => setFormData({ ...formData, commission_rate: parseFloat(e.target.value) / 100 })}
                      placeholder="25"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Default: 25% = ${formatCurrency(50 * 0.25)} per $50 membership
                    </p>
                  </div>
                  
                  <DialogFooter>
                    <Button type="submit" disabled={createOrganization.isPending}>
                      {createOrganization.isPending ? 'Creating...' : 'Create Organization'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Organization</TableHead>
                <TableHead>Keyword</TableHead>
                <TableHead>Commission Rate</TableHead>
                <TableHead>Referrals</TableHead>
                <TableHead>Earnings</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {organizations.map((org) => (
                <TableRow key={org.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{org.name}</p>
                      <p className="text-sm text-muted-foreground">{org.contact_email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{org.keyword}</Badge>
                  </TableCell>
                  <TableCell>{formatPercentage(org.commission_rate)}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <p>Total: {org.total_referrals}</p>
                      <p className="text-muted-foreground">Recent: {org.recent_conversions || 0}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <p>{formatCurrency(org.total_earnings)}</p>
                      <p className="text-muted-foreground">Recent: {formatCurrency(org.recent_earnings || 0)}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={org.is_active}
                        onCheckedChange={() => toggleOrganizationStatus(org)}
                      />
                      <Badge variant={org.is_active ? 'default' : 'secondary'}>
                        {org.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(org)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              
              {organizations.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="flex flex-col items-center space-y-2">
                      <Users className="h-8 w-8 text-muted-foreground" />
                      <p className="text-muted-foreground">No organizations yet</p>
                      <p className="text-sm text-muted-foreground">Create your first referral organization to get started</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Organization Dialog */}
      <Dialog open={!!editingOrg} onOpenChange={() => setEditingOrg(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Organization</DialogTitle>
            <DialogDescription>
              Update organization details and settings
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Organization Name</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Pirates Soccer Team"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="edit-keyword">Referral Keyword</Label>
              <Input
                id="edit-keyword"
                value={formData.keyword}
                onChange={(e) => setFormData({ ...formData, keyword: e.target.value.toLowerCase() })}
                placeholder="e.g., pirates"
                pattern="[a-z0-9]+"
                title="Only lowercase letters and numbers allowed"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="edit-email">Contact Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.contact_email}
                onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                placeholder="contact@organization.com"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="edit-commission">Commission Rate (%)</Label>
              <Input
                id="edit-commission"
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={(formData.commission_rate * 100).toString()}
                onChange={(e) => setFormData({ ...formData, commission_rate: parseFloat(e.target.value) / 100 })}
                placeholder="25"
              />
            </div>
            
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditingOrg(null)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={updateOrganization.isPending}>
                {updateOrganization.isPending ? 'Updating...' : 'Update Organization'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ReferralManagement;