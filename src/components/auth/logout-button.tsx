'use client'

import { authClient } from "@/lib/auth-client";
import { SidebarMenuButton } from "../ui/sidebar";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export function LogoutButton() {
  const router = useRouter();
  return (
    <SidebarMenuButton
      onClick={async () => {
        await authClient.signOut();
        router.push("/auth");
      }}
      className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
    >
      <LogOut className="h-4 w-4" />
      <span>Log out</span>
    </SidebarMenuButton>
  );
}
