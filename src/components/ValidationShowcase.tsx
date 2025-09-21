import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  XCircle, 
  Mail, 
  Phone, 
  Calendar, 
  FileText,
  Shield
} from 'lucide-react';

// Import the new validation components
import {
  ValidatedInput,
  ValidatedSelect,
  ValidatedTextarea,
  PhoneInput,
  EmailInput,
  ValidatedDatePicker,
  useBusinessForm,
  useDealForm,
  BusinessProfileData,
  DealData
} from '@/components/ui/validation';

export function ValidationShowcase() {
  // Demo forms
  const businessForm = useBusinessForm();
  const dealForm = useDealForm();

  const businessCategories = [
    { value: 'Restaurant', label: 'Restaurant' },
    { value: 'Retail', label: 'Retail' },
    { value: 'Services', label: 'Services' },
    { value: 'Health & Beauty', label: 'Health & Beauty' },
    { value: 'Entertainment', label: 'Entertainment' },
    { value: 'Other', label: 'Other' }
  ];

  const discountTypes = [
    { value: 'percentage', label: 'Percentage Off' },
    { value: 'fixed', label: 'Fixed Amount Off' },
    { value: 'bogo', label: 'Buy One Get One' }
  ];

  const handleBusinessSubmit = businessForm.handleSubmit((data: BusinessProfileData) => {
    console.log('Business form submitted:', data);
  });

  const handleDealSubmit = dealForm.handleSubmit((data: DealData) => {
    console.log('Deal form submitted:', data);
  });

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Form Validation & Data Quality System</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          A comprehensive validation system with enhanced components, Zod schemas, 
          and React Hook Form integration for better data quality and user experience.
        </p>
        <div className="flex justify-center gap-2">
          <Badge variant="secondary">
            <Shield className="w-3 h-3 mr-1" />
            Type Safe
          </Badge>
          <Badge variant="secondary">
            <CheckCircle className="w-3 h-3 mr-1" />
            Real-time Validation
          </Badge>
          <Badge variant="secondary">
            <FileText className="w-3 h-3 mr-1" />
            Schema Based
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Enhanced Components Demo */}
        <Card>
          <CardHeader>
            <CardTitle>Enhanced Validation Components</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Email Input */}
            <div className="space-y-2">
              <Label>Email Input with Suggestions</Label>
              <EmailInput
                placeholder="Enter your email"
                showSuggestion={true}
              />
              <p className="text-sm text-muted-foreground">
                Try typing "test@gmial.com" to see auto-correction
              </p>
            </div>

            {/* Phone Input */}
            <div className="space-y-2">
              <Label>Auto-formatting Phone Input</Label>
              <PhoneInput placeholder="Enter your phone number" />
              <p className="text-sm text-muted-foreground">
                Automatically formats as you type
              </p>
            </div>

            {/* Validated Select */}
            <div className="space-y-2">
              <Label>Validated Select</Label>
              <ValidatedSelect
                placeholder="Choose a category"
                options={businessCategories}
              />
            </div>

            {/* Validated Date Picker */}
            <div className="space-y-2">
              <Label>Date Picker with Constraints</Label>
              <ValidatedDatePicker
                placeholder="Select a future date"
                minDate={new Date()}
                maxDate={new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)}
              />
            </div>

            {/* Validated Textarea */}
            <div className="space-y-2">
              <Label>Textarea with Character Count</Label>
              <ValidatedTextarea
                placeholder="Enter a description..."
                maxLength={200}
                showCharCount={true}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Business Profile Form Demo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-primary" />
              Business Profile Form
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleBusinessSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Business Name *</Label>
                <ValidatedInput
                  {...businessForm.register('name')}
                  placeholder="Your Business Name"
                  errorMessage={businessForm.getFieldError('name')}
                />
              </div>

              <div className="space-y-2">
                <Label>Email *</Label>
                <EmailInput
                  {...businessForm.register('email')}
                  error={businessForm.getFieldError('email')}
                />
              </div>

              <div className="space-y-2">
                <Label>Phone *</Label>
                <PhoneInput
                  {...businessForm.register('phone')}
                  error={businessForm.getFieldError('phone')}
                />
              </div>

              <div className="space-y-2">
                <Label>Category *</Label>
                <ValidatedSelect
                  {...businessForm.register('category')}
                  options={businessCategories}
                  error={businessForm.getFieldError('category')}
                />
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <ValidatedTextarea
                  {...businessForm.register('description')}
                  placeholder="Describe your business..."
                  maxLength={500}
                  showCharCount={true}
                  errorMessage={businessForm.getFieldError('description')}
                />
              </div>

              <Button 
                type="submit" 
                disabled={businessForm.isSubmitting}
                className="w-full"
              >
                {businessForm.isSubmitting ? 'Validating...' : 'Submit Business Profile'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Deal Form Demo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-primary" />
              Deal Creation Form
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleDealSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Deal Title *</Label>
                <ValidatedInput
                  {...dealForm.register('title')}
                  placeholder="50% Off All Items"
                  errorMessage={dealForm.getFieldError('title')}
                />
              </div>

              <div className="space-y-2">
                <Label>Description *</Label>
                <ValidatedTextarea
                  {...dealForm.register('description')}
                  placeholder="Describe your deal..."
                  maxLength={500}
                  showCharCount={true}
                  errorMessage={dealForm.getFieldError('description')}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Discount Type *</Label>
                  <ValidatedSelect
                    {...dealForm.register('discount_type')}
                    options={discountTypes}
                    error={dealForm.getFieldError('discount_type')}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Discount Value *</Label>
                  <ValidatedInput
                    {...dealForm.register('discount_value')}
                    placeholder="25"
                    type="text"
                    errorMessage={dealForm.getFieldError('discount_value')}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Expiration Date *</Label>
                <ValidatedDatePicker
                  value={dealForm.watch('expires_at')}
                  onValueChange={(date) => dealForm.setValue('expires_at', date)}
                  error={dealForm.getFieldError('expires_at')}
                  minDate={new Date()}
                  maxDate={new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)}
                />
              </div>

              <Button 
                type="submit" 
                disabled={dealForm.isSubmitting}
                className="w-full"
              >
                {dealForm.isSubmitting ? 'Creating Deal...' : 'Create Deal'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Features Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Key Features</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold">Real-time Validation</h4>
                  <p className="text-sm text-muted-foreground">
                    Instant feedback as users type with debounced validation
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold">Schema-based Validation</h4>
                  <p className="text-sm text-muted-foreground">
                    Zod schemas ensure consistent validation logic across forms
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold">Smart Auto-corrections</h4>
                  <p className="text-sm text-muted-foreground">
                    Email suggestions and phone number auto-formatting
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold">Data Sanitization</h4>
                  <p className="text-sm text-muted-foreground">
                    Automatic HTML sanitization and data cleaning
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold">Type Safety</h4>
                  <p className="text-sm text-muted-foreground">
                    Full TypeScript integration with type-safe form handling
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold">Business Logic Validation</h4>
                  <p className="text-sm text-muted-foreground">
                    Cross-field validation and business rule enforcement
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}