"use client";

import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

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

export function StepIndicator({ steps, currentStep, className }: StepIndicatorProps) {
  return (
    <div className={cn("w-full", className)}>
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
                    "flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300",
                    {
                      "bg-primary border-primary text-primary-foreground shadow-lg": isCompleted || isCurrent,
                      "bg-background border-muted-foreground text-muted-foreground": isUpcoming,
                    }
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <span className="text-sm font-medium">{stepNumber}</span>
                  )}
                </div>
                
                {/* Step Title */}
                <div className="mt-2 text-center max-w-24">
                  <p
                    className={cn(
                      "text-sm font-medium transition-colors duration-300",
                      {
                        "text-primary": isCompleted || isCurrent,
                        "text-muted-foreground": isUpcoming,
                      }
                    )}
                  >
                    {step.title}
                  </p>
                  {step.description && (
                    <p className="text-xs text-muted-foreground mt-1 leading-tight">
                      {step.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="flex-1 mx-4">
                  <div
                    className={cn(
                      "h-0.5 transition-colors duration-300",
                      {
                        "bg-primary": stepNumber < currentStep,
                        "bg-muted-foreground/30": stepNumber >= currentStep,
                      }
                    )}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile View */}
      <div className="md:hidden">
        <div className="flex items-center justify-center mb-4">
          <div className="text-center">
            <div className="text-sm text-muted-foreground mb-1">
              Step {currentStep} of {steps.length}
            </div>
            <div className="w-64 bg-muted rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / steps.length) * 100}%` }}
              />
            </div>
          </div>
        </div>
        
        {/* Current Step Info */}
        {steps[currentStep - 1] && (
          <div className="text-center">
            <h3 className="font-medium text-primary">
              {steps[currentStep - 1].title}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {steps[currentStep - 1].description}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}