import { StepIndicator } from '@/components/ui/step-indicator';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  getStepsForIndicator,
  getStepRoutesForTask,
  WORKFLOW_STEPS,
} from '@/lib/constants/workflow';
import { FileText, Hash, ChartNoAxesGantt } from 'lucide-react';

interface WorkflowLayoutProps {
  title?: string;
  description?: string;
  children?: React.ReactNode;
  taskId?: string;
  taskName?: string;
  currentStep?: number;
  hrefMap?: Record<string, string>;
  tooltipMap?: Record<string, string>;
}

export function WorkflowLayout({
  title = '',
  description = '',
  children,
  taskId,
  taskName,
  currentStep = 1,
  hrefMap = {},
  tooltipMap = {},
}: WorkflowLayoutProps) {
  const steps = getStepsForIndicator();
  const hrefs = hrefMap ?? (taskId ? getStepRoutesForTask(taskId) : undefined);

  const nameText = taskName ?? 'Analysis Workflow';
  const Icon =
    WORKFLOW_STEPS[
      Math.max(0, Math.min(currentStep - 1, WORKFLOW_STEPS.length - 1))
    ]?.icon ?? FileText;

  return (
    <div className="min-h-screen bg-gray-50/30">
      <div className="container mx-auto py-4">
        {/* Step Indicator */}
        <div className="mb-4">
          <Card className="p-3">
            <div className="mb-2">
              <h1 className="text-base md:text-lg font-semibold mb-1">
                <div className="flex items-center gap-2 justify-center md:justify-start">
                  <ChartNoAxesGantt className="size-5 text-muted-foreground" />
                  <span className="text-base md:text-lg font-semibold">
                    {nameText}
                  </span>
                  {taskId && (
                    <Badge variant="outline" className="text-xs">
                      <Hash className="size-3" />
                      {taskId}
                    </Badge>
                  )}
                </div>
              </h1>
              <p className="text-muted-foreground text-center md:text-left text-xs">
                Follow these steps to complete your document analysis
              </p>
            </div>
            <StepIndicator
              steps={steps}
              currentStep={currentStep}
              className="w-full"
              hrefs={hrefs}
              tooltips={tooltipMap}
            />
          </Card>
        </div>

        {/* Page Title */}
        {(title || description) && (
          <div className="mb-4 text-center md:text-left">
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
