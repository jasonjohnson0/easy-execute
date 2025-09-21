import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
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
import { DealCard } from '@/components/DealCard';
import type { Deal } from '@/types/database';

// Enhanced validation components
import { ValidatedInput } from '@/components/ui/validated-input';
import { ValidatedTextarea } from '@/components/ui/validated-textarea';
import { ValidatedSelect } from '@/components/ui/validated-select';
import { ValidatedDatePicker } from '@/components/ui/validated-date-picker';
import { useDealForm } from '@/hooks/useDealForm';

export default function CreateDealEnhanced() {
  const { user, loading: authLoading, profileLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const fromSetup = searchParams.get('from') === 'setup';
  const fromWelcome = searchParams.get('from') === 'welcome';

  // Enhanced form with validation
  const form = useDealForm();
  const { formState: { isSubmitting, errors }, watch, setValue, getValues } = form;

  // Watch form values for preview
  const watchedValues = watch();

  useEffect(() => {
    // Wait for both auth and profile loading to complete
    if (!authLoading && !profileLoading) {
      if (!user || !user.businessProfile) {
        // If coming from setup or welcome, give it a bit more time for the profile to load
        if (fromSetup || fromWelcome) {
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
  }, [user, authLoading, profileLoading, navigate, fromSetup, fromWelcome]);

  const handleSubmit = form.handleSubmit(async (data) => {
    try {
      if (!user?.businessProfile?.id) {
        throw new Error('Business profile not found');
      }

      if (!USE_MOCK_DEALS) {
        const { error } = await supabase
          .from('deals')
          .insert({
            business_id: user.businessProfile.id,
            title: data.title,
            description: data.description,
            discount_type: data.discount_type,
            discount_value: data.discount_value,
            terms: data.terms,
            expires_at: data.expires_at.toISOString()
          });

        if (error) throw error;
      }

      toast({
        title: "Success!",
        description: "Your deal has been created successfully.",
      });

      if (fromSetup || fromWelcome) {
        navigate('/business-dashboard');
      } else {
        navigate('/business-dashboard');
      }
    } catch (error) {
      console.error('Error creating deal:', error);
      toast({
        title: "Error",
        description: "Failed to create deal. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Generate preview deal from form data
  const previewDeal: Deal | null = (() => {
    const values = getValues();
    if (!values.title || !user?.businessProfile) return null;

    return {
      id: 'preview',
      business_id: user.businessProfile.id,
      title: values.title || 'Preview Deal',
      description: values.description || 'Deal description will appear here...',
      discount_type: values.discount_type,
      discount_value: values.discount_value || '0',
      terms: values.terms || 'Terms and conditions will appear here...',
      expires_at: values.expires_at?.toISOString() || new Date().toISOString(),
      is_active: true,
      views: 0,
      prints: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      businesses: {
        id: user.businessProfile.id,
        name: user.businessProfile.name || 'Your Business',
        category: user.businessProfile.category || 'Business',
        logo_url: user.businessProfile.logo_url,
        address: user.businessProfile.address || '',
        phone: user.businessProfile.phone || '',
        email: user.businessProfile.email || ''
      }
    };
  })();

  // Discount type options
  const discountTypeOptions = [
    { value: 'percentage', label: 'Percentage Off' },
    { value: 'fixed', label: 'Fixed Amount Off' },
    { value: 'bogo', label: 'Buy One Get One' }
  ];

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => navigate('/business-dashboard')}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Create New Deal</h1>
              <p className="text-muted-foreground">Create an attractive deal to boost your business</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="h-5 w-5 text-primary" />
                Deal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Deal Title */}
                <div className="space-y-2">
                  <Label htmlFor="title">Deal Title *</Label>
                  <ValidatedInput
                    id="title"
                    placeholder="e.g., 50% Off All Menu Items"
                    value={watchedValues.title}
                    onChange={(e) => setValue('title', e.target.value)}
                    errorMessage={errors.title?.message}
                  />
                </div>

                {/* Deal Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <ValidatedTextarea
                    id="description"
                    placeholder="Describe your deal in detail..."
                    value={watchedValues.description}
                    onChange={(e) => setValue('description', e.target.value)}
                    errorMessage={errors.description?.message}
                    maxLength={500}
                    showCharCount={true}
                    rows={4}
                  />
                </div>

                {/* Discount Type and Value */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="discount_type">Discount Type *</Label>
                    <ValidatedSelect
                      value={watchedValues.discount_type}
                      onValueChange={(value) => setValue('discount_type', value as any)}
                      placeholder="Select discount type"
                      options={discountTypeOptions}
                      error={errors.discount_type?.message}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="discount_value">
                      {watchedValues.discount_type === 'percentage' ? 'Percentage' : 
                       watchedValues.discount_type === 'fixed' ? 'Amount ($)' : 'Quantity'} *
                    </Label>
                    <div className="relative">
                      {watchedValues.discount_type === 'percentage' && (
                        <Percent className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      )}
                      {watchedValues.discount_type === 'fixed' && (
                        <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      )}
                      <ValidatedInput
                        id="discount_value"
                        type={watchedValues.discount_type === 'bogo' ? 'text' : 'number'}
                        placeholder={
                          watchedValues.discount_type === 'percentage' ? '25' :
                          watchedValues.discount_type === 'fixed' ? '10.00' : '1 FREE'
                        }
                        value={watchedValues.discount_value}
                        onChange={(e) => setValue('discount_value', e.target.value)}
                        errorMessage={errors.discount_value?.message}
                        className={watchedValues.discount_type !== 'bogo' ? 'pl-10' : ''}
                      />
                    </div>
                  </div>
                </div>

                {/* Terms and Conditions */}
                <div className="space-y-2">
                  <Label htmlFor="terms">Terms & Conditions *</Label>
                  <ValidatedTextarea
                    id="terms"
                    placeholder="e.g., Valid for dine-in only. Cannot be combined with other offers."
                    value={watchedValues.terms}
                    onChange={(e) => setValue('terms', e.target.value)}
                    errorMessage={errors.terms?.message}
                    maxLength={300}
                    showCharCount={true}
                    rows={3}
                  />
                </div>

                {/* Expiration Date */}
                <div className="space-y-2">
                  <Label htmlFor="expires_at">Expiration Date *</Label>
                  <ValidatedDatePicker
                    value={watchedValues.expires_at}
                    onValueChange={(date) => setValue('expires_at', date)}
                    placeholder="Select expiration date"
                    error={errors.expires_at?.message}
                    minDate={new Date()}
                    maxDate={new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)}
                  />
                </div>

                <Separator />

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="flex-1"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating Deal...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Create Deal
                      </>
                    )}
                  </Button>
                  
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => navigate('/business-dashboard')}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Preview Section */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5 text-primary" />
                  Live Preview
                </CardTitle>
              </CardHeader>
              <CardContent>
                {previewDeal ? (
                  <DealCard deal={previewDeal} />
                ) : (
                  <div className="aspect-[4/3] border-2 border-dashed border-muted-foreground/25 rounded-lg flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                      <Eye className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>Preview will appear as you type</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tips Card */}
            <Alert>
              <Calendar className="h-4 w-4" />
              <AlertDescription>
                <strong>Pro Tips:</strong>
                <ul className="mt-2 space-y-1 text-sm">
                  <li>• Use clear, action-oriented titles</li>
                  <li>• Include specific value propositions</li>
                  <li>• Set reasonable expiration dates</li>
                  <li>• Be specific about terms and restrictions</li>
                </ul>
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </div>
    </div>
  );
}