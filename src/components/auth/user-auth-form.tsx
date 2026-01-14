'use client';

import * as React from 'react';
import { FcGoogle } from 'react-icons/fc';

import { cn } from '@/lib/utils';
import { Icons } from '@/components/common/icons';
import { Button } from '@/components/ui/button';
import { authClient } from '@/lib/auth-client';
import { toast } from 'sonner';

export function UserAuthForm({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  const [isLoading, setIsLoading] = React.useState<boolean>(false);

  async function onGoogleSignIn() {
    setIsLoading(true);
    try {
      await authClient.signIn.social({
        provider: 'google',
        callbackURL: '/dashboard',
      });
    } catch (error) {
      console.error(error);
      toast.error('Failed to sign in with Google');
    } finally {
      setIsLoading(false);
    }
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
