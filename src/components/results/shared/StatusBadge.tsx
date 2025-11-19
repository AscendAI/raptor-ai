import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Check, X, AlertTriangle } from 'lucide-react';
import {
  type ComparisonCheckpoint,
  statusConfig,
} from '@/lib/types/comparison';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: ComparisonCheckpoint['status'];
  className?: string;
  variant?: 'default' | 'compact';
}

// Icon mapping for status config icons
const statusIcons = {
  Check,
  X,
  AlertTriangle,
} as const;

export function StatusBadge({
  status,
  className,
  variant = 'default',
}: StatusBadgeProps) {
  const config = statusConfig[status];
  const IconComponent = statusIcons[config.icon as keyof typeof statusIcons];

  if (variant === 'compact') {
    return (
      <div
        className={cn(
          'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm',
          {
            'bg-emerald-100 text-emerald-800 border border-emerald-300':
              status === 'pass',
            'bg-red-100 text-red-800 border border-red-300':
              status === 'failed',
            'bg-amber-100 text-amber-800 border border-amber-300':
              status === 'missing',
          },
          className
        )}
      >
        <IconComponent className="h-3.5 w-3.5" />
        <span>{config.label}</span>
      </div>
    );
  }

  return (
    <Badge
      variant="outline"
      className={cn(
        'font-medium',
        config.color,
        config.bgColor,
        config.borderColor,
        className
      )}
    >
      {config.label}
    </Badge>
  );
}
