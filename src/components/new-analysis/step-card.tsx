import { LucideIcon } from 'lucide-react';

interface StepCardProps {
  icon: LucideIcon;
  stepNumber: number;
  title: string;
  description: string;
  colorTheme: 'blue' | 'green' | 'orange' | 'purple' | 'indigo';
}

const colorClasses = {
  blue: {
    background: 'bg-blue-50 dark:bg-blue-900/20',
    border: 'border-blue-200 dark:border-blue-800',
    icon: 'text-blue-600 dark:text-blue-400',
  },
  green: {
    background: 'bg-green-50 dark:bg-green-900/20',
    border: 'border-green-200 dark:border-green-800',
    icon: 'text-green-600 dark:text-green-400',
  },
  orange: {
    background: 'bg-orange-50 dark:bg-orange-900/20',
    border: 'border-orange-200 dark:border-orange-800',
    icon: 'text-orange-600 dark:text-orange-400',
  },
  purple: {
    background: 'bg-purple-50 dark:bg-purple-900/20',
    border: 'border-purple-200 dark:border-purple-800',
    icon: 'text-purple-600 dark:text-purple-400',
  },
  indigo: {
    background: 'bg-indigo-50 dark:bg-indigo-900/20',
    border: 'border-indigo-200 dark:border-indigo-800',
    icon: 'text-indigo-600 dark:text-indigo-400',
  },
};

export function StepCard({
  icon: Icon,
  stepNumber,
  title,
  description,
  colorTheme,
}: StepCardProps) {
  const colors = colorClasses[colorTheme];

  return (
    <div
      className={`flex flex-col items-center border text-center p-4 rounded-lg shadow-xl backdrop-blur-sm shadow-${colors.background} ${colors.background} ${colors.border}`}
    >
      <Icon className={`h-8 w-8 mb-2 ${colors.icon}`} />
      <h3 className="font-semibold text-sm">
        {stepNumber}. {title}
      </h3>
      <p className="text-xs text-muted-foreground mt-1">{description}</p>
    </div>
  );
}
