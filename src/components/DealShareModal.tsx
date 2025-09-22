import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Copy, Share2, Check, Facebook, Twitter, MessageCircle, Mail, QrCode } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Deal, SponsoredOffer } from '@/types/database';
import { useAnalyticsTracking } from '@/hooks/useAnalyticsTracking';
import { useAnalytics } from '@/lib/analytics/tracker';
import QRCode from 'qrcode';

interface DealShareModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deal: Deal | (SponsoredOffer & { businesses?: { name: string; category?: string } });
}

export function DealShareModal({ open, onOpenChange, deal }: DealShareModalProps) {
  const [copied, setCopied] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  
  const { trackShareClick } = useAnalyticsTracking();
  const analytics = useAnalytics();
  
  // Create different URLs for QR codes vs sharing links to prevent double tracking
  const shareUrl = `${window.location.origin}/?deal=${deal.id}`;
  const qrCodeUrl_internal = `${window.location.origin}/?deal=${deal.id}&qr=true`;

  // Generate QR code when modal opens
  useEffect(() => {
    if (open && !qrCodeUrl) {
      QRCode.toDataURL(qrCodeUrl_internal, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      })
        .then(setQrCodeUrl)
        .catch(console.error);
    }
  }, [open, qrCodeUrl_internal, qrCodeUrl]);

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
      await navigator.clipboard.writeText(`${shareMessage}\n\n${shareUrl}`);
      setCopied(true);
      
      // Track copy link action
      analytics.track('link_copied', {
        dealId: deal.id,
        dealTitle: deal.title,
        businessId: deal.business_id
      });
      
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
    const encodedUrl = encodeURIComponent(shareUrl);

    let socialShareUrl = '';
    
    switch (platform) {
      case 'twitter':
        socialShareUrl = `https://twitter.com/intent/tweet?text=${encodedMessage}&url=${encodedUrl}`;
        break;
      case 'facebook':
        socialShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedMessage}`;
        break;
      case 'whatsapp':
        socialShareUrl = `https://wa.me/?text=${encodedMessage}%20${encodedUrl}`;
        break;
      case 'email':
        const subject = encodeURIComponent(`Great Deal: ${deal.title}`);
        const body = encodeURIComponent(`${shareMessage}\n\nView this deal: ${shareUrl}`);
        socialShareUrl = `mailto:?subject=${subject}&body=${body}`;
        break;
    }

    // Track share click
    if (deal.business_id) {
      trackShareClick(deal.id, deal.business_id, platform);
    }
    
    analytics.dealShare(deal.id, deal.title, platform);

    if (platform === 'email') {
      window.location.href = socialShareUrl;
    } else {
      window.open(socialShareUrl, '_blank', 'width=600,height=400');
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

          {/* Tabbed Content */}
          <Tabs defaultValue="link" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="link" className="flex items-center gap-2">
                <Share2 className="w-4 h-4" />
                Share Link
              </TabsTrigger>
              <TabsTrigger value="qr" className="flex items-center gap-2">
                <QrCode className="w-4 h-4" />
                QR Code
              </TabsTrigger>
            </TabsList>

            <TabsContent value="link" className="space-y-4 mt-4">
              {/* Share Link */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Share Link</label>
                <div className="flex gap-2">
                   <Input
                    value={shareUrl}
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
                      // Track native share
                      analytics.dealShare(deal.id, deal.title, 'native_share');
                      
                      await navigator.share({
                        title: deal.title,
                        text: shareMessage,
                        url: shareUrl,
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
            </TabsContent>

            <TabsContent value="qr" className="space-y-4 mt-4">
              <div className="text-center space-y-4">
                <label className="text-sm font-medium">Scan QR Code to View Deal</label>
                <div className="flex justify-center">
                  <div className="bg-white p-4 rounded-lg border shadow-sm">
                    {qrCodeUrl ? (
                      <img 
                        src={qrCodeUrl} 
                        alt="QR Code for deal"
                        className="w-48 h-48"
                      />
                    ) : (
                      <div className="w-48 h-48 bg-muted rounded animate-pulse flex items-center justify-center">
                        <QrCode className="w-12 h-12 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-xs text-muted-foreground font-mono break-all px-4">
                  {qrCodeUrl_internal}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}