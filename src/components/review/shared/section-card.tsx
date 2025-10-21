'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ReactNode } from 'react';

interface SectionCardProps {
  title: string;
  description: string;
  icon: ReactNode;
  children: ReactNode;
  headerAction?: ReactNode;
  variant?: 'default' | 'primary' | 'secondary' | 'success';
}

export function SectionCard({
  title,
  description,
  icon,
  children,
  headerAction,
  variant = 'default',
}: SectionCardProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          header:
            'bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-200',
          iconBg: 'bg-blue-100',
          iconColor: 'text-blue-600',
        };
      case 'secondary':
        return {
          header:
            'bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200',
          iconBg: 'bg-slate-100',
          iconColor: 'text-slate-600',
        };
      case 'success':
        return {
          header:
            'bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-200',
          iconBg: 'bg-green-100',
          iconColor: 'text-green-600',
        };
      default:
        return {
          header:
            'bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200',
          iconBg: 'bg-slate-100',
          iconColor: 'text-slate-600',
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <Card className="shadow-sm border-slate-200 py-0">
      <CardHeader className={`${styles.header} rounded-t-xl pt-4`}>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-3 text-slate-800">
              <div className={`p-2 ${styles.iconBg} rounded-lg`}>
                <div className={`h-5 w-5 ${styles.iconColor}`}>{icon}</div>
              </div>
              {title}
            </CardTitle>
            <CardDescription className="text-slate-600 mt-2">
              {description}
            </CardDescription>
          </div>
          {headerAction && <div>{headerAction}</div>}
        </div>
      </CardHeader>
      <CardContent className="p-6">{children}</CardContent>
    </Card>
  );
}
