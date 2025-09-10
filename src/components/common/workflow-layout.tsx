'use client';

import { usePathname } from 'next/navigation';
import { StepIndicator } from '@/components/ui/step-indicator';
import { getStepsForIndicator, getCurrentStepIndex } from '@/lib/constants/workflow';
import { Card } from '@/components/ui/card';

interface WorkflowLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

export function WorkflowLayout({ children, title, description }: WorkflowLayoutProps) {
  const pathname = usePathname();
  const currentStep = getCurrentStepIndex(pathname);
  const steps = getStepsForIndicator();

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Step Indicator */}
      <div className="mb-8">
        <Card className="p-4 md:p-6">
          <div className="mb-4 md:mb-6">
            <h1 className="text-xl md:text-2xl font-bold text-center mb-2">Analysis Workflow</h1>
            <p className="text-muted-foreground text-center text-sm">
              Follow these steps to complete your document analysis
            </p>
          </div>
          <StepIndicator
            steps={steps}
            currentStep={currentStep}
            className="max-w-4xl mx-auto"
          />
        </Card>
      </div>

      {/* Page Title */}
      {(title || description) && (
        <div className="mb-8 text-center">
          {title && <h2 className="text-2xl md:text-3xl font-bold">{title}</h2>}
          {description && (
            <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
              {description}
            </p>
          )}
        </div>
      )}

      {/* Page Content */}
      {children}
    </div>
  );
}
