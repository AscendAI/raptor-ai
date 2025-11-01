'use client';

import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
  variant?: 'default' | 'primary' | 'secondary' | 'success';
}

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  variant = 'default',
}: EmptyStateProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          container: 'bg-blue-50 border-blue-300',
          iconBg: 'bg-blue-100',
          iconColor: 'text-blue-500',
        };
      case 'secondary':
        return {
          container: 'bg-slate-50 border-slate-300',
          iconBg: 'bg-slate-100',
          iconColor: 'text-slate-500',
        };
      case 'success':
        return {
          container: 'bg-green-50 border-green-300',
          iconBg: 'bg-green-100',
          iconColor: 'text-green-500',
        };
      default:
        return {
          container: 'bg-slate-50 border-slate-300',
          iconBg: 'bg-slate-100',
          iconColor: 'text-slate-500',
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <div className={`text-center py-8 rounded-lg border-2 border-dashed ${styles.container}`}>
      <div className={`p-3 ${styles.iconBg} rounded-full w-12 h-12 mx-auto mb-4 flex items-center justify-center`}>
        <Plus className={`h-6 w-6 ${styles.iconColor}`} />
      </div>
      <p className="text-slate-600 font-medium mb-2">
        {title}
      </p>
      <p className="text-slate-500 text-sm mb-4">
        {description}
      </p>
      <Button onClick={onAction} variant="outline" size="sm">
        <Plus className="h-4 w-4 mr-2" />
        {actionLabel}
      </Button>
    </div>
  );
}