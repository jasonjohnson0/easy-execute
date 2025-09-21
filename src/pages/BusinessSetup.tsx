import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, Store } from 'lucide-react';

const BUSINESS_CATEGORIES = [
  'Restaurant',
  'Retail',
  'Health & Beauty',
  'Automotive',
  'Home & Garden',
  'Entertainment',
  'Professional Services',
  'Fitness & Wellness',
  'Technology',
  'Other'
];

export default function BusinessSetup() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.businessProfile?.name || '',
    description: user?.businessProfile?.description || '',
    category: user?.businessProfile?.category || '',
    address: user?.businessProfile?.address || '',
    phone: user?.businessProfile?.phone || ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.businessProfile?.id) {
      toast({
        title: "Error",
        description: "Business profile not found. Please try signing in again.",
        variant: "destructive"
      });
      return;
    }

    if (!formData.name || !formData.description || !formData.category || !formData.address) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields to complete your profile.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from('businesses')
        .update({
          name: formData.name,
          description: formData.description,
          category: formData.category,
          address: formData.address,
          phone: formData.phone || null
        })
        .eq('id', user.businessProfile.id);

      if (error) throw error;

      toast({
        title: "Profile Updated!",
        description: "Your business profile has been completed successfully.",
      });

      navigate('/create-deal?from=setup');
    } catch (error) {
      console.error('Error updating business profile:', error);
      toast({
        title: "Error",
        description: "Failed to update your business profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-2xl py-6 px-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/dashboard')}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Store className="w-8 h-8 text-primary" />
              Complete Your Business Profile
            </h1>
            <p className="text-muted-foreground">
              Help customers discover and trust your business
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Business Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Business Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter your business name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Business Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe your business and what makes it special"
                  rows={4}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Business Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your business category" />
                  </SelectTrigger>
                  <SelectContent>
                    {BUSINESS_CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Business Address *</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Enter your business address"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number (Optional)</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Enter your business phone number"
                  type="tel"
                />
              </div>

              <Button
                type="submit"
                size="lg"
                disabled={loading}
                className="w-full"
              >
                {loading ? 'Saving...' : 'Complete Profile & Continue'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <p className="text-sm text-muted-foreground">
            You can always update this information later from your dashboard settings.
          </p>
        </div>
      </div>
    </div>
  );
}