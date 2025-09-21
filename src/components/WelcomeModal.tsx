import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Plus, Sparkles, ArrowRight, BarChart3 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface WelcomeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  businessName?: string;
}

export function WelcomeModal({ open, onOpenChange, businessName }: WelcomeModalProps) {
  const navigate = useNavigate();
  const [closing, setClosing] = useState(false);

  const handleCreateDeal = () => {
    setClosing(true);
    setTimeout(() => {
      onOpenChange(false);
      navigate('/create-deal?from=welcome');
    }, 300);
  };

  const handleGoToDashboard = () => {
    setClosing(true);
    setTimeout(() => {
      onOpenChange(false);
      navigate('/dashboard');
    }, 300);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`sm:max-w-md text-center transition-all duration-300 ${closing ? 'scale-95 opacity-0' : 'scale-100 opacity-100'}`}>
        <DialogHeader className="space-y-4">
          <div className="relative mx-auto">
            <div className="w-20 h-20 mx-auto bg-gradient-primary rounded-full flex items-center justify-center mb-4 animate-scale-in">
              <Plus className="w-10 h-10 text-white animate-pulse" />
            </div>
            <div className="absolute inset-0 w-20 h-20 mx-auto rounded-full border-4 border-primary/30 animate-ping" />
            <Sparkles className="w-6 h-6 text-primary absolute -top-2 -right-2 animate-bounce" />
          </div>
          
          <DialogTitle className="text-2xl font-bold">
            🎉 Welcome to the Community!
          </DialogTitle>
          
          <div className="space-y-3">
            <Badge variant="secondary" className="gap-1 animate-fade-in">
              <Sparkles className="w-3 h-3" />
              Account Verified
            </Badge>
            
            <p className="text-muted-foreground">
              {businessName ? `Great news, ${businessName}!` : 'Great news!'} Your account is verified and ready to go. 
              Let's create your first deal to start attracting customers.
            </p>
          </div>
        </DialogHeader>

        <div className="space-y-3 mt-6">
          <Button
            size="default"
            className="w-full gap-2 animate-fade-in"
            onClick={handleCreateDeal}
            style={{ animationDelay: '0.1s' }}
          >
            <Plus className="w-4 h-4" />
            Create My First Deal
            <ArrowRight className="w-4 h-4" />
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">or</span>
            </div>
          </div>

          <Button
            variant="outline"
            size="default"
            className="w-full gap-2 animate-fade-in"
            onClick={handleGoToDashboard}
            style={{ animationDelay: '0.2s' }}
          >
            <BarChart3 className="w-4 h-4" />
            I'm not ready, take me to dashboard
          </Button>
        </div>

        <div className="mt-6 p-3 bg-primary/5 border border-primary/20 rounded-lg animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <p className="text-xs text-muted-foreground">
            💡 <strong>Pro tip:</strong> Creating your first deal helps establish your presence and attracts your first customers!
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}