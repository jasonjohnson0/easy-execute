import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { usePlatformUsers, useAdminManagement } from '@/hooks/usePlatformData';
import { UserEditor } from '@/components/admin/UserEditor';
import { Users, Shield, Plus, Edit, Ban, UserX, User, Clock } from 'lucide-react';
import { format } from 'date-fns';

export function UserManagement() {
  const { data: users, isLoading, error, refetch } = usePlatformUsers();
  const { addAdmin, removeAdmin } = useAdminManagement();
  const { toast } = useToast();
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isUserEditorOpen, setIsUserEditorOpen] = useState(false);

  const handleAddAdmin = async () => {
    if (!newAdminEmail.trim()) {
      toast({
        title: "Error",
        description: "Please enter an email address",
        variant: "destructive",
      });
      return;
    }

    try {
      await addAdmin(newAdminEmail);
      toast({
        title: "Success",
        description: `Admin role assigned to ${newAdminEmail}`,
      });
      setNewAdminEmail('');
      setIsDialogOpen(false);
      refetch();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add admin",
        variant: "destructive",
      });
    }
  };

  const handleRemoveAdmin = async (email: string) => {
    if (!confirm(`Are you sure you want to remove admin access for ${email}?`)) {
      return;
    }

    try {
      await removeAdmin(email);
      toast({
        title: "Success",
        description: `Admin role removed from ${email}`,
      });
      refetch();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to remove admin",
        variant: "destructive",
      });
    }
  };

  const openUserEditor = (user: any) => {
    setSelectedUser(user);
    setIsUserEditorOpen(true);
  };

  const getUserStatusBadge = (user: any) => {
    if (user.status === 'banned') {
      return (
        <Badge variant="destructive" className="gap-1">
          <Ban className="w-3 h-3" />
          Banned
        </Badge>
      );
    }
    if (user.status === 'disabled') {
      return (
        <Badge variant="secondary" className="gap-1">
          <UserX className="w-3 h-3" />
          Disabled
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="gap-1">
        <User className="w-3 h-3" />
        Active
      </Badge>
    );
  };

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-destructive">
            Error loading users: {error.message}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          <CardTitle>User Management</CardTitle>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Add Admin
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Platform Administrator</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={newAdminEmail}
                  onChange={(e) => setNewAdminEmail(e.target.value)}
                  placeholder="Enter email address"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddAdmin}>
                  Add Admin
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8">Loading users...</div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Account Type</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users?.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.email}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={user.role === 'admin' ? 'destructive' : 'secondary'}
                        className="gap-1"
                      >
                        {user.role === 'admin' && <Shield className="h-3 w-3" />}
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {getUserStatusBadge(user)}
                      {user.banned_until && user.status === 'banned' && (
                        <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Until: {format(new Date(user.banned_until), 'MMM dd, yyyy')}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {user.business_profile ? 'Business' : 'Consumer'}
                      </Badge>
                      {user.business_profile && (
                        <div className="text-xs text-muted-foreground mt-1">
                          {user.business_profile.business_name}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {format(new Date(user.created_at), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell>
                      {user.last_sign_in_at 
                        ? format(new Date(user.last_sign_in_at), 'MMM dd, yyyy')
                        : 'Never'
                      }
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openUserEditor(user)}
                          className="gap-1"
                        >
                          <Edit className="h-3 w-3" />
                          Edit
                        </Button>
                        {user.role === 'admin' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRemoveAdmin(user.email)}
                            className="gap-1 text-destructive hover:text-destructive"
                          >
                            <Shield className="h-3 w-3" />
                            Remove Admin
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      {/* User Editor Modal */}
      <UserEditor
        user={selectedUser}
        open={isUserEditorOpen}
        onOpenChange={(open) => {
          setIsUserEditorOpen(open);
          if (!open) {
            setSelectedUser(null);
            refetch(); // Refresh data when editor closes
          }
        }}
      />
    </Card>
  );
}