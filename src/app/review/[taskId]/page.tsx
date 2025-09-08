'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import {
  getUserReviewData,
  saveUserReviewData,
  completeAnalysisWorkflow,
} from '@/lib/server/actions';
import { RoofReportData, InsuranceReportData } from '@/lib/schemas/extraction';
import { RoofDataEditor } from '@/components/review/roof-data-editor';
import {
  ValidationPanel,
  ValidationSummary,
} from '@/components/review/validation-panel';
import {
  validateReviewData,
  ValidationError,
} from '@/components/review/validation';
import InsuranceDataEditor from '@/components/review/insurance-data-editor';
import { toast } from 'sonner';

interface ReviewPageState {
  loading: boolean;
  roofData: RoofReportData | null;
  insuranceData: InsuranceReportData | null;
  error: string | null;
  saving: boolean;
  generating: boolean;
  validationErrors: ValidationError[];
  showValidation: boolean;
}

export default function ReviewPage() {
  const params = useParams();
  const router = useRouter();
  const taskId = params.taskId as string;

  const [state, setState] = useState<ReviewPageState>({
    loading: true,
    roofData: null,
    insuranceData: null,
    error: null,
    saving: false,
    generating: false,
    validationErrors: [],
    showValidation: false,
  });

  // Load session data on mount
  useEffect(() => {
    loadSessionData();
  }, [taskId]);

  const loadSessionData = async () => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      const result = await getUserReviewData(taskId);

      if (!result.success) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: result.error || 'Failed to load session data',
        }));
        return;
      }

      const roofData = result.data!.roofData;
      const insuranceData = result.data!.insuranceData;
      const validation = validateReviewData(roofData, insuranceData);

      setState((prev) => ({
        ...prev,
        loading: false,
        roofData,
        insuranceData,
        validationErrors: validation.errors,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: 'An unexpected error occurred',
      }));
    }
  };

  const handleSaveChanges = async () => {
    if (!state.roofData || !state.insuranceData) return;

    try {
      setState((prev) => ({ ...prev, saving: true }));

      const result = await saveUserReviewData(
        taskId,
        state.roofData,
        state.insuranceData
      );

      if (result.success) {
        toast.success('Changes saved successfully!');
      } else {
        toast.error(result.error || 'Failed to save changes');
      }
    } catch (error) {
      toast.error('An unexpected error occurred while saving');
    } finally {
      setState((prev) => ({ ...prev, saving: false }));
    }
  };

  const handleGenerateReport = async () => {
    if (!state.roofData || !state.insuranceData) return;

    try {
      setState((prev) => ({ ...prev, generating: true }));

      // Save current changes first
      await saveUserReviewData(taskId, state.roofData, state.insuranceData);

      // Generate final analysis
      const result = await completeAnalysisWorkflow(taskId);

      if (result.success) {
        toast.success('Analysis completed successfully!');
        // Navigate to results page to show the final analysis
        router.push(`/results/${taskId}`);
      } else {
        toast.error(result.error || 'Failed to generate analysis');
      }
    } catch (error) {
      toast.error('An unexpected error occurred while generating the report');
    } finally {
      setState((prev) => ({ ...prev, generating: false }));
    }
  };

  const updateRoofData = (newData: RoofReportData) => {
    const validation = state.insuranceData
      ? validateReviewData(newData, state.insuranceData)
      : { errors: [], isValid: true };

    setState((prev) => ({
      ...prev,
      roofData: newData,
      validationErrors: validation.errors,
    }));
  };

  const updateInsuranceData = (newData: InsuranceReportData) => {
    const validation = state.roofData
      ? validateReviewData(state.roofData, newData)
      : { errors: [], isValid: true };

    setState((prev) => ({
      ...prev,
      insuranceData: newData,
      validationErrors: validation.errors,
    }));
  };

  const handleValidateData = () => {
    setState((prev) => ({ ...prev, showValidation: true }));
  };

  const handleCloseValidation = () => {
    setState((prev) => ({ ...prev, showValidation: false }));
  };

  if (state.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading extracted data...</p>
        </div>
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              Error Loading Data
            </CardTitle>
            <CardDescription>{state.error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => router.push('/dashboard')}
              className="w-full"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/dashboard')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Review Extracted Data</h1>
                <p className="text-muted-foreground text-sm">
                  Review and modify the extracted data before generating the
                  final analysis
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">Task: {taskId.slice(-8)}</Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="space-y-6">
          {/* Data Tabs */}
          <Tabs defaultValue="roof" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="roof" className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Roof Report Data
              </TabsTrigger>
              <TabsTrigger
                value="insurance"
                className="flex items-center gap-2"
              >
                <CheckCircle className="h-4 w-4" />
                Insurance Report Data
              </TabsTrigger>
            </TabsList>

            <TabsContent value="roof" className="mt-6">
              {state.roofData && (
                <RoofDataEditor
                  data={state.roofData}
                  onChange={updateRoofData}
                />
              )}
            </TabsContent>

            <TabsContent value="insurance" className="mt-6">
              {state.insuranceData && (
                <InsuranceDataEditor
                  data={state.insuranceData}
                  onChange={updateInsuranceData}
                />
              )}
            </TabsContent>
          </Tabs>

          {/* Action Buttons */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <h3 className="font-medium">Ready to generate analysis?</h3>
                  <p className="text-sm text-muted-foreground">
                    Save your changes and generate the final comparison report
                  </p>
                  <ValidationSummary errors={state.validationErrors} />
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    onClick={handleValidateData}
                    disabled={state.saving || state.generating}
                  >
                    Validate Data
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleSaveChanges}
                    disabled={state.saving || state.generating}
                  >
                    {state.saving ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </Button>
                  <Button
                    onClick={handleGenerateReport}
                    disabled={
                      state.saving ||
                      state.generating ||
                      state.validationErrors.length > 0
                    }
                  >
                    {state.generating ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      'Generate Final Report'
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <ValidationPanel
        errors={state.validationErrors}
        isVisible={state.showValidation}
        onClose={handleCloseValidation}
      />
    </div>
  );
}
