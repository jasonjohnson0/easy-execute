import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ValidatedInput } from '@/components/ui/validated-input';
import { useBusinessHours, useUpdateBusinessHours, type BusinessHours } from '@/hooks/useBusinessHours';
import { useAuth } from '@/hooks/useAuth';
import { Clock, Save } from 'lucide-react';

const DAYS_OF_WEEK = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
];

interface BusinessHoursManagerProps {
  businessId?: string;
}

export function BusinessHoursManager({ businessId }: BusinessHoursManagerProps) {
  const { user } = useAuth();
  const { data: hoursData = [], isLoading } = useBusinessHours(businessId || user?.id);
  const updateHoursMutation = useUpdateBusinessHours();
  
  const [hours, setHours] = useState<Omit<BusinessHours, 'id'>[]>([]);

  useEffect(() => {
    if (hoursData.length > 0) {
      setHours(hoursData.map(({ id, ...rest }) => rest));
    } else if (businessId || user?.id) {
      // Initialize with default closed hours for all days
      setHours(DAYS_OF_WEEK.map((_, index) => ({
        business_id: businessId || user?.id || '',
        day_of_week: index,
        open_time: null,
        close_time: null,
        is_closed: true,
      })));
    }
  }, [hoursData, businessId, user?.id]);

  const updateDayHours = (dayIndex: number, field: keyof Omit<BusinessHours, 'id' | 'business_id' | 'day_of_week'>, value: string | boolean) => {
    setHours(prev => prev.map(day => 
      day.day_of_week === dayIndex 
        ? { ...day, [field]: value }
        : day
    ));
  };

  const handleSave = () => {
    updateHoursMutation.mutate(hours);
  };

  const validateTime = (time: string) => {
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(time);
  };

  if (isLoading) {
    return <div className="text-center">Loading business hours...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Business Hours
        </CardTitle>
        <CardDescription>
          Set your operating hours for each day of the week
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {DAYS_OF_WEEK.map((dayName, index) => {
          const dayHours = hours.find(h => h.day_of_week === index);
          
          return (
            <div key={index} className="flex items-center gap-4 p-4 border rounded-lg">
              <div className="w-24 font-medium">{dayName}</div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  checked={!dayHours?.is_closed}
                  onCheckedChange={(checked) => updateDayHours(index, 'is_closed', !checked)}
                />
                <Label htmlFor={`open-${index}`}>Open</Label>
              </div>
              
              {!dayHours?.is_closed && (
                <div className="flex items-center gap-2 ml-4">
                  <ValidatedInput
                    type="time"
                    value={dayHours?.open_time || ''}
                    onChange={(e) => updateDayHours(index, 'open_time', e.target.value)}
                    validation={(value) => !value || validateTime(value)}
                    errorMessage="Please enter a valid time"
                    className="w-32"
                    placeholder="09:00"
                  />
                  <span className="text-muted-foreground">to</span>
                  <ValidatedInput
                    type="time"
                    value={dayHours?.close_time || ''}
                    onChange={(e) => updateDayHours(index, 'close_time', e.target.value)}
                    validation={(value) => !value || validateTime(value)}
                    errorMessage="Please enter a valid time"
                    className="w-32"
                    placeholder="17:00"
                  />
                </div>
              )}
              
              {dayHours?.is_closed && (
                <span className="text-muted-foreground ml-4">Closed</span>
              )}
            </div>
          );
        })}
        
        <Button 
          onClick={handleSave} 
          disabled={updateHoursMutation.isPending}
          className="w-full"
        >
          <Save className="h-4 w-4 mr-2" />
          {updateHoursMutation.isPending ? 'Saving...' : 'Save Business Hours'}
        </Button>
      </CardContent>
    </Card>
  );
}