import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Circle, Upload, MapPin, Phone, FileText, Store } from 'lucide-react';
import { Business } from '@/types/database';

interface ProfileProgressProps {
  business?: Partial<Business>;
  className?: string;
}

export function ProfileProgress({ business, className = '' }: ProfileProgressProps) {
  const steps = [
    {
      id: 'name',
      label: 'Business Name',
      icon: Store,
      completed: !!business?.name,
      required: true,
    },
    {
      id: 'description',
      label: 'Description',
      icon: FileText,
      completed: !!business?.description,
      required: true,
    },
    {
      id: 'category',
      label: 'Category',
      icon: Circle,
      completed: !!business?.category,
      required: true,
    },
    {
      id: 'address',
      label: 'Address',
      icon: MapPin,
      completed: !!business?.address,
      required: true,
    },
    {
      id: 'phone',
      label: 'Phone Number',
      icon: Phone,
      completed: !!business?.phone,
      required: false,
    },
    {
      id: 'logo',
      label: 'Logo/Image',
      icon: Upload,
      completed: !!business?.logo_url,
      required: false,
    },
  ];

  const completedSteps = steps.filter(step => step.completed).length;
  const requiredSteps = steps.filter(step => step.required).length;
  const completedRequiredSteps = steps.filter(step => step.required && step.completed).length;
  
  const progress = (completedSteps / steps.length) * 100;
  const isComplete = completedRequiredSteps === requiredSteps;

  const getNextStep = () => {
    return steps.find(step => step.required && !step.completed);
  };

  const nextStep = getNextStep();

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Profile Completion</h3>
          <p className="text-sm text-muted-foreground">
            {completedRequiredSteps}/{requiredSteps} required fields completed
            {nextStep && ` • Next: ${nextStep.label}`}
          </p>
        </div>
        {isComplete ? (
          <Badge variant="default" className="bg-success text-success-foreground">
            Complete
          </Badge>
        ) : (
          <Badge variant="secondary">
            {Math.round(progress)}%
          </Badge>
        )}
      </div>

      <Progress value={progress} className="h-2" />

      <div className="grid grid-cols-2 gap-3">
        {steps.map((step) => {
          const Icon = step.icon;
          return (
            <div
              key={step.id}
              className={`flex items-center gap-2 p-2 rounded-lg border ${
                step.completed
                  ? 'bg-success/10 border-success/20 text-success-foreground'
                  : step.required
                  ? 'bg-muted/50 border-muted-foreground/20'
                  : 'bg-muted/30 border-muted-foreground/10'
              }`}
            >
              {step.completed ? (
                <CheckCircle className="w-4 h-4 text-success" />
              ) : (
                <Icon className="w-4 h-4 text-muted-foreground" />
              )}
              <span className={`text-sm ${
                step.completed ? 'font-medium' : 'text-muted-foreground'
              }`}>
                {step.label}
                {step.required && !step.completed && (
                  <span className="text-destructive ml-1">*</span>
                )}
              </span>
            </div>
          );
        })}
      </div>

      {!isComplete && nextStep && (
        <div className="mt-4 p-3 bg-primary/5 border border-primary/20 rounded-lg">
          <p className="text-sm text-primary">
            <strong>Next Step:</strong> Complete your {nextStep.label.toLowerCase()} to improve your profile visibility.
          </p>
        </div>
      )}
    </div>
  );
}