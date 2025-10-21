'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface FormFieldProps {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: 'text' | 'number';
  variant?: 'default' | 'primary' | 'secondary' | 'success';
  className?: string;
}

export function FormField({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  variant = 'default',
  className = '',
}: FormFieldProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return 'border-slate-300 focus:border-blue-500 focus:ring-blue-500';
      case 'secondary':
        return 'border-slate-300 focus:border-slate-500 focus:ring-slate-500';
      case 'success':
        return 'border-slate-300 focus:border-green-500 focus:ring-green-500';
      default:
        return 'border-slate-300 focus:border-slate-500 focus:ring-slate-500';
    }
  };

  return (
    <div className={`space-y-2 w-full ${className}`}>
       <Label className="text-sm font-medium text-slate-700">
         {label}
       </Label>
       <Input
         type={type}
         value={value || ''}
         onChange={(e) => onChange(e.target.value)}
         className={`${getVariantStyles()} transition-colors`}
         placeholder={placeholder || `Enter ${label.toLowerCase()}`}
       />
     </div>
   );
}