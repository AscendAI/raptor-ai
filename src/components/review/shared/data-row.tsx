'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2 } from 'lucide-react';
import { ReactNode } from 'react';

interface DataRowProps {
  children: ReactNode;
  onRemove?: () => void;
  badge?: ReactNode;
  variant?: 'default' | 'primary' | 'secondary' | 'success';
  className?: string;
  gridClassName?: string;
}

export function DataRow({
  children,
  onRemove,
  badge,
  variant = 'default',
  className = '',
  gridClassName,
}: DataRowProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return 'bg-blue-50 border-blue-200';
      case 'secondary':
        return 'bg-slate-50 border-slate-200';
      case 'success':
        return 'bg-green-50 border-green-200';
      default:
        return 'bg-slate-50 border-slate-200';
    }
  };

  return (
    <div className={`p-4 border rounded-lg ${getVariantStyles()} ${className}`}>
      {badge && (
        <div className="flex items-center justify-between mb-4">
          {badge}
          {onRemove && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onRemove}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 h-6 w-6 p-0"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          )}
        </div>
      )}
      <div className={`grid ${gridClassName || 'grid-cols-1 md:grid-cols-4'} gap-4`}>
        {children}
        {onRemove && !badge && (
          <div className="flex items-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onRemove}
              className="text-red-600 border-red-300 hover:bg-red-50 hover:border-red-400"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}