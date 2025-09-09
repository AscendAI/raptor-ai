import { MultiStepUpload } from '@/components/upload/multi-step-upload';

export default async function UploadPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Upload Documents</h1>
        <p className="text-muted-foreground mt-2">
          Follow the steps below to upload your documents and generate analysis
        </p>
      </div>
      <MultiStepUpload />
    </div>
  );
}
