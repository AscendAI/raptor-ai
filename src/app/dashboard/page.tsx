import { LogoutButton } from '@/components/auth/logout-button';
import { getAuthSession } from '@/lib/server/auth';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import Image from 'next/image';
import Link from 'next/link';

export default async function DashboardPage() {
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
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            Welcome back, {session.user.name?.split(' ')[0]}! 👋
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            Ready to streamline your insurance claim supplements?
          </p>
        </div>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Quick Actions Card */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span className="text-indigo-600 dark:text-indigo-400">⚡</span>
                <span>Quick Actions</span>
              </CardTitle>
              <CardDescription>Get started with common tasks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start" variant="outline">
                📄 New Supplement Report
              </Button>
              <Button className="w-full justify-start" variant="outline">
                📸 Upload Photos
              </Button>
              <Link href="/roofr" className="block w-full">
                <Button className="w-full justify-start" variant="outline">
                  🔍 Analyze Roofr PDF
                </Button>
              </Link>
              <Button className="w-full justify-start" variant="outline">
                📊 View Analytics
              </Button>
            </CardContent>
          </Card>

          {/* Recent Activity Card */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span className="text-green-600 dark:text-green-400">📈</span>
                <span>Recent Activity</span>
              </CardTitle>
              <CardDescription>Your latest supplement work</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center text-slate-500 dark:text-slate-400 py-8">
                <p>No recent activity yet</p>
                <p className="text-sm mt-2">
                  Start your first supplement report to see activity here
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Account Status Card */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span className="text-blue-600 dark:text-blue-400">👤</span>
                <span>Account Status</span>
              </CardTitle>
              <CardDescription>Your account information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  Email Status:
                </span>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    session.user.emailVerified
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                  }`}
                >
                  {session.user.emailVerified ? 'Verified' : 'Unverified'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  Plan:
                </span>
                <span className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">
                  Free Trial
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  Member since:
                </span>
                <span className="text-sm text-slate-900 dark:text-slate-100">
                  {new Date(session.user.createdAt).toLocaleDateString()}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Getting Started Section */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span className="text-orange-600 dark:text-orange-400">🚀</span>
              <span>Getting Started</span>
            </CardTitle>
            <CardDescription>
              Follow these steps to make the most of Raptor AI
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center p-4 rounded-lg bg-slate-50 dark:bg-slate-800">
                <div className="text-2xl mb-2">📋</div>
                <h3 className="font-semibold mb-1">Upload Documents</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Upload your claim documents and photos
                </p>
              </div>
              <div className="text-center p-4 rounded-lg bg-slate-50 dark:bg-slate-800">
                <div className="text-2xl mb-2">🤖</div>
                <h3 className="font-semibold mb-1">AI Analysis</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Let AI analyze and identify supplement opportunities
                </p>
              </div>
              <div className="text-center p-4 rounded-lg bg-slate-50 dark:bg-slate-800">
                <div className="text-2xl mb-2">📝</div>
                <h3 className="font-semibold mb-1">Generate Report</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Create professional supplement reports
                </p>
              </div>
              <div className="text-center p-4 rounded-lg bg-slate-50 dark:bg-slate-800">
                <div className="text-2xl mb-2">💰</div>
                <h3 className="font-semibold mb-1">Submit & Profit</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Submit to insurance and increase your revenue
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
