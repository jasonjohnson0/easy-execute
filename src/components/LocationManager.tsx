import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ValidatedInput } from '@/components/ui/validated-input';
import { useLocation } from '@/hooks/useLocation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { MapPin, Navigation, Save } from 'lucide-react';

interface LocationManagerProps {
  businessId: string;
  initialLatitude?: number;
  initialLongitude?: number;
  initialTimezone?: string;
}

export function LocationManager({ 
  businessId, 
  initialLatitude, 
  initialLongitude, 
  initialTimezone = 'America/New_York' 
}: LocationManagerProps) {
  const [latitude, setLatitude] = useState(initialLatitude?.toString() || '');
  const [longitude, setLongitude] = useState(initialLongitude?.toString() || '');
  const [timezone, setTimezone] = useState(initialTimezone);
  
  const { location, loading, getCurrentLocation } = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateLocationMutation = useMutation({
    mutationFn: async () => {
      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);
      
      if (isNaN(lat) || isNaN(lng)) {
        throw new Error('Invalid coordinates');
      }

      const { error } = await supabase
        .from('businesses')
        .update({
          latitude: lat,
          longitude: lng,
          timezone: timezone,
        })
        .eq('id', businessId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business', businessId] });
      toast({
        title: "Success",
        description: "Business location updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update business location",
        variant: "destructive",
      });
      console.error('Error updating location:', error);
    },
  });

  const handleDetectLocation = () => {
    getCurrentLocation();
  };

  // Update form fields when location is detected
  if (location && (latitude !== location.latitude.toString() || longitude !== location.longitude.toString())) {
    setLatitude(location.latitude.toString());
    setLongitude(location.longitude.toString());
  }

  const validateCoordinate = (value: string, type: 'lat' | 'lng') => {
    const num = parseFloat(value);
    if (isNaN(num)) return false;
    
    if (type === 'lat') {
      return num >= -90 && num <= 90;
    } else {
      return num >= -180 && num <= 180;
    }
  };

  const isFormValid = () => {
    return validateCoordinate(latitude, 'lat') && validateCoordinate(longitude, 'lng') && timezone.trim() !== '';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Business Location
        </CardTitle>
        <CardDescription>
          Set your business location and timezone for accurate open/closed status
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleDetectLocation}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <Navigation className="h-4 w-4" />
            {loading ? 'Detecting...' : 'Detect Current Location'}
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Latitude</label>
            <ValidatedInput
              type="number"
              step="any"
              value={latitude}
              onChange={(e) => setLatitude(e.target.value)}
              validation={(value) => !value || validateCoordinate(value, 'lat')}
              errorMessage="Enter a valid latitude (-90 to 90)"
              placeholder="40.7128"
            />
          </div>
          
          <div>
            <label className="text-sm font-medium">Longitude</label>
            <ValidatedInput
              type="number"
              step="any"
              value={longitude}
              onChange={(e) => setLongitude(e.target.value)}
              validation={(value) => !value || validateCoordinate(value, 'lng')}
              errorMessage="Enter a valid longitude (-180 to 180)"
              placeholder="-74.0060"
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium">Timezone</label>
          <ValidatedInput
            type="text"
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            validation={(value) => value.trim() !== ''}
            errorMessage="Timezone is required"
            placeholder="America/New_York"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Use IANA timezone format (e.g., America/New_York, Europe/London)
          </p>
        </div>

        {location && (
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-sm">
              <strong>Detected Location:</strong><br />
              Latitude: {location.latitude.toFixed(6)}<br />
              Longitude: {location.longitude.toFixed(6)}
              {location.accuracy && (
                <>
                  <br />Accuracy: ±{Math.round(location.accuracy)}m
                </>
              )}
            </p>
          </div>
        )}

        <Button 
          onClick={() => updateLocationMutation.mutate()}
          disabled={!isFormValid() || updateLocationMutation.isPending}
          className="w-full"
        >
          <Save className="h-4 w-4 mr-2" />
          {updateLocationMutation.isPending ? 'Saving...' : 'Save Location'}
        </Button>
      </CardContent>
    </Card>
  );
}