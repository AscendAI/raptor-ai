import { FileText, Shield, BarChart3, CheckCircle } from 'lucide-react';

export interface WorkflowStep {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const WORKFLOW_STEPS: WorkflowStep[] = [
  {
    id: 'roof-upload',
    title: 'Upload Roof Report',
    description: 'Upload your roofing inspection document',
    icon: FileText,
  },
  {
    id: 'roof-review',
    title: 'Review Roof Data',
    description: 'Verify and edit extracted roof data',
    icon: CheckCircle,
  },
  {
    id: 'insurance-upload',
    title: 'Upload Insurance Report',
    description: 'Upload your insurance claim document',
    icon: Shield,
  },
  {
    id: 'insurance-review',
    title: 'Review Insurance Data',
    description: 'Verify and edit extracted insurance data',
    icon: CheckCircle,
  },
  {
    id: 'analysis-results',
    title: 'View Analysis',
    description: 'Review comprehensive comparison results',
    icon: BarChart3,
  },
];

export function getCurrentStepIndex(pathname: string): number {
  if (pathname.includes('roof-report-upload')) return 1;
  if (pathname.includes('roof-report-review')) return 2;
  if (pathname.includes('insurance-report-upload')) return 3;
  if (pathname.includes('insurance-report-review')) return 4;
  if (pathname.includes('results') || pathname.includes('analysis')) return 5;
  return 0; // Default to first step
}

export function getStepsForIndicator() {
  return WORKFLOW_STEPS.map(step => ({
    id: step.id,
    title: step.title,
    description: step.description,
  }));
}
