import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { 
  LogOut, 
  Store, 
  Share2,
  Menu,
  X,
  Plus,
  ChevronDown,
  Heart,
  Shield
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { useFavoritesQuery } from "@/hooks/useFavoritesQuery";
import { AuthModal } from './AuthModal';
import { ShareModal } from './ShareModal';
import { ProfileDropdown } from './ProfileDropdown';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  categories: string[];
}

export function Header({ categories }: HeaderProps) {
  // Force cache refresh - removed search functionality
  const { user, loading, signOut } = useAuth();
  const { isAdmin } = useAdminAuth();
  const { favorites } = useFavoritesQuery();
  const navigate = useNavigate();
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

          {/* Spacer for layout */}
          <div className="flex-1"></div>

          {/* Desktop User Actions */}
          <div className="hidden md:flex items-center space-x-2">
            {loading ? (
              <div className="w-8 h-8 animate-pulse bg-muted rounded-full" />
            ) : user ? (
              <div className="flex items-center space-x-2">
                {/* Favorites Button */}
                <Button 
                  variant="ghost" 
                  onClick={() => navigate('/favorites')}
                  className="relative gap-2"
                >
                  <Heart className="h-4 w-4" />
                  Favorites
                  {favorites.length > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
                    >
                      {favorites.length}
                    </Badge>
                  )}
                </Button>

                {user.businessProfile && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="pulse-business gap-1 px-2 py-1 h-auto">
                        <Store className="w-3 h-3" />
                        Business
                        <ChevronDown className="w-3 h-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem 
                        onClick={() => navigate('/dashboard')}
                        className="gap-2"
                      >
                        <Store className="w-4 h-4" />
                        Dashboard
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => navigate('/create-deal')}
                        className="gap-2 pulse-business"
                      >
                        <Plus className="w-4 h-4" />
                        Add New Offer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
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
                {isAdmin && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate('/admin')}
                    className="gap-2 text-orange-600 hover:text-orange-700"
                  >
                    <Shield className="w-4 h-4" />
                    Admin
                  </Button>
                )}
                <ProfileDropdown />
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


        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t bg-background">
            <div className="container py-4 px-4 space-y-4">
              {user ? (
                <div className="space-y-2">
                  {/* Mobile Favorites Button */}
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-2"
                    onClick={() => {
                      navigate('/favorites');
                      setMobileMenuOpen(false);
                    }}
                  >
                    <Heart className="w-4 h-4" />
                    Favorites ({favorites.length})
                  </Button>

                  {user.businessProfile && (
                    <div className="space-y-2">
                      <div className="pulse-business rounded px-2 py-1 text-xs font-medium flex items-center gap-1">
                        <Store className="w-3 h-3" />
                        Business Account
                      </div>
                      <Button
                        variant="ghost"
                        className="w-full justify-start gap-2"
                        onClick={() => {
                          navigate('/dashboard');
                          setMobileMenuOpen(false);
                        }}
                      >
                        <Store className="w-4 h-4" />
                        Dashboard
                      </Button>
                      <Button
                        variant="ghost"
                        className="w-full justify-start gap-2 pulse-business"
                        onClick={() => {
                          navigate('/create-deal');
                          setMobileMenuOpen(false);
                        }}
                      >
                        <Plus className="w-4 h-4" />
                        Add New Offer
                      </Button>
                    </div>
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
                  {isAdmin && (
                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-2 text-orange-600 hover:text-orange-700"
                      onClick={() => {
                        navigate('/admin');
                        setMobileMenuOpen(false);
                      }}
                    >
                      <Shield className="w-4 h-4" />
                      Admin Dashboard
                    </Button>
                  )}
                  <div className="w-full" onClick={() => setMobileMenuOpen(false)}>
                    <ProfileDropdown />
                  </div>
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