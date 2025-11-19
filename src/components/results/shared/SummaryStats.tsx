import React from 'react';
import { Check, X, AlertTriangle, BarChart3 } from 'lucide-react';
import { type ComparisonResult } from '@/lib/types/comparison';

interface SummaryStatsProps {
  summary: ComparisonResult['summary'];
  warningsCount?: number;
}

export function SummaryStats({
  summary,
  warningsCount = 0,
}: SummaryStatsProps) {
  const stats = [
    {
      label: 'Passed',
      value: summary.pass,
      icon: Check,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      borderColor: 'border-green-200 dark:border-green-800',
      accentColor: 'bg-green-500',
    },
    {
      label: 'Failed',
      value: summary.failed,
      icon: X,
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      borderColor: 'border-red-200 dark:border-red-800',
      accentColor: 'bg-red-500',
    },
    {
      label: 'Missing',
      value: summary.missing,
      icon: AlertTriangle,
      color: 'text-yellow-600 dark:text-yellow-400',
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
      borderColor: 'border-yellow-200 dark:border-yellow-800',
      accentColor: 'bg-yellow-500',
    },
    {
      label: 'Warnings',
      value: warningsCount,
      icon: AlertTriangle,
      color: 'text-amber-700 dark:text-amber-400',
      bgColor: 'bg-amber-50 dark:bg-amber-900/20',
      borderColor: 'border-amber-200 dark:border-amber-800',
      accentColor: 'bg-amber-500',
    },
    {
      label: 'Total',
      value: summary.total,
      icon: BarChart3,
      color: 'text-gray-600 dark:text-gray-400',
      bgColor: 'bg-gray-50 dark:bg-gray-900/20',
      borderColor: 'border-gray-200 dark:border-gray-800',
      accentColor: 'bg-gray-400',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {stats.map((stat) => {
        const IconComponent = stat.icon;
        return (
          <div
            key={stat.label}
            className={`p-4 rounded-lg border transition-all hover:shadow-sm ${stat.bgColor} ${stat.borderColor}`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`p-2 rounded-full ${stat.accentColor}/10 border ${stat.borderColor}`}
              >
                <IconComponent className={`h-4 w-4 ${stat.color}`} />
              </div>
              <div className="flex-1">
                <p className={`text-2xl font-bold ${stat.color}`}>
                  {stat.value}
                </p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
