import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';
import {
  Calendar,
  Clock,
  Eye,
  Printer,
  Share2,
  Heart,
  MapPin,
  Tag,
  Copy,
  Facebook,
  Twitter,
  MessageCircle,
  Mail,
  X,
  ExternalLink
} from 'lucide-react';
import { format } from 'date-fns';
import { Deal, SponsoredOffer } from '@/types/database';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useFavoritesQuery } from '@/hooks/useFavoritesQuery';
import { useAuth } from '@/hooks/useAuth';
import { DealShareModal } from '@/components/DealShareModal';

interface DealDetailsModalProps {
  deal: Deal | (SponsoredOffer & { businesses?: { name: string; category?: string } });
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isSponsored?: boolean;
}

export function DealDetailsModal({ deal, open, onOpenChange, isSponsored = false }: DealDetailsModalProps) {
  const { user } = useAuth();
  const { isFavorited, toggleFavorite } = useFavoritesQuery();
  const [printing, setPrinting] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  const isSponsoredOffer = (deal: Deal | (SponsoredOffer & { businesses?: { name: string } })): deal is SponsoredOffer & { businesses?: { name: string } } => {
    return 'offer_type' in deal;
  };

  const handleFavoriteClick = () => {
    if (!isSponsoredOffer(deal)) {
      toggleFavorite(deal.id);
    }
  };

  const updatePrintCount = async () => {
    try {
      if (!isSponsoredOffer(deal)) {
        await supabase
          .from('deals')
          .update({ prints: (deal.prints || 0) + 1 })
          .eq('id', deal.id);
      }
    } catch (error) {
      console.error('Error updating print count:', error);
    }
  };

  const handlePrint = async () => {
    setPrinting(true);
    
    try {
      await updatePrintCount();
      
      // Create print window with deal content
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        const printContent = `
          <!DOCTYPE html>
          <html>
            <head>
              <title>LocalDeals Coupon - ${deal.title}</title>
              <style>
                @media print {
                  body { margin: 0; font-family: Arial, sans-serif; }
                  .coupon { 
                    max-width: 6in; 
                    margin: 0 auto; 
                    border: 2px dashed #333; 
                    padding: 20px;
                    page-break-inside: avoid;
                  }
                  .header { text-align: center; margin-bottom: 20px; }
                  .business-name { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
                  .deal-title { font-size: 20px; color: #c2410c; margin-bottom: 15px; }
                  .discount { 
                    background: #fed7aa; 
                    padding: 15px; 
                    text-align: center; 
                    font-size: 28px; 
                    font-weight: bold; 
                    margin: 20px 0; 
                    border-radius: 8px;
                  }
                  .description { margin: 15px 0; line-height: 1.6; }
                  .terms { font-size: 12px; color: #666; margin-top: 20px; }
                  .expires { text-align: center; font-weight: bold; margin-top: 15px; }
                  .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #999; }
                }
                @media screen {
                  body { padding: 20px; background: #f5f5f5; }
                  .coupon { 
                    max-width: 600px; 
                    margin: 0 auto; 
                    border: 2px dashed #333; 
                    padding: 30px; 
                    background: white;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                  }
                }
              </style>
            </head>
            <body>
              <div class="coupon">
                <div class="header">
                  <div class="business-name">${deal.businesses?.name || 'Local Business'}</div>
                  <div class="deal-title">${deal.title}</div>
                </div>
                
                <div class="discount">
                  ${deal.discount_type === 'percentage' ? `${deal.discount_value}% OFF` :
                    deal.discount_type === 'fixed' ? `$${deal.discount_value} OFF` :
                    deal.discount_value}
                </div>
                
                <div class="description">${deal.description}</div>
                
                ${deal.terms ? `<div class="terms"><strong>Terms & Conditions:</strong> ${deal.terms}</div>` : ''}
                
                ${deal.expires_at ? `
                  <div class="expires">
                    Expires: ${format(new Date(deal.expires_at), 'MMMM d, yyyy')}
                  </div>
                ` : ''}
                
                <div class="footer">
                  <p>Present this coupon to redeem offer</p>
                  <p>LocalDeals - Connecting you with local savings</p>
                </div>
              </div>
            </body>
          </html>
        `;
        
        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.focus();
        
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 250);

        toast({
          title: "Coupon ready!",
          description: "Your coupon is ready to print.",
        });
      }
    } catch (error) {
      toast({
        title: "Print failed",
        description: "Unable to prepare coupon for printing.",
        variant: "destructive"
      });
    }
    
    setPrinting(false);
  };

  const handleShare = () => {
    setShowShareModal(true);
  };

  const copyToClipboard = async () => {
    try {
      const dealUrl = `${window.location.origin}/?deal=${deal.id}`;
      await navigator.clipboard.writeText(dealUrl);
      toast({
        title: "Link copied!",
        description: "Deal link copied to clipboard.",
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Unable to copy link to clipboard.",
        variant: "destructive"
      });
    }
  };

  const getDiscountDisplay = () => {
    if (deal.discount_type === 'percentage') {
      return `${deal.discount_value}% OFF`;
    } else if (deal.discount_type === 'fixed') {
      return `$${deal.discount_value} OFF`;
    } else {
      return deal.discount_value;
    }
  };

  const isExpiringSoon = deal.expires_at && 
    new Date(deal.expires_at).getTime() - Date.now() < 3 * 24 * 60 * 60 * 1000; // 3 days

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <DialogTitle className="text-xl font-bold pr-8">
                  {deal.title}
                </DialogTitle>
                <p className="text-muted-foreground mt-1">
                  {deal.businesses?.name}
                </p>
              </div>
              {isSponsored && (
                <Badge variant="secondary" className="text-xs font-bold">
                  SPONSORED
                </Badge>
              )}
            </div>
          </DialogHeader>

          {/* Deal Preview Card */}
          <Card className="coupon-style border-2 border-dashed">
            <CardContent className="p-6">
              <div className="text-center mb-6">
                <div className="deal-highlight text-4xl font-bold px-6 py-4 rounded-lg inline-block mb-4">
                  {getDiscountDisplay()}
                </div>
                <h2 className="text-2xl font-bold mb-2">{deal.title}</h2>
                <p className="text-lg text-muted-foreground">{deal.businesses?.name}</p>
              </div>

              <Separator className="my-6" />

              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-muted-foreground leading-relaxed">{deal.description}</p>
                </div>

                {deal.terms && (
                  <div>
                    <h3 className="font-semibold mb-2">Terms & Conditions</h3>
                    <p className="text-sm text-muted-foreground">{deal.terms}</p>
                  </div>
                )}

                <Separator />

                <div className="flex flex-wrap gap-4 text-sm">
                  {deal.businesses?.category && (
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4 text-muted-foreground" />
                      <span>{deal.businesses.category}</span>
                    </div>
                  )}

                  {deal.expires_at && (
                    <div className={`flex items-center gap-2 ${isExpiringSoon ? 'text-warning font-medium' : ''}`}>
                      <Calendar className="w-4 h-4" />
                      <span>
                        Expires {format(new Date(deal.expires_at), 'MMMM d, yyyy')}
                      </span>
                    </div>
                  )}

                  {!isSponsoredOffer(deal) && (
                    <>
                      <div className="flex items-center gap-2">
                        <Eye className="w-4 h-4 text-muted-foreground" />
                        <span>{deal.views} views</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Printer className="w-4 h-4 text-muted-foreground" />
                        <span>{deal.prints} prints</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {isExpiringSoon && (
                <div className="mt-6 p-3 bg-warning/10 border border-warning/20 rounded-lg">
                  <div className="flex items-center gap-2 text-warning font-medium">
                    <Clock className="w-4 h-4" />
                    <span>This deal expires soon!</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 pt-4">
            {!isSponsoredOffer(deal) ? (
              <Button
                onClick={handlePrint}
                disabled={printing}
                className="flex-1 min-w-[140px]"
              >
                <Printer className="w-4 h-4 mr-2" />
                {printing ? 'Preparing...' : 'Print Coupon'}
              </Button>
            ) : (
              <Button
                onClick={() => {
                  if (deal.banner_link_url) {
                    window.open(deal.banner_link_url, '_blank');
                  }
                }}
                className="flex-1 min-w-[140px]"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Learn More
              </Button>
            )}

            <Button
              variant="outline"
              onClick={handleShare}
              className="flex-1 min-w-[120px]"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>

            <Button
              variant="outline"
              onClick={copyToClipboard}
              className="flex-1 min-w-[120px]"
            >
              <Copy className="w-4 h-4 mr-2" />
              Copy Link
            </Button>

            {!isSponsoredOffer(deal) && user && (
              <Button
                variant="outline"
                onClick={handleFavoriteClick}
                className="flex-1 min-w-[120px]"
              >
                <Heart 
                  className={`w-4 h-4 mr-2 ${
                    isFavorited(deal.id) 
                      ? 'fill-red-500 text-red-500' 
                      : 'text-muted-foreground'
                  }`} 
                />
                {isFavorited(deal.id) ? 'Favorited' : 'Add to Favorites'}
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <DealShareModal 
        open={showShareModal} 
        onOpenChange={setShowShareModal}
        deal={deal}
      />
    </>
  );
}