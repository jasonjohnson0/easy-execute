import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useBusinessForm } from '@/hooks/useBusinessForm';
import { useBusinessManagement } from '@/hooks/useBusinessManagement';
import { PlatformBusiness } from '@/hooks/usePlatformData';
import { BUSINESS_CATEGORIES } from '@/lib/validations/schemas';
import { Building2, Trash2, Save, X } from 'lucide-react';

interface BusinessEditorProps {
  business: PlatformBusiness | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SUBSCRIPTION_STATUSES = [
  { value: 'active', label: 'Active' },
  { value: 'trial', label: 'Trial' },
  { value: 'past_due', label: 'Past Due' },
  { value: 'canceled', label: 'Canceled' },
  { value: 'unpaid', label: 'Unpaid' },
];

const SUBSCRIPTION_PLANS = [
  { value: 'basic', label: 'Basic' },
  { value: 'pro', label: 'Pro' },
  { value: 'enterprise', label: 'Enterprise' },
];

export function BusinessEditor({ business, open, onOpenChange }: BusinessEditorProps) {
  if (!business) return null;

  const [isUpdating, setIsUpdating] = useState(false);
  const businessManagement = useBusinessManagement();

  const form = useBusinessForm({
    name: business.name,
    email: business.email,
    phone: business.phone || '',
    address: business.address || '',
    category: business.category as any,
    description: business.description || '',
    logo_url: business.logo_url || '',
  });

  const handleSave = async () => {
    setIsUpdating(true);
    try {
      const formData = form.getValues();
      await businessManagement.updateBusiness.mutateAsync({
        businessId: business.id,
        data: formData,
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating business:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSubscriptionUpdate = async (status: string, plan: string) => {
    try {
      await businessManagement.updateSubscription.mutateAsync({
        businessId: business.id,
        subscriptionStatus: status,
        subscriptionPlan: plan,
      });
    } catch (error) {
      console.error('Error updating subscription:', error);
    }
  };

  const handleDelete = async () => {
    try {
      await businessManagement.deleteBusiness.mutateAsync(business.id);
      onOpenChange(false);
    } catch (error) {
      console.error('Error deleting business:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            <DialogTitle>Edit Business: {business.name}</DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Business Name</Label>
                  <Input
                    id="name"
                    {...form.register('name')}
                    placeholder="Enter business name"
                  />
                  {form.formState.errors.name && (
                    <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    {...form.register('email')}
                    placeholder="Enter email address"
                  />
                  {form.formState.errors.email && (
                    <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    {...form.register('phone')}
                    placeholder="Enter phone number"
                  />
                  {form.formState.errors.phone && (
                    <p className="text-sm text-destructive">{form.formState.errors.phone.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select value={form.watch('category')} onValueChange={(value) => form.setValue('category', value as any)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {BUSINESS_CATEGORIES.map(category => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.category && (
                    <p className="text-sm text-destructive">{form.formState.errors.category.message}</p>
                  )}
                </div>
              </div>
              <div>
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  {...form.register('address')}
                  placeholder="Enter business address"
                />
                {form.formState.errors.address && (
                  <p className="text-sm text-destructive">{form.formState.errors.address.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  {...form.register('description')}
                  placeholder="Enter business description"
                  rows={3}
                />
                {form.formState.errors.description && (
                  <p className="text-sm text-destructive">{form.formState.errors.description.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="logo_url">Logo URL</Label>
                <Input
                  id="logo_url"
                  {...form.register('logo_url')}
                  placeholder="Enter logo URL"
                />
                {form.formState.errors.logo_url && (
                  <p className="text-sm text-destructive">{form.formState.errors.logo_url.message}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Subscription Management */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Subscription Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="subscription_status">Subscription Status</Label>
                  <Select
                    value={business.subscription_status}
                    onValueChange={(value) => handleSubscriptionUpdate(value, business.subscription_plan)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SUBSCRIPTION_STATUSES.map(status => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="subscription_plan">Subscription Plan</Label>
                  <Select
                    value={business.subscription_plan}
                    onValueChange={(value) => handleSubscriptionUpdate(business.subscription_status, value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SUBSCRIPTION_PLANS.map(plan => (
                        <SelectItem key={plan.value} value={plan.value}>
                          {plan.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Referral Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Referral Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="referral_code">Referral Code</Label>
                  <Input
                    id="referral_code"
                    value={business.referral_code}
                    readOnly
                    className="bg-muted"
                  />
                </div>
                <div>
                  <Label htmlFor="referred_by">Referred By</Label>
                  <Input
                    id="referred_by"
                    value={business.referred_by || 'None'}
                    readOnly
                    className="bg-muted"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Separator />

          {/* Action Buttons */}
          <div className="flex justify-between">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={businessManagement.isDeleting}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Business
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Business</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete "{business.name}"? This action cannot be undone and will also delete all associated deals.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button 
                onClick={handleSave} 
                disabled={isUpdating || businessManagement.isUpdating}
              >
                <Save className="h-4 w-4 mr-2" />
                {isUpdating ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}