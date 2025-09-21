import { useState } from 'react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { User, Settings, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { ProfileModal } from './ProfileModal';

export function ProfileDropdown() {
  const { user, signOut } = useAuth();
  const [showProfileModal, setShowProfileModal] = useState(false);

  if (!user) return null;

  const isBusinessAccount = !!user.businessProfile;
  const displayName = isBusinessAccount 
    ? user.businessProfile?.name 
    : user.email?.split('@')[0];
  const accountType = isBusinessAccount ? 'Business Account' : 'Personal Account';
  
  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="flex items-center gap-2 h-auto py-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.businessProfile?.logo_url} />
              <AvatarFallback className="text-xs">
                {getInitials(displayName || user.email || 'U')}
              </AvatarFallback>
            </Avatar>
            <div className="hidden sm:flex flex-col items-start">
              <span className="text-sm font-medium leading-none">
                {displayName}
              </span>
              <span className="text-xs text-muted-foreground">
                {user.email}
              </span>
            </div>
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent align="end" className="w-64">
          <DropdownMenuLabel className="pb-2">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{displayName}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
              <Badge 
                variant={isBusinessAccount ? "secondary" : "outline"} 
                className="w-fit text-xs"
              >
                {accountType}
              </Badge>
            </div>
          </DropdownMenuLabel>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem 
            onClick={() => setShowProfileModal(true)}
            className="gap-2 cursor-pointer"
          >
            <User className="h-4 w-4" />
            View Profile
          </DropdownMenuItem>
          
          <DropdownMenuItem className="gap-2 cursor-pointer">
            <Settings className="h-4 w-4" />
            Account Settings
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem 
            onClick={() => signOut()}
            className="gap-2 cursor-pointer text-destructive focus:text-destructive"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ProfileModal 
        open={showProfileModal}
        onOpenChange={setShowProfileModal}
      />
    </>
  );
}