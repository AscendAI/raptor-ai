import React from 'react';
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  type ComparisonCheckpoint,
  statusConfig,
} from '@/lib/types/comparison';
import { cn } from '@/lib/utils';
import { StatusBadge } from './StatusBadge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

interface ComparisonAccordionItemProps {
  comparison: ComparisonCheckpoint;
  index: number;
  isEditable?: boolean;
  onChange?: (updated: ComparisonCheckpoint) => void;
  onDelete?: () => void;
  variant?: 'default' | 'compact';
}

// Icon mapping for status config icons
const statusIcons = {
  Check: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  X: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  AlertTriangle: () => <AlertTriangle className="h-4 w-4" />,
} as const;

function ReadOnlyContent({
  comparison,
  variant,
}: {
  comparison: ComparisonCheckpoint;
  variant: 'default' | 'compact';
}) {
  if (variant === 'compact') {
    return (
      <div className="space-y-5 mt-2">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-blue-500"></div>
              <h5 className="font-medium text-sm text-gray-700">
                Roof Report Value
              </h5>
            </div>
            <div className="bg-white/80 backdrop-blur-sm border rounded-lg p-3 shadow-sm">
              <p className="text-sm text-gray-900 font-mono">
                {comparison.roof_report_value || 'Not specified'}
              </p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-purple-500"></div>
              <h5 className="font-medium text-sm text-gray-700">
                Insurance Report Value
              </h5>
            </div>
            <div className="bg-white/80 backdrop-blur-sm border rounded-lg p-3 shadow-sm">
              <p className="text-sm text-gray-900 font-mono">
                {comparison.insurance_report_value || 'Not specified'}
              </p>
            </div>
          </div>
        </div>

        {comparison.notes && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-gray-400"></div>
              <h5 className="font-medium text-sm text-gray-700">
                Analysis Notes
              </h5>
            </div>
            <div className="bg-blue-50/80 backdrop-blur-sm border border-blue-200 rounded-lg p-3 shadow-sm">
              <p className="text-sm text-blue-900 leading-relaxed">
                {comparison.notes}
              </p>
            </div>
          </div>
        )}

        {comparison.warning && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <h5 className="font-medium text-sm text-amber-700">Warning</h5>
            </div>
            <div className="bg-amber-50/80 backdrop-blur-sm border border-amber-200 rounded-lg p-3 shadow-sm">
              <p className="text-sm text-amber-800 leading-relaxed">
                {comparison.warning}
              </p>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4 pt-2">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
            Roof Report Value
          </div>
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md border border-blue-200 dark:border-blue-800">
            <p className="text-sm font-medium">
              {comparison.roof_report_value || (
                <span className="text-muted-foreground italic">
                  Not specified
                </span>
              )}
            </p>
          </div>
        </div>
        <div className="space-y-2">
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            Insurance Report Value
          </div>
          <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-md border border-green-200 dark:border-green-800">
            <p className="text-sm font-medium">
              {comparison.insurance_report_value || (
                <span className="text-muted-foreground italic">
                  Not included
                </span>
              )}
            </p>
          </div>
        </div>
      </div>

      {comparison.notes && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Analysis Notes
          </p>
          <div className="p-3 bg-gray-50 dark:bg-gray-900/20 rounded-md border border-gray-200 dark:border-gray-800">
            <p className="text-sm leading-relaxed">{comparison.notes}</p>
          </div>
        </div>
      )}

      {comparison.warning && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-amber-700 dark:text-amber-400 uppercase tracking-wide flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" /> Warning
          </p>
          <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-md border border-amber-200 dark:border-amber-800">
            <p className="text-sm leading-relaxed text-amber-800 dark:text-amber-200">
              {comparison.warning}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function EditableContent({
  comparison,
  index,
  onChange,
  onDelete,
}: {
  comparison: ComparisonCheckpoint;
  index: number;
  onChange: (updated: ComparisonCheckpoint) => void;
  onDelete?: () => void;
}) {
  const handleFieldChange = (
    field: keyof ComparisonCheckpoint,
    value: string | null
  ) => {
    onChange({
      ...comparison,
      [field]: value,
    });
  };

  return (
    <div className="space-y-4 mt-2">
      {/* Checkpoint Name */}
      <div className="space-y-2">
        <Label
          htmlFor={`checkpoint-${index}`}
          className="text-xs font-medium text-gray-700"
        >
          Checkpoint Name
        </Label>
        <Input
          id={`checkpoint-${index}`}
          value={comparison.checkpoint}
          onChange={(e) => handleFieldChange('checkpoint', e.target.value)}
          className="bg-white"
        />
      </div>

      {/* Status Selection */}
      <div className="space-y-2">
        <Label
          htmlFor={`status-${index}`}
          className="text-xs font-medium text-gray-700"
        >
          Status
        </Label>
        <Select
          value={comparison.status}
          onValueChange={(value: ComparisonCheckpoint['status']) =>
            handleFieldChange('status', value)
          }
        >
          <SelectTrigger id={`status-${index}`} className="bg-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pass">Pass</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="missing">Missing</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Values */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label
            htmlFor={`roof-${index}`}
            className="text-xs font-medium text-gray-700 flex items-center gap-2"
          >
            <div className="h-2 w-2 rounded-full bg-blue-500"></div>
            Roof Report Value
          </Label>
          <Input
            id={`roof-${index}`}
            value={comparison.roof_report_value || ''}
            onChange={(e) =>
              handleFieldChange('roof_report_value', e.target.value || null)
            }
            placeholder="Not specified"
            className="bg-white"
          />
        </div>
        <div className="space-y-2">
          <Label
            htmlFor={`insurance-${index}`}
            className="text-xs font-medium text-gray-700 flex items-center gap-2"
          >
            <div className="h-2 w-2 rounded-full bg-purple-500"></div>
            Insurance Report Value
          </Label>
          <Input
            id={`insurance-${index}`}
            value={comparison.insurance_report_value || ''}
            onChange={(e) =>
              handleFieldChange(
                'insurance_report_value',
                e.target.value || null
              )
            }
            placeholder="Not specified"
            className="bg-white"
          />
        </div>
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label
          htmlFor={`notes-${index}`}
          className="text-xs font-medium text-gray-700 flex items-center gap-2"
        >
          <div className="h-2 w-2 rounded-full bg-gray-400"></div>
          Analysis Notes
        </Label>
        <Textarea
          id={`notes-${index}`}
          value={comparison.notes}
          onChange={(e) => handleFieldChange('notes', e.target.value)}
          placeholder="Add analysis notes..."
          className="bg-blue-50 border-blue-200 min-h-[80px]"
        />
      </div>

      {/* Warning */}
      <div className="space-y-2">
        <Label
          htmlFor={`warning-${index}`}
          className="text-xs font-medium text-amber-700 flex items-center gap-2"
        >
          <AlertTriangle className="h-4 w-4" /> Warning (Optional)
        </Label>
        <Textarea
          id={`warning-${index}`}
          value={comparison.warning || ''}
          onChange={(e) => handleFieldChange('warning', e.target.value || null)}
          placeholder="Add warning message (optional)..."
          className="bg-amber-50 border-amber-200 min-h-[60px]"
        />
      </div>

      {/* Delete Button */}
      {onDelete && (
        <div className="pt-4 border-t">
          <Button
            type="button"
            size="sm"
            onClick={onDelete}
            className="w-full bg-transparent hover:bg-red-50 text-red-600 hover:text-red-700 border-none hover:border-red-200 shadow-none hover:shadow-sm"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Checkpoint
          </Button>
        </div>
      )}
    </div>
  );
}

export function ComparisonAccordionItem({
  comparison,
  index,
  isEditable = false,
  onChange,
  onDelete,
  variant = 'default',
}: ComparisonAccordionItemProps) {
  const config = statusConfig[comparison.status];
  const IconComponent = statusIcons[config.icon as keyof typeof statusIcons];

  if (variant === 'compact') {
    return (
      <AccordionItem
        value={`item-${index}`}
        className={cn(
          'border rounded-lg shadow-sm hover:shadow-md transition-all duration-200',
          {
            'bg-emerald-100/30 border-emerald-200 hover:bg-emerald-50/50':
              comparison.status === 'pass',
            'bg-red-100/30 border-red-200 hover:bg-red-50/50':
              comparison.status === 'failed',
            'bg-amber-100/30 border-amber-200 hover:bg-amber-50/50':
              comparison.status === 'missing',
          }
        )}
      >
        <AccordionTrigger className="px-6 py-4 hover:no-underline group">
          <div className="flex items-center justify-between w-full mr-4">
            <div className="flex items-center gap-4">
              <div
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-full transition-all duration-200',
                  {
                    'bg-emerald-100 text-emerald-600 group-hover:bg-emerald-200 group-hover:scale-105':
                      comparison.status === 'pass',
                    'bg-red-100 text-red-600 group-hover:bg-red-200 group-hover:scale-105':
                      comparison.status === 'failed',
                    'bg-amber-100 text-amber-600 group-hover:bg-amber-200 group-hover:scale-105':
                      comparison.status === 'missing',
                  }
                )}
              >
                <IconComponent />
              </div>
              <div className="text-left">
                <h4 className="font-medium text-gray-900 group-hover:text-gray-700 transition-colors">
                  {comparison.checkpoint}
                </h4>
                {comparison.warning && (
                  <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    Warning present
                  </p>
                )}
              </div>
            </div>
            <StatusBadge status={comparison.status} variant="compact" />
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-6 pb-6">
          {isEditable && onChange ? (
            <EditableContent
              comparison={comparison}
              index={index}
              onChange={onChange}
              onDelete={onDelete}
            />
          ) : (
            <ReadOnlyContent comparison={comparison} variant={variant} />
          )}
        </AccordionContent>
      </AccordionItem>
    );
  }

  // Default variant
  return (
    <AccordionItem
      value={`item-${index}`}
      className="border rounded-lg mb-2 overflow-hidden"
    >
      <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted/50 transition-colors">
        <div className="flex items-center justify-between w-full pr-4">
          <div className="flex items-center gap-3">
            <div
              className={`p-1.5 rounded-full ${config.bgColor} border ${config.borderColor}`}
            >
              <IconComponent />
            </div>
            <div className="text-left">
              <p className="font-medium text-sm">{comparison.checkpoint}</p>
              <p className="text-xs text-muted-foreground">
                {comparison.status === 'pass'
                  ? 'Values match perfectly'
                  : comparison.status === 'failed'
                    ? 'Discrepancy detected'
                    : 'Required data missing'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {comparison.status === 'pass' && comparison.warning && (
              <Badge
                variant="outline"
                className="text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800"
                title={comparison.warning}
              >
                <span className="inline-flex items-center gap-1">
                  <AlertTriangle className="h-3.5 w-3.5" /> Warning
                </span>
              </Badge>
            )}
            <StatusBadge status={comparison.status} />
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-4 pb-4 bg-muted/20">
        {isEditable && onChange ? (
          <EditableContent
            comparison={comparison}
            index={index}
            onChange={onChange}
            onDelete={onDelete}
          />
        ) : (
          <ReadOnlyContent comparison={comparison} variant={variant} />
        )}
      </AccordionContent>
    </AccordionItem>
  );
}
