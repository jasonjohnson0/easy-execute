import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Store, Users } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { DEAL_CATEGORIES } from '@/data/mockData';

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'signin' | 'signup';
  userType: 'hunter' | 'business';
  onModeChange: (mode: 'signin' | 'signup') => void;
  onUserTypeChange: (type: 'hunter' | 'business') => void;
}

export function AuthModal({ 
  open, 
  onOpenChange, 
  mode, 
  userType, 
  onModeChange, 
  onUserTypeChange 
}: AuthModalProps) {
  const { signIn, signUp } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [businessData, setBusinessData] = useState({
    name: '',
    phone: '',
    address: '',
    category: '',
    description: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (mode === 'signin') {
        // Sign in
        const { error } = await signIn(email, password);
        if (error) {
          setError(error.message);
          return;
        }
      } else {
        // Sign up
        const { data, error } = await signUp(
          email, 
          password, 
          userType, 
          userType === 'business' ? businessData : undefined
        );
        if (error) {
          setError(error.message);
          return;
        }

        // Show success message for email confirmation
        if (data.user && !data.session) {
          setError('Please check your email to confirm your account before signing in.');
          return;
        }
      }

      onOpenChange(false);
      resetForm();
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setBusinessData({
      name: '',
      phone: '',
      address: '',
      category: '',
      description: ''
    });
    setError('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold">
            {mode === 'signin' ? 'Welcome Back' : 'Join LocalDeals'}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={userType} onValueChange={(value) => onUserTypeChange(value as 'hunter' | 'business')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="hunter" className="gap-2">
              <Users className="w-4 h-4" />
              Deal Hunter
            </TabsTrigger>
            <TabsTrigger value="business" className="gap-2">
              <Store className="w-4 h-4" />
              Business Owner
            </TabsTrigger>
          </TabsList>

          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <TabsContent value="hunter" className="space-y-4 mt-0">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Your password"
                  required
                />
              </div>
            </TabsContent>

            <TabsContent value="business" className="space-y-4 mt-0">
              <div className="space-y-2">
                <Label htmlFor="business-email">Business Email</Label>
                <Input
                  id="business-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="business@email.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="business-password">Password</Label>
                <Input
                  id="business-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Your password"
                  required
                />
              </div>

              {mode === 'signup' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="business-name">Business Name *</Label>
                    <Input
                      id="business-name"
                      value={businessData.name}
                      onChange={(e) => setBusinessData({ ...businessData, name: e.target.value })}
                      placeholder="Your Business Name"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="business-phone">Phone Number *</Label>
                    <Input
                      id="business-phone"
                      type="tel"
                      value={businessData.phone}
                      onChange={(e) => setBusinessData({ ...businessData, phone: e.target.value })}
                      placeholder="(555) 123-4567"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="business-address">Business Address *</Label>
                    <Textarea
                      id="business-address"
                      value={businessData.address}
                      onChange={(e) => setBusinessData({ ...businessData, address: e.target.value })}
                      placeholder="123 Main St, City, State 12345"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="business-category">Category *</Label>
                    <Select 
                      value={businessData.category} 
                      onValueChange={(value) => setBusinessData({ ...businessData, category: value })}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select your business category" />
                      </SelectTrigger>
                      <SelectContent>
                        {DEAL_CATEGORIES.slice(1).map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="business-description">Business Description</Label>
                    <Textarea
                      id="business-description"
                      value={businessData.description}
                      onChange={(e) => setBusinessData({ ...businessData, description: e.target.value })}
                      placeholder="Tell customers about your business..."
                      rows={3}
                    />
                  </div>
                </>
              )}
            </TabsContent>

            <div className="space-y-4">
              <Button
                type="submit"
                className="w-full"
                variant={userType === 'business' ? 'hero' : 'default'}
                disabled={loading}
              >
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {mode === 'signin' ? 'Sign In' : 'Create Account'}
              </Button>

              <div className="text-center">
                {mode === 'signin' ? (
                  <p className="text-sm text-muted-foreground">
                    Don't have an account?{' '}
                    <Button
                      type="button"
                      variant="link"
                      className="p-0 h-auto"
                      onClick={() => onModeChange('signup')}
                    >
                      Sign up
                    </Button>
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Already have an account?{' '}
                    <Button
                      type="button"
                      variant="link"
                      className="p-0 h-auto"
                      onClick={() => onModeChange('signin')}
                    >
                      Sign in
                    </Button>
                  </p>
                )}
              </div>
            </div>
          </form>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}