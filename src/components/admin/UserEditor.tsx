import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useUserManagement } from '@/hooks/useUserManagement';
import { 
  Shield, 
  ShieldOff, 
  Ban, 
  Unlock, 
  UserX, 
  Calendar,
  AlertTriangle,
  Clock,
  User
} from 'lucide-react';
import { format } from 'date-fns';

interface User {
  id: string;
  email: string;
  role: string;
  status: string;
  banned_until?: string;
  ban_reason?: string;
  created_at: string;
  last_sign_in_at?: string;
  business_profile?: {
    business_name: string;
    category: string;
  };
}

interface UserEditorProps {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserEditor({ user, open, onOpenChange }: UserEditorProps) {
  const [banDuration, setBanDuration] = useState<string>('24');
  const [banReason, setBanReason] = useState('');
  const [disableReason, setDisableReason] = useState('');
  const [actionType, setActionType] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const userManagement = useUserManagement();

  if (!user) return null;

  const isAdmin = user.role === 'admin';
  const isBanned = user.status === 'banned';
  const isDisabled = user.status === 'disabled';
  const isActive = user.status === 'active' || !user.status;

  const handleAction = (action: string) => {
    setActionType(action);
    setShowConfirm(true);
  };

  const confirmAction = async () => {
    if (!actionType || !user) return;

    try {
      switch (actionType) {
        case 'ban':
          const hours = banDuration === 'permanent' ? undefined : parseInt(banDuration);
          await userManagement.banUser(user.id, hours, banReason || 'Banned by administrator');
          break;
        
        case 'unban':
          await userManagement.unbanUser(user.id);
          break;
        
        case 'disable':
          await userManagement.disableUser(user.id, disableReason || 'Account disabled by administrator');
          break;
        
        case 'promote':
          await userManagement.promoteToAdmin(user.email);
          break;
        
        case 'demote':
          await userManagement.demoteFromAdmin(user.email);
          break;
      }

      setShowConfirm(false);
      setActionType(null);
      setBanReason('');
      setDisableReason('');
      onOpenChange(false);
    } catch (error) {
      console.error('Action failed:', error);
      setShowConfirm(false);
    }
  };

  const getStatusBadge = () => {
    if (isBanned) {
      return (
        <Badge variant="destructive" className="gap-1">
          <Ban className="w-3 h-3" />
          Banned
        </Badge>
      );
    }
    if (isDisabled) {
      return (
        <Badge variant="secondary" className="gap-1">
          <UserX className="w-3 h-3" />
          Disabled
        </Badge>
      );
    }
    return (
      <Badge variant="default" className="gap-1">
        <User className="w-3 h-3" />
        Active
      </Badge>
    );
  };

  const getActionDescription = () => {
    switch (actionType) {
      case 'ban':
        const duration = banDuration === 'permanent' ? 'permanently' : `for ${banDuration} hours`;
        return `Ban user ${duration}? ${banReason ? `Reason: ${banReason}` : ''}`;
      
      case 'unban':
        return 'Remove ban and restore user access?';
      
      case 'disable':
        return `Disable user account permanently? ${disableReason ? `Reason: ${disableReason}` : ''}`;
      
      case 'promote':
        return `Grant admin privileges to ${user.email}?`;
      
      case 'demote':
        return `Remove admin privileges from ${user.email}?`;
      
      default:
        return '';
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              User Management: {user.email}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* User Info */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">User Information</h3>
                {getStatusBadge()}
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="text-muted-foreground">Email</Label>
                  <p className="font-medium">{user.email}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Role</Label>
                  <div className="flex items-center gap-2">
                    {isAdmin && <Shield className="w-4 h-4 text-red-500" />}
                    <span className="font-medium capitalize">{user.role}</span>
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Created</Label>
                  <p>{format(new Date(user.created_at), 'MMM dd, yyyy')}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Last Login</Label>
                  <p>{user.last_sign_in_at 
                    ? format(new Date(user.last_sign_in_at), 'MMM dd, yyyy')
                    : 'Never'
                  }</p>
                </div>
              </div>

              {user.business_profile && (
                <div>
                  <Label className="text-muted-foreground">Business Account</Label>
                  <p className="font-medium">{user.business_profile.business_name}</p>
                  <p className="text-sm text-muted-foreground">{user.business_profile.category}</p>
                </div>
              )}

              {/* Ban/Disable Status */}
              {(isBanned || isDisabled) && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  <AlertDescription>
                    <div className="space-y-1">
                      <p className="font-medium text-red-800">
                        Account {isBanned ? 'Banned' : 'Disabled'}
                      </p>
                      {user.ban_reason && (
                        <p className="text-red-700">Reason: {user.ban_reason}</p>
                      )}
                      {isBanned && user.banned_until && (
                        <div className="flex items-center gap-1 text-red-700">
                          <Clock className="w-3 h-3" />
                          <span>Until: {format(new Date(user.banned_until), 'MMM dd, yyyy HH:mm')}</span>
                        </div>
                      )}
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </div>

            <Separator />

            {/* Action Sections */}
            <div className="space-y-6">
              {/* Admin Actions */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Administrative Actions</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {!isAdmin ? (
                    <Button
                      variant="outline"
                      className="gap-2"
                      onClick={() => handleAction('promote')}
                    >
                      <Shield className="w-4 h-4" />
                      Promote to Admin
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      className="gap-2"
                      onClick={() => handleAction('demote')}
                    >
                      <ShieldOff className="w-4 h-4" />
                      Remove Admin
                    </Button>
                  )}

                  {isActive && (
                    <Button
                      variant="outline"
                      className="gap-2 text-red-600 hover:text-red-700"
                      onClick={() => handleAction('disable')}
                    >
                      <UserX className="w-4 h-4" />
                      Disable Account
                    </Button>
                  )}
                </div>
              </div>

              {/* Ban Actions */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Access Control</h3>
                
                {isActive || isDisabled ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="banDuration">Ban Duration</Label>
                      <Select value={banDuration} onValueChange={setBanDuration}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select duration" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 Hour</SelectItem>
                          <SelectItem value="6">6 Hours</SelectItem>
                          <SelectItem value="24">24 Hours</SelectItem>
                          <SelectItem value="168">1 Week</SelectItem>
                          <SelectItem value="720">30 Days</SelectItem>
                          <SelectItem value="permanent">Permanent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="banReason">Ban Reason (Optional)</Label>
                      <Textarea
                        id="banReason"
                        value={banReason}
                        onChange={(e) => setBanReason(e.target.value)}
                        placeholder="Reason for banning this user..."
                        rows={3}
                      />
                    </div>

                    <Button
                      variant="destructive"
                      className="gap-2"
                      onClick={() => handleAction('ban')}
                    >
                      <Ban className="w-4 h-4" />
                      Ban User
                    </Button>
                  </div>
                ) : isBanned && (
                  <Button
                    variant="outline"
                    className="gap-2"
                    onClick={() => handleAction('unban')}
                  >
                    <Unlock className="w-4 h-4" />
                    Unban User
                  </Button>
                )}
              </div>

              {/* Disable Reason (when disabling) */}
              {actionType === 'disable' && (
                <div className="space-y-2">
                  <Label htmlFor="disableReason">Disable Reason (Optional)</Label>
                  <Textarea
                    id="disableReason"
                    value={disableReason}
                    onChange={(e) => setDisableReason(e.target.value)}
                    placeholder="Reason for disabling this account..."
                    rows={3}
                  />
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              Confirm Action
            </DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <p>{getActionDescription()}</p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirm(false)}>
              Cancel
            </Button>
            <Button 
              variant={actionType === 'ban' || actionType === 'disable' ? 'destructive' : 'default'}
              onClick={confirmAction}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}