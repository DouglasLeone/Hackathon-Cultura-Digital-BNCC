import { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: number;
  icon: ReactNode;
  description?: string;
  variant?: 'default' | 'primary' | 'accent' | 'success';
}

export function StatsCard({ title, value, icon, description, variant = 'default' }: StatsCardProps) {
  const variants = {
    default: 'bg-card',
    primary: 'bg-primary/10 border-primary/20',
    accent: 'bg-accent/10 border-accent/20',
    success: 'bg-success/10 border-success/20',
  };

  const iconVariants = {
    default: 'bg-muted text-muted-foreground',
    primary: 'bg-primary text-primary-foreground',
    accent: 'bg-accent text-accent-foreground',
    success: 'bg-success text-success-foreground',
  };

  return (
    <Card className={cn('card-hover', variants[variant])}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold mt-1">{value}</p>
            {description && (
              <p className="text-xs text-muted-foreground mt-1">{description}</p>
            )}
          </div>
          <div className={cn('p-3 rounded-xl', iconVariants[variant])}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
