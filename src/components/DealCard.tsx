import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { MapPin, Eye, Printer, Clock, Calendar, Heart, Tag, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { Deal, SponsoredOffer } from "@/types/database";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useFavoritesQuery } from "@/hooks/useFavoritesQuery";
import { useAuth } from "@/hooks/useAuth";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";
import { DealDetailsModal } from "@/components/DealDetailsModal";

interface DealCardProps {
  deal: Deal | (SponsoredOffer & { businesses?: { name: string; category?: string } });
  layout?: 'grid' | 'coupon';
  isSponsored?: boolean;
}

export function DealCard({ deal, layout = 'grid', isSponsored = false }: DealCardProps) {
  const { user } = useAuth();
  const { isFavorited, toggleFavorite, isToggling } = useFavoritesQuery();
  const { addRecentlyViewed } = useRecentlyViewed();
  const [printing, setPrinting] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const isSponsoredOffer = (deal: Deal | (SponsoredOffer & { businesses?: { name: string } })): deal is SponsoredOffer & { businesses?: { name: string } } => {
    return 'offer_type' in deal;
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering parent click events
    if (!isSponsoredOffer(deal)) {
      toggleFavorite(deal.id);
    }
  };

  const updateViewCount = async () => {
    try {
      if (isSponsoredOffer(deal)) {
        await (supabase as any)
          .from('sponsored_offers')
          .update({ views: (deal.views || 0) + 1 })
          .eq('id', deal.id);
      } else {
        await (supabase as any)
          .from('deals')
          .update({ views: (deal.views || 0) + 1 })
          .eq('id', deal.id);
      }
    } catch (error) {
      console.error('Error updating view count:', error);
    }
  };

  const updatePrintCount = async () => {
    try {
      if (!isSponsoredOffer(deal)) {
        await (supabase as any)
          .from('deals')
          .update({ prints: (deal.prints || 0) + 1 })
          .eq('id', deal.id);
      }
    } catch (error) {
      console.error('Error updating print count:', error);
    }
  };

  const handleViewDetails = () => {
    updateViewCount();
    addRecentlyViewed(deal);
    setShowDetailsModal(true);
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
        
        // Small delay before printing to ensure content is loaded
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

  if (layout === 'coupon') {
    return (
      <Card className={`coupon-style ${isSponsored ? 'ring-2 ring-secondary' : ''} hover:-translate-y-1 hover:shadow-deal transition-all duration-300`}>
        {isSponsored && (
          <div className="absolute -top-2 -right-2 z-10">
            <Badge variant="secondary" className="text-xs font-bold">
              SPONSORED
            </Badge>
          </div>
        )}
        
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-bold text-lg leading-tight">{deal.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {deal.businesses?.name}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {!isSponsoredOffer(deal) && user && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleFavoriteClick}
                  className="p-1 h-auto hover:bg-accent/50"
                >
                  <Heart 
                    className={`h-4 w-4 ${
                      isFavorited(deal.id) 
                        ? 'fill-red-500 text-red-500' 
                        : 'text-muted-foreground hover:text-red-500'
                    }`} 
                  />
                </Button>
              )}
              <div className="text-right">
                <div className="deal-highlight text-2xl font-bold px-3 py-1 rounded-lg">
                  {getDiscountDisplay()}
                </div>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pb-3">
          <p className="text-sm mb-3">{deal.description}</p>
          
          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            {deal.businesses?.category && (
              <span className="flex items-center gap-1">
                <Tag className="w-3 h-3" />
                {deal.businesses.category}
              </span>
            )}
            
            {deal.expires_at && (
              <span className={`flex items-center gap-1 ${isExpiringSoon ? 'text-warning font-medium' : ''}`}>
                <Calendar className="w-3 h-3" />
                Expires {format(new Date(deal.expires_at), 'MMM d')}
              </span>
            )}
            
            {!isSponsoredOffer(deal) && (
              <>
                <span className="flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  {deal.views} views
                </span>
                <span className="flex items-center gap-1">
                  <Printer className="w-3 h-3" />
                  {deal.prints} prints
                </span>
              </>
            )}
          </div>
        </CardContent>

        <Separator />

        <CardFooter className="pt-3">
          <div className="flex gap-2 w-full">
            <Button
              variant="outline"
              size="sm"
              onClick={handleViewDetails}
              className="flex-1"
            >
              <ExternalLink className="w-4 h-4" />
              View Details
            </Button>
            
            {!isSponsoredOffer(deal) ? (
              <Button
                variant="default"
                size="sm"
                onClick={handlePrint}
                disabled={printing}
                className="flex-1"
              >
                <Printer className="w-4 h-4" />
                {printing ? 'Preparing...' : 'Print Coupon'}
              </Button>
            ) : (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  if (deal.banner_link_url) {
                    window.open(deal.banner_link_url, '_blank');
                  } else {
                    handleViewDetails();
                  }
                }}
                className="flex-1"
              >
                <ExternalLink className="w-4 h-4" />
                Learn More
              </Button>
            )}
          </div>
        </CardFooter>

        <DealDetailsModal
          deal={deal}
          open={showDetailsModal}
          onOpenChange={setShowDetailsModal}
          isSponsored={isSponsored}
        />
      </Card>
    );
  }

  // Grid layout (compact)
  return (
    <Card className={`deal-card ${isSponsored ? 'ring-2 ring-secondary' : ''} group cursor-pointer`} onClick={handleViewDetails}>
      {isSponsored && (
        <Badge variant="secondary" className="absolute top-2 right-2 text-xs font-bold z-10">
          SPONSORED
        </Badge>
      )}
      
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold leading-tight truncate group-hover:text-primary transition-colors">
              {deal.title}
            </h3>
            <p className="text-sm text-muted-foreground truncate">
              {deal.businesses?.name}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {!isSponsoredOffer(deal) && user && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleFavoriteClick}
                className="p-1 h-auto hover:bg-accent/50"
              >
                <Heart 
                  className={`h-4 w-4 ${
                    isFavorited(deal.id) 
                      ? 'fill-red-500 text-red-500' 
                      : 'text-muted-foreground hover:text-red-500'
                  }`} 
                />
              </Button>
            )}
            <div className="deal-highlight text-sm font-bold px-2 py-1 rounded whitespace-nowrap">
              {getDiscountDisplay()}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pb-3">
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {deal.description}
        </p>
        
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-3">
            {!isSponsoredOffer(deal) && (
              <>
                <span className="flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  {deal.views}
                </span>
                <span className="flex items-center gap-1">
                  <Printer className="w-3 h-3" />
                  {deal.prints}
                </span>
              </>
            )}
          </div>
          
          {deal.expires_at && (
            <span className={`flex items-center gap-1 ${isExpiringSoon ? 'text-warning font-medium' : ''}`}>
              <Clock className="w-3 h-3" />
              {isExpiringSoon ? 'Expires soon!' : format(new Date(deal.expires_at), 'MMM d')}
            </span>
          )}
        </div>
      </CardContent>

      <DealDetailsModal
        deal={deal}
        open={showDetailsModal}
        onOpenChange={setShowDetailsModal}
        isSponsored={isSponsored}
      />
    </Card>
  );
}