'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, CheckCircle, X } from 'lucide-react';
import { ValidationError } from './validation';

interface ValidationPanelProps {
  errors: ValidationError[];
  isVisible: boolean;
  onClose: () => void;
  onFieldFocus?: (fieldPath: string) => void;
}

export function ValidationPanel({ errors, isVisible, onClose, onFieldFocus }: ValidationPanelProps) {
  if (!isVisible) return null;

  const hasErrors = errors.length > 0;

  const groupedErrors = errors.reduce((acc, error) => {
    const category = error.path?.split('.')[0] || 'general';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(error);
    return acc;
  }, {} as Record<string, ValidationError[]>);

  const getCategoryTitle = (category: string): string => {
    switch (category) {
      case 'measurements':
        return 'Roof Measurements';
      case 'pitch_breakdown':
        return 'Pitch Breakdown';
      case 'waste_table':
        return 'Waste Table';
      case 'sections':
        return 'Insurance Sections';
      case 'claim_id':
      case 'date':
      case 'price_list':
        return 'Basic Information';
      default:
        return 'General';
    }
  };

  const handleFieldClick = (fieldPath: string) => {
    if (onFieldFocus) {
      onFieldFocus(fieldPath);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[80vh] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex items-center gap-3">
            {hasErrors ? (
              <AlertTriangle className="h-5 w-5 text-destructive" />
            ) : (
              <CheckCircle className="h-5 w-5 text-green-600" />
            )}
            <div>
              <CardTitle className="text-lg">
                {hasErrors ? 'Validation Errors' : 'Validation Passed'}
              </CardTitle>
              <CardDescription>
                {hasErrors 
                  ? `Found ${errors.length} issue${errors.length === 1 ? '' : 's'} that need attention`
                  : 'All data validation checks passed successfully'
                }
              </CardDescription>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="overflow-y-auto max-h-[60vh]">
          {hasErrors ? (
            <div className="space-y-6">
              {Object.entries(groupedErrors).map(([category, categoryErrors]) => (
                <div key={category} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-sm">{getCategoryTitle(category)}</h3>
                    <Badge variant="destructive" className="text-xs">
                      {categoryErrors.length} error{categoryErrors.length === 1 ? '' : 's'}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    {categoryErrors.map((error, index) => (
                      <div 
                        key={`${category}-${index}`}
                        className="border border-destructive/20 rounded-lg p-3 bg-destructive/5"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-destructive mb-1">
                              {error.field.replace(/\[\d+\]/g, '').replace(/\./g, ' → ')}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {error.message}
                            </p>
                          </div>
                          {error.path && onFieldFocus && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs h-7 px-2"
                              onClick={() => handleFieldClick(error.path!)}
                            >
                              Go to field
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              
              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground">
                  Please fix these issues before generating the final report. 
                  You can still save your progress with validation errors.
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="font-medium text-lg mb-2">All Good!</h3>
              <p className="text-muted-foreground">
                Your data has passed all validation checks and is ready for final report generation.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Inline validation component for individual fields
interface FieldValidationProps {
  errors: ValidationError[];
  fieldPath: string;
  className?: string;
}

export function FieldValidation({ errors, fieldPath, className = '' }: FieldValidationProps) {
  const fieldErrors = errors.filter(error => error.path === fieldPath);
  
  if (fieldErrors.length === 0) return null;

  return (
    <div className={`space-y-1 ${className}`}>
      {fieldErrors.map((error, index) => (
        <div key={index} className="flex items-center gap-2 text-sm text-destructive">
          <AlertTriangle className="h-3 w-3 flex-shrink-0" />
          <span>{error.message}</span>
        </div>
      ))}
    </div>
  );
}

// Validation summary component
interface ValidationSummaryProps {
  errors: ValidationError[];
  className?: string;
}

export function ValidationSummary({ errors, className = '' }: ValidationSummaryProps) {
  const hasErrors = errors.length > 0;
  
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {hasErrors ? (
        <>
          <AlertTriangle className="h-4 w-4 text-destructive" />
          <span className="text-sm text-destructive font-medium">
            {errors.length} validation error{errors.length === 1 ? '' : 's'}
          </span>
        </>
      ) : (
        <>
          <CheckCircle className="h-4 w-4 text-green-600" />
          <span className="text-sm text-green-600 font-medium">
            All validation checks passed
          </span>
        </>
      )}
    </div>
  );
}