import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Copy, Share2, Check, Facebook, Twitter, MessageCircle, Mail } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Deal, SponsoredOffer } from '@/types/database';

interface DealShareModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deal: Deal | (SponsoredOffer & { businesses?: { name: string; category?: string } });
}

export function DealShareModal({ open, onOpenChange, deal }: DealShareModalProps) {
  const [copied, setCopied] = useState(false);

  const dealUrl = `${window.location.origin}/?deal=${deal.id}`;

  const getDiscountText = () => {
    if (deal.discount_type === 'percentage') {
      return `${deal.discount_value}% OFF`;
    } else if (deal.discount_type === 'fixed') {
      return `$${deal.discount_value} OFF`;
    } else {
      return deal.discount_value;
    }
  };

  const shareMessage = `Check out this amazing deal: ${deal.title} - ${getDiscountText()} at ${deal.businesses?.name || 'Local Business'}! 🔥`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(`${shareMessage}\n\n${dealUrl}`);
      setCopied(true);
      
      toast({
        title: "Link copied!",
        description: "Deal link has been copied to your clipboard.",
      });
      
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please copy the link manually.",
        variant: "destructive"
      });
    }
  };

  const shareToSocial = (platform: 'twitter' | 'facebook' | 'whatsapp' | 'email') => {
    const encodedMessage = encodeURIComponent(shareMessage);
    const encodedUrl = encodeURIComponent(dealUrl);

    let shareUrl = '';
    
    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodedMessage}&url=${encodedUrl}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedMessage}`;
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodedMessage}%20${encodedUrl}`;
        break;
      case 'email':
        const subject = encodeURIComponent(`Great Deal: ${deal.title}`);
        const body = encodeURIComponent(`${shareMessage}\n\nView this deal: ${dealUrl}`);
        shareUrl = `mailto:?subject=${subject}&body=${body}`;
        break;
    }

    if (platform === 'email') {
      window.location.href = shareUrl;
    } else {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold flex items-center justify-center gap-2">
            <Share2 className="w-5 h-5" />
            Share This Deal
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Deal Preview */}
          <div className="bg-gradient-to-r from-primary/10 to-secondary/10 p-4 rounded-lg border">
            <div className="flex items-start gap-3">
              <div className="deal-highlight text-lg font-bold px-3 py-1 rounded">
                {getDiscountText()}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold truncate">{deal.title}</h3>
                <p className="text-sm text-muted-foreground">{deal.businesses?.name}</p>
              </div>
            </div>
          </div>

          {/* Share Link */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Share Link</label>
            <div className="flex gap-2">
              <Input
                value={dealUrl}
                readOnly
                className="flex-1"
              />
              <Button
                variant={copied ? "default" : "outline"}
                size="sm"
                onClick={copyToClipboard}
                className="gap-2 px-3"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Social Sharing */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Share on Social Media</label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => shareToSocial('twitter')}
                className="gap-2"
              >
                <Twitter className="w-4 h-4" />
                Twitter
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => shareToSocial('facebook')}
                className="gap-2"
              >
                <Facebook className="w-4 h-4" />
                Facebook
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => shareToSocial('whatsapp')}
                className="gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                WhatsApp
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => shareToSocial('email')}
                className="gap-2"
              >
                <Mail className="w-4 h-4" />
                Email
              </Button>
            </div>
          </div>

          {/* Native Share API (if available) */}
          {navigator.share && (
            <Button
              variant="default"
              onClick={async () => {
                try {
                  await navigator.share({
                    title: deal.title,
                    text: shareMessage,
                    url: dealUrl,
                  });
                } catch (err) {
                  // User cancelled or error occurred
                  console.log('Share cancelled or failed');
                }
              }}
              className="w-full gap-2"
            >
              <Share2 className="w-4 h-4" />
              Share Deal
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}