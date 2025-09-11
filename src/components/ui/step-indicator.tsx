'use client';

import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface Step {
  id: string;
  title: string;
  description?: string;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
  className?: string;
}

export function StepIndicator({
  steps,
  currentStep,
  className,
}: StepIndicatorProps) {
  return (
    <div className={cn('w-full', className)}>
      {/* Desktop View */}
      <div className="hidden md:flex items-center justify-between">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;
          const isUpcoming = stepNumber > currentStep;

          return (
            <div key={step.id} className="flex items-center flex-1">
              {/* Step Circle */}
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    'flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-300',
                    {
                      'bg-green-500 border-green-500 text-white': isCompleted,
                      'bg-blue-500 border-blue-500 text-white': isCurrent,
                      'bg-gray-100 border-gray-300 text-gray-400': isUpcoming,
                    }
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <span className="text-xs font-medium">{stepNumber}</span>
                  )}
                </div>

                {/* Step Title */}
                <div className="mt-1 text-center max-w-20">
                  <p
                    className={cn(
                      'text-xs font-medium transition-colors duration-300',
                      {
                        'text-green-600': isCompleted,
                        'text-blue-600': isCurrent,
                        'text-gray-400': isUpcoming,
                      }
                    )}
                  >
                    {step.title}
                  </p>
                </div>
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="flex-1 mx-2">
                  <div
                    className={cn('h-0.5 transition-colors duration-300', {
                      'bg-green-500': stepNumber < currentStep,
                      'bg-gray-300': stepNumber >= currentStep,
                    })}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile View */}
      <div className="md:hidden">
        <div className="flex items-center justify-center mb-3">
          <div className="text-center">
            <div className="text-xs text-gray-500 mb-1">
              Step {currentStep} of {steps.length}
            </div>
            <div className="w-48 bg-gray-200 rounded-full h-1.5">
              <div
                className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / steps.length) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Current Step Info */}
        {steps[currentStep - 1] && (
          <div className="text-center">
            <h3 className="text-sm font-medium text-blue-600">
              {steps[currentStep - 1].title}
            </h3>
          </div>
        )}
      </div>
    </div>
  );
}
