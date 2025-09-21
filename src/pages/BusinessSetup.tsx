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
import { ArrowLeft, Store, Upload, CheckCircle } from 'lucide-react';
import { ProfileProgress } from '@/components/ProfileProgress';

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
    phone: user?.businessProfile?.phone || '',
    logo_url: user?.businessProfile?.logo_url || ''
  });
  const [isUploading, setIsUploading] = useState(false);

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
          <div className="flex-1">
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Store className="w-8 h-8 text-primary" />
              Complete Your Business Profile
            </h1>
            <p className="text-muted-foreground">
              Help customers discover and trust your business
            </p>
          </div>
        </div>

        {/* Progress Indicator */}
        <ProfileProgress 
          business={formData}
          className="mb-8"
        />

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

              <div className="space-y-2">
                <Label htmlFor="logo">Business Logo/Image (Optional)</Label>
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
                  {formData.logo_url ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <img 
                          src={formData.logo_url} 
                          alt="Business logo preview" 
                          className="w-16 h-16 object-cover rounded-lg border"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 text-success">
                            <CheckCircle className="w-4 h-4" />
                            <span className="text-sm font-medium">Logo uploaded successfully</span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Your logo will help customers recognize your business
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setFormData({ ...formData, logo_url: '' })}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground mb-2">
                        Upload your business logo or image
                      </p>
                      <p className="text-xs text-muted-foreground mb-4">
                        JPG, PNG or GIF up to 5MB. Recommended: 300x300px
                      </p>
                      <Input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        id="logo-upload"
                        disabled={isUploading}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            // For now, we'll just show a placeholder URL
                            // In a real app, you'd upload to Supabase Storage
                            setIsUploading(true);
                            setTimeout(() => {
                              setFormData({ 
                                ...formData, 
                                logo_url: URL.createObjectURL(file)
                              });
                              setIsUploading(false);
                            }, 1500);
                          }
                        }}
                      />
                      <Button
                        variant="outline"
                        className="gap-2"
                        disabled={isUploading}
                        onClick={() => document.getElementById('logo-upload')?.click()}
                      >
                        <Upload className="w-4 h-4" />
                        {isUploading ? 'Uploading...' : 'Choose File'}
                      </Button>
                    </div>
                  )}
                </div>
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