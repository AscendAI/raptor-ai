import { LogoutButton } from '@/components/auth/logout-button';
import { getAuthSession } from '@/lib/server/auth';
import { redirect } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

export default async function DashboardPage({ children }: { children: React.ReactNode }) {
  const session = await getAuthSession();
  if (!session?.user) {
    return redirect('/auth');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm dark:bg-slate-900/80">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/" className="cursor-pointer">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent hover:from-indigo-700 hover:to-purple-700 transition-colors">
                  Raptor AI
                </h1>
              </Link>
              <span className="text-sm text-slate-500 dark:text-slate-400">
                Roofing Supplement Assistant
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                {session.user.image && (
                  <Image
                    src={session.user.image}
                    alt={session.user.name || 'User'}
                    width={32}
                    height={32}
                    className="h-8 w-8 rounded-full ring-2 ring-indigo-500/20"
                  />
                )}
                <div className="text-right">
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    {session.user.name}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {session.user.email}
                  </p>
                </div>
              </div>
              <LogoutButton />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
