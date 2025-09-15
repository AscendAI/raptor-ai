'use client';

import { usePathname } from 'next/navigation';
import { StepIndicator } from '@/components/ui/step-indicator';
import {
  getStepsForIndicator,
  getCurrentStepIndex,
} from '@/lib/constants/workflow';
import { Card } from '@/components/ui/card';

interface WorkflowLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

export function WorkflowLayout({
  children,
  title,
  description,
}: WorkflowLayoutProps) {
  const pathname = usePathname();
  const currentStep = getCurrentStepIndex(pathname);
  const steps = getStepsForIndicator();

  return (
    <div className="min-h-screen bg-gray-50/30">
      <div className="container mx-auto py-4">
        {/* Step Indicator */}
        <div className="mb-4">
          <Card className="p-3">
            <div className="mb-2">
              <h1 className="text-base md:text-lg font-semibold text-center mb-1">
                Analysis Workflow
              </h1>
              <p className="text-muted-foreground text-center text-xs">
                Follow these steps to complete your document analysis
              </p>
            </div>
            <StepIndicator
              steps={steps}
              currentStep={currentStep}
              className="w-full"
            />
          </Card>
        </div>

        {/* Page Title */}
        {(title || description) && (
          <div className="mb-4 text-center">
            {title && (
              <h2 className="text-xl md:text-2xl font-bold">{title}</h2>
            )}
            {description && (
              <p className="text-muted-foreground mt-1 text-sm">
                {description}
              </p>
            )}
          </div>
        )}

        {/* Page Content */}
        {children}
      </div>
    </div>
  );
}
