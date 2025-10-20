'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, ArrowRight } from 'lucide-react';

interface RedirectWithNoticeProps {
  to: string;
  message: string;
  delayMs?: number;
  title?: string;
}

export function RedirectWithNotice({
  to,
  message,
  delayMs = 500,
  title = 'Action Required',
}: RedirectWithNoticeProps) {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace(to);
    }, delayMs);
    return () => clearTimeout(timer);
  }, [router, to, delayMs]);

  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            {title}
          </CardTitle>
          <CardDescription>{message}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <ArrowRight className="h-4 w-4" />
            Redirecting shortly…
          </div>
          <div className="mt-4">
            <Button onClick={() => router.replace(to)} size="sm">
              Go now
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
