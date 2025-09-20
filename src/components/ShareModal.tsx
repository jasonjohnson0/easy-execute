import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Copy, QrCode, Link2, Check, Share2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import QRCode from 'qrcode';

interface ShareModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  referralCode: string;
}

export function ShareModal({ open, onOpenChange, referralCode }: ShareModalProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('link');

  const referralLink = `${window.location.origin}?ref=${referralCode}`;

  useEffect(() => {
    if (open && referralCode) {
      // Generate QR code
      QRCode.toDataURL(referralLink, {
        width: 200,
        margin: 2,
        color: {
          dark: '#1e293b',
          light: '#ffffff'
        }
      })
        .then(url => setQrCodeUrl(url))
        .catch(err => console.error('Error generating QR code:', err));
    }
  }, [open, referralCode, referralLink]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      toast({
        title: "Link copied!",
        description: "Referral link has been copied to your clipboard.",
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

  const shareToSocial = (platform: 'twitter' | 'facebook' | 'whatsapp') => {
    const message = "Check out these amazing local deals on LocalDeals!";
    const encodedMessage = encodeURIComponent(message);
    const encodedUrl = encodeURIComponent(referralLink);

    let shareUrl = '';
    
    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodedMessage}&url=${encodedUrl}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodedMessage}%20${encodedUrl}`;
        break;
    }

    window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold flex items-center justify-center gap-2">
            <Share2 className="w-6 h-6" />
            Share Deals!
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* How it works */}
          <div className="bg-gradient-secondary/10 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">How it works:</h3>
            <ol className="text-sm text-muted-foreground space-y-1">
              <li>1. Share your unique link or QR code with friends</li>
              <li>2. When they join LocalDeals using your link</li>
              <li>3. You both earn rewards and exclusive deals!</li>
            </ol>
          </div>

          {/* Share Options */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="link" className="gap-2">
                <Link2 className="w-4 h-4" />
                Share Link
              </TabsTrigger>
              <TabsTrigger value="qr" className="gap-2">
                <QrCode className="w-4 h-4" />
                QR Code
              </TabsTrigger>
            </TabsList>

            <TabsContent value="link" className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Your Referral Link</label>
                <div className="flex gap-2">
                  <Input
                    value={referralLink}
                    readOnly
                    className="flex-1"
                  />
                  <Button
                    variant={copied ? "success" : "outline"}
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
              <div className="space-y-2">
                <label className="text-sm font-medium">Share on Social Media</label>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => shareToSocial('twitter')}
                    className="flex-1"
                  >
                    Twitter
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => shareToSocial('facebook')}
                    className="flex-1"
                  >
                    Facebook
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => shareToSocial('whatsapp')}
                    className="flex-1"
                  >
                    WhatsApp
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="qr" className="space-y-4">
              <div className="text-center space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Scan to Join LocalDeals</label>
                  <div className="bg-white p-4 rounded-lg border inline-block">
                    {qrCodeUrl ? (
                      <img src={qrCodeUrl} alt="Referral QR Code" className="w-48 h-48" />
                    ) : (
                      <div className="w-48 h-48 bg-muted animate-pulse rounded" />
                    )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Badge variant="secondary" className="text-xs">
                    Referral Code: {referralCode}
                  </Badge>
                  <p className="text-xs text-muted-foreground">
                    Friends can also enter this code manually when signing up
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}