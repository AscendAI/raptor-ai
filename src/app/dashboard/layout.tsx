import { LogoutButton } from '@/components/auth/logout-button';
import { getAuthSession } from '@/lib/server/auth';
import { redirect } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { AppSidebar } from '@/components/app-sidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';

export default async function DashboardPage({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAuthSession();
  if (!session?.user) {
    return redirect('/auth');
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
          {/* Main Content */}
          <main className="container mx-auto px-4 py-8">{children}</main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
