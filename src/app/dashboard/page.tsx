import { LogoutButton } from "@/components/auth/logout-button";
import { getAuthSession } from "@/lib/server/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await getAuthSession();
  if (!session?.user) {
    return redirect("/auth");
  }
  return (
    <div>
      <h1>Dashboard</h1>
      <pre>{JSON.stringify(session, null, 2)}</pre>
      <LogoutButton />
    </div>
  );
}
