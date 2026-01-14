'use client';

import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface AddButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'secondary' | 'success';
  size?: 'sm' | 'default';
  fullWidth?: boolean;
  dashed?: boolean;
  className?: string;
}

export function AddButton({
  onClick,
  children,
  variant = 'default',
  size = 'default',
  fullWidth = false,
  dashed = false,
  className = '',
}: AddButtonProps) {
  const getVariantStyles = () => {
    const baseStyles = dashed ? 'border-dashed' : '';

    switch (variant) {
      case 'primary':
        return `${baseStyles} ${dashed ? 'border-blue-300 text-blue-600 hover:bg-blue-50 hover:border-blue-400' : 'bg-blue-600 hover:bg-blue-700 text-white'}`;
      case 'secondary':
        return `${baseStyles} ${dashed ? 'border-slate-300 text-slate-600 hover:bg-slate-50 hover:border-slate-400' : 'bg-slate-600 hover:bg-slate-700 text-white'}`;
      case 'success':
        return `${baseStyles} ${dashed ? 'border-green-300 text-green-600 hover:bg-green-50 hover:border-green-400' : 'bg-green-600 hover:bg-green-700 text-white'}`;
      default:
        return `${baseStyles} ${dashed ? 'border-slate-300 text-slate-600 hover:bg-slate-50 hover:border-slate-400' : 'bg-slate-600 hover:bg-slate-700 text-white'}`;
    }
  };

  return (
    <Button
      type="button"
      variant={dashed ? 'outline' : 'default'}
      size={size}
      onClick={onClick}
      className={`${getVariantStyles()} ${fullWidth ? 'w-full' : ''} shadow-sm ${className}`}
    >
      <Plus className="h-4 w-4 mr-2" />
      {children}
    </Button>
  );
}
