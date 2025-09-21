import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  Save, 
  Eye, 
  Calendar,
  Percent,
  DollarSign,
  Gift,
  Loader2
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { USE_MOCK_DEALS } from '@/data/mockData';
import { toast } from '@/hooks/use-toast';
import { format, addDays } from 'date-fns';
import { DealCard } from '@/components/DealCard';
import type { Deal } from '@/types/database';
import { useSearchParams } from 'react-router-dom';

export default function CreateDeal() {
  const { user, loading: authLoading, profileLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const fromSetup = searchParams.get('from') === 'setup';
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    discount_value: '',
    discount_type: 'percentage' as 'percentage' | 'fixed' | 'bogo',
    terms: '',
    expires_at: format(addDays(new Date(), 1), "yyyy-MM-dd'T'12:00")
  });

  useEffect(() => {
    // Wait for both auth and profile loading to complete
    if (!authLoading && !profileLoading) {
      if (!user || !user.businessProfile) {
        // If coming from setup, give it a bit more time for the profile to load
        if (fromSetup) {
          const timer = setTimeout(() => {
            if (!user || !user.businessProfile) {
              toast({
                title: "Access Denied",
                description: "You need to be signed in as a business owner to create deals.",
                variant: "destructive"
              });
              navigate('/');
            }
          }, 1000);
          return () => clearTimeout(timer);
        } else {
          toast({
            title: "Access Denied",
            description: "You need to be signed in as a business owner to create deals.",
            variant: "destructive"
          });
          navigate('/');
        }
      }
    }
  }, [user, authLoading, profileLoading, navigate, fromSetup]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Deal title is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Deal description is required';
    }

    if (!formData.discount_value.trim()) {
      newErrors.discount_value = 'Discount value is required';
    } else {
      if (formData.discount_type === 'percentage') {
        const value = parseFloat(formData.discount_value);
        if (isNaN(value) || value <= 0 || value > 100) {
          newErrors.discount_value = 'Percentage must be between 1 and 100';
        }
      } else if (formData.discount_type === 'fixed') {
        const value = parseFloat(formData.discount_value);
        if (isNaN(value) || value <= 0) {
          newErrors.discount_value = 'Fixed amount must be greater than 0';
        }
      }
    }

    if (!formData.expires_at) {
      newErrors.expires_at = 'Expiration date is required';
    } else {
      const expirationDate = new Date(formData.expires_at);
      if (expirationDate <= new Date()) {
        newErrors.expires_at = 'Expiration date must be in the future';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !user?.businessProfile) {
      return;
    }

    setLoading(true);

    try {
      if (!USE_MOCK_DEALS) {
        const { error } = await (supabase as any)
          .from('deals')
          .insert({
            business_id: user.businessProfile.id,
            title: formData.title,
            description: formData.description,
            discount_value: formData.discount_value,
            discount_type: formData.discount_type,
            terms: formData.terms,
            expires_at: formData.expires_at,
            is_active: true
          });

        if (error) throw error;
      }

      toast({
        title: "Deal Created!",
        description: "Your deal has been created and is now live.",
      });
      
      navigate('/dashboard');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create deal. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Create preview deal
  const previewDeal: Deal = {
    id: 'preview',
    business_id: user?.businessProfile?.id || '',
    title: formData.title || 'Your Deal Title',
    description: formData.description || 'Your deal description will appear here...',
    discount_value: formData.discount_value || '20',
    discount_type: formData.discount_type,
    terms: formData.terms,
    expires_at: formData.expires_at,
    is_active: true,
    views: 0,
    prints: 0,
    created_at: new Date().toISOString(),
    businesses: {
      name: user?.businessProfile?.name || 'Your Business',
      category: user?.businessProfile?.category || 'Business'
    }
  };

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!user?.businessProfile) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-6xl py-6 px-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/dashboard')}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Button>
          <Separator orientation="vertical" className="h-6" />
          <div>
            <h1 className="text-3xl font-bold">
              {fromSetup ? 'Create Your First Deal' : 'Create New Deal'}
            </h1>
            <p className="text-muted-foreground">
              {fromSetup 
                ? 'Get started with your first customer offer' 
                : 'Create an attractive deal for your customers'
              }
            </p>
          </div>
        </div>

        {fromSetup && (
          <div className="mb-6 p-4 bg-primary/5 border border-primary/20 rounded-lg">
            <p className="text-sm text-muted-foreground mb-3">
              Ready to attract your first customers? Create a deal now, or skip this step and set up deals later.
            </p>
            <Button
              variant="outline"
              onClick={() => navigate('/dashboard')}
              className="gap-2"
            >
              I'm not ready for more business, take me to the dashboard
            </Button>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Form */}
          <Card>
            <CardHeader>
              <CardTitle>Deal Information</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title">Deal Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="e.g., 20% Off All Coffee Drinks"
                    className={errors.title ? 'border-destructive' : ''}
                  />
                  {errors.title && (
                    <p className="text-sm text-destructive">{errors.title}</p>
                  )}
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Describe your deal in detail..."
                    rows={4}
                    className={errors.description ? 'border-destructive' : ''}
                  />
                  {errors.description && (
                    <p className="text-sm text-destructive">{errors.description}</p>
                  )}
                </div>

                {/* Discount Type and Value */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="discount_type">Discount Type *</Label>
                    <Select 
                      value={formData.discount_type} 
                      onValueChange={(value) => handleInputChange('discount_type', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">
                          <div className="flex items-center gap-2">
                            <Percent className="w-4 h-4" />
                            Percentage Off
                          </div>
                        </SelectItem>
                        <SelectItem value="fixed">
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4" />
                            Fixed Amount Off
                          </div>
                        </SelectItem>
                        <SelectItem value="bogo">
                          <div className="flex items-center gap-2">
                            <Gift className="w-4 h-4" />
                            Buy One Get One
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="discount_value">
                      {formData.discount_type === 'percentage' ? 'Percentage (%)' :
                       formData.discount_type === 'fixed' ? 'Amount ($)' :
                       'Deal Description'} *
                    </Label>
                    <Input
                      id="discount_value"
                      type={formData.discount_type === 'bogo' ? 'text' : 'number'}
                      value={formData.discount_value}
                      onChange={(e) => handleInputChange('discount_value', e.target.value)}
                      placeholder={
                        formData.discount_type === 'percentage' ? '20' :
                        formData.discount_type === 'fixed' ? '10' :
                        'Buy One Get One Free'
                      }
                      min={formData.discount_type !== 'bogo' ? '0' : undefined}
                      max={formData.discount_type === 'percentage' ? '100' : undefined}
                      step={formData.discount_type !== 'bogo' ? '0.01' : undefined}
                      className={errors.discount_value ? 'border-destructive' : ''}
                    />
                    {errors.discount_value && (
                      <p className="text-sm text-destructive">{errors.discount_value}</p>
                    )}
                  </div>
                </div>

                {/* Terms and Conditions */}
                <div className="space-y-2">
                  <Label htmlFor="terms">Terms & Conditions</Label>
                  <Textarea
                    id="terms"
                    value={formData.terms}
                    onChange={(e) => handleInputChange('terms', e.target.value)}
                    placeholder="Any restrictions or conditions for this deal..."
                    rows={3}
                  />
                </div>

                {/* Expiration Date */}
                <div className="space-y-2">
                  <Label htmlFor="expires_at">Expiration Date & Time *</Label>
                  <Input
                    id="expires_at"
                    type="datetime-local"
                    value={formData.expires_at}
                    onChange={(e) => handleInputChange('expires_at', e.target.value)}
                    min={format(new Date(), "yyyy-MM-dd'T'HH:mm")}
                    className={errors.expires_at ? 'border-destructive' : ''}
                  />
                  {errors.expires_at && (
                    <p className="text-sm text-destructive">{errors.expires_at}</p>
                  )}
                </div>

                {/* Form Actions */}
                <div className="flex gap-4 pt-4">
                  <Button
                    type="submit"
                    variant="hero"
                    disabled={loading}
                    className="flex-1"
                  >
                    {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    <Save className="w-4 h-4 mr-2" />
                    Create Deal
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/dashboard')}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Preview */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Deal Preview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <DealCard
                  deal={previewDeal}
                  layout="coupon"
                />
              </CardContent>
            </Card>

            {/* Tips */}
            <Alert>
              <Calendar className="w-4 h-4" />
              <AlertDescription>
                <strong>Tips for great deals:</strong>
                <ul className="mt-2 space-y-1 text-sm">
                  <li>• Keep titles clear and compelling</li>
                  <li>• Include specific terms to avoid confusion</li>
                  <li>• Set reasonable expiration dates</li>
                  <li>• Make your discount attractive but profitable</li>
                </ul>
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </div>
    </div>
  );
}