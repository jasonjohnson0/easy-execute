import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { User, Building2, Save, Copy } from 'lucide-react';

interface ProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProfileModal({ open, onOpenChange }: ProfileModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [businessData, setBusinessData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    category: '',
    description: '',
  });

  const isBusinessAccount = !!user?.businessProfile;

  useEffect(() => {
    if (user?.businessProfile) {
      setBusinessData({
        name: user.businessProfile.name || '',
        email: user.businessProfile.email || '',
        phone: user.businessProfile.phone || '',
        address: user.businessProfile.address || '',
        category: user.businessProfile.category || '',
        description: user.businessProfile.description || '',
      });
    }
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      if (isBusinessAccount) {
        const { error } = await supabase
          .from('businesses')
          .update(businessData)
          .eq('id', user.id);

        if (error) throw error;
        toast({
          title: "Profile updated",
          description: "Your business profile has been updated successfully.",
        });
      }
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const copyReferralCode = () => {
    const referralCode = user?.businessProfile?.referral_code || user?.userProfile?.referral_code;
    if (referralCode) {
      navigator.clipboard.writeText(referralCode);
      toast({
        title: "Copied!",
        description: "Referral code copied to clipboard.",
      });
    }
  };

  const categories = [
    "Restaurant", "Retail", "Health & Beauty", "Automotive", "Entertainment",
    "Services", "Fitness", "Technology", "Real Estate", "Other"
  ];

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isBusinessAccount ? <Building2 className="h-5 w-5" /> : <User className="h-5 w-5" />}
            {isBusinessAccount ? 'Business Profile' : 'User Profile'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Account Type Badge */}
          <div className="flex items-center gap-2">
            <Badge variant={isBusinessAccount ? "secondary" : "outline"}>
              {isBusinessAccount ? 'Business Account' : 'Personal Account'}
            </Badge>
          </div>

          {/* Email (Read-only) */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              value={user.email || ''}
              disabled
              className="bg-muted"
            />
          </div>

          {isBusinessAccount ? (
            <>
              {/* Business Fields */}
              <div className="space-y-2">
                <Label htmlFor="business-name">Business Name</Label>
                <Input
                  id="business-name"
                  value={businessData.name}
                  onChange={(e) => setBusinessData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter business name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={businessData.phone}
                  onChange={(e) => setBusinessData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="Enter phone number"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={businessData.address}
                  onChange={(e) => setBusinessData(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Enter business address"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select 
                  value={businessData.category} 
                  onValueChange={(value) => setBusinessData(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
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

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={businessData.description}
                  onChange={(e) => setBusinessData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe your business"
                  rows={3}
                />
              </div>
            </>
          ) : (
            <div className="text-sm text-muted-foreground py-4">
              Personal account profiles have limited customization options.
            </div>
          )}

          {/* Referral Code */}
          <Separator />
          <div className="space-y-2">
            <Label>Referral Code</Label>
            <div className="flex gap-2">
              <Input
                value={user.businessProfile?.referral_code || user.userProfile?.referral_code || ''}
                disabled
                className="bg-muted font-mono text-sm"
              />
              <Button 
                variant="outline" 
                size="sm" 
                onClick={copyReferralCode}
                className="shrink-0"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button 
              onClick={handleSave} 
              disabled={loading || !isBusinessAccount}
              className="flex-1"
            >
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}