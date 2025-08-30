'use client';

import * as React from 'react';
import { FcGoogle } from 'react-icons/fc';

import { cn } from '@/lib/utils';
import { Icons } from '@/components/common/icons';
import { Button } from '@/components/ui/button';

export function UserAuthForm({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  const [isLoading, setIsLoading] = React.useState<boolean>(false);

  async function onGoogleSignIn() {
    setIsLoading(true);
    // Add your Google sign-in logic here
    setTimeout(() => {
      setIsLoading(false);
    }, 3000);
  }

  return (
    <div className={cn('grid gap-6', className)} {...props}>
      <Button
        variant="outline"
        type="button"
        disabled={isLoading}
        onClick={onGoogleSignIn}
        className="w-full"
      >
        {isLoading ? (
          <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <FcGoogle className="mr-2 h-4 w-4" />
        )}
        Sign in with Google
      </Button>
    </div>
  );
}
