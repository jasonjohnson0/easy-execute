import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  User, 
  LogOut, 
  Store, 
  Share2,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { AuthModal } from './AuthModal';
import { ShareModal } from './ShareModal';
import { CategoryFilter } from './CategoryFilter';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  categories: string[];
}

export function Header({ 
  searchQuery, 
  onSearchChange, 
  selectedCategory, 
  onCategoryChange, 
  categories 
}: HeaderProps) {
  const { user, loading, signOut } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [userType, setUserType] = useState<'hunter' | 'business'>('hunter');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleAuthClick = (mode: 'signin' | 'signup', type: 'hunter' | 'business') => {
    setAuthMode(mode);
    setUserType(type);
    setShowAuthModal(true);
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              LocalDeals
            </h1>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4 flex-1 max-w-2xl mx-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search deals, businesses..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10 pr-4"
              />
            </div>
          </div>

          {/* Desktop User Actions */}
          <div className="hidden md:flex items-center space-x-2">
            {loading ? (
              <div className="w-8 h-8 animate-pulse bg-muted rounded-full" />
            ) : user ? (
              <div className="flex items-center space-x-2">
                {user.businessProfile && (
                  <Badge variant="secondary" className="gap-1">
                    <Store className="w-3 h-3" />
                    Business
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowShareModal(true)}
                  className="gap-2"
                >
                  <Share2 className="w-4 h-4" />
                  Share Deals!
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => signOut()}
                  className="gap-2 text-destructive hover:text-destructive"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleAuthClick('signin', 'hunter')}
                >
                  Sign In
                </Button>
                <Button
                  variant="hero"
                  size="sm"
                  onClick={() => handleAuthClick('signup', 'business')}
                >
                  Join as Business
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        {/* Mobile Search */}
        <div className="md:hidden px-4 pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search deals, businesses..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 pr-4"
            />
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t bg-background">
            <div className="container py-4 px-4 space-y-4">
              {user ? (
                <div className="space-y-2">
                  {user.businessProfile && (
                    <Badge variant="secondary" className="gap-1">
                      <Store className="w-3 h-3" />
                      Business Account
                    </Badge>
                  )}
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-2"
                    onClick={() => {
                      setShowShareModal(true);
                      setMobileMenuOpen(false);
                    }}
                  >
                    <Share2 className="w-4 h-4" />
                    Share Deals!
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-2 text-destructive hover:text-destructive"
                    onClick={() => {
                      signOut();
                      setMobileMenuOpen(false);
                    }}
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Button
                    variant="ghost"
                    className="w-full"
                    onClick={() => {
                      handleAuthClick('signin', 'hunter');
                      setMobileMenuOpen(false);
                    }}
                  >
                    Sign In
                  </Button>
                  <Button
                    variant="hero"
                    className="w-full"
                    onClick={() => {
                      handleAuthClick('signup', 'business');
                      setMobileMenuOpen(false);
                    }}
                  >
                    Join as Business
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Category Filter */}
        <CategoryFilter 
          categories={categories}
          selectedCategory={selectedCategory}
          onCategoryChange={onCategoryChange}
        />
      </header>

      {/* Modals */}
      <AuthModal
        open={showAuthModal}
        onOpenChange={setShowAuthModal}
        mode={authMode}
        userType={userType}
        onModeChange={setAuthMode}
        onUserTypeChange={setUserType}
      />

      {user && (
        <ShareModal
          open={showShareModal}
          onOpenChange={setShowShareModal}
          referralCode={user.userProfile?.referral_code || user.businessProfile?.referral_code || ''}
        />
      )}
    </>
  );
}