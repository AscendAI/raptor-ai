"use client";

import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function AuthenticatedButton() {
  const { data, isPending } = authClient.useSession();

  if (isPending) {
    return (
      <Button
        size="lg"
        className="bg-gradient-to-r from-indigo-500 to-rose-500 hover:from-indigo-600 hover:to-rose-600 text-white font-medium px-8 py-3 rounded-full shadow-lg shadow-indigo-500/25 transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/30 border-0"
        disabled
      >
        Loading...
      </Button>
    );
  }

  if (data?.user) {
    return (
      <Button
        asChild
        size="lg"
        className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-medium px-8 py-3 rounded-full shadow-lg shadow-green-500/25 transition-all duration-300 hover:shadow-xl hover:shadow-green-500/30 border-0"
      >
        <Link href="/dashboard">Go to Dashboard</Link>
      </Button>
    );
  }

  return (
    <Button
      asChild
      size="lg"
      className="bg-gradient-to-r from-indigo-500 to-rose-500 hover:from-indigo-600 hover:to-rose-600 text-white font-medium px-8 py-3 rounded-full shadow-lg shadow-indigo-500/25 transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/30 border-0"
    >
      <Link href="/auth">Get Started</Link>
    </Button>
  );
}
