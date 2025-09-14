'use client';

import * as React from 'react';
import { BookOpen, Bot, Command, GalleryVerticalEnd, Home } from 'lucide-react';

import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { TeamSwitcher } from '@/components/team-switcher';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar';

type Session = {
  session: {
    id: string;
    userId: string;
    expiresAt: Date;
    createdAt: Date;
    updatedAt: Date;
    token: string;
    ipAddress?: string | null;
    userAgent?: string | null;
  };
  user: {
    id: string;
    name: string | null;
    email: string;
    emailVerified: boolean;
    image?: string | null | undefined;
    createdAt: Date;
    updatedAt: Date;
  };
};

// Static data that doesn't depend on user session
const staticData = {
  teams: [
    {
      name: 'Raptor AI',
      logo: GalleryVerticalEnd,
      //   plan: 'Enterprise',
    },
  ],
  navMain: [
    {
      title: 'Home',
      url: '/',
      icon: Home,
      isActive: false,
    },
    {
      title: 'Dashboard',
      url: '/dashboard',
      icon: Bot,
      isActive: true,
    },
    {
      title: 'New Analysis',
      url: '/dashboard/new-analysis',
      icon: BookOpen,
      isActive: false,
    },
    {
      title: 'Tasks',
      url: '/dashboard/tasks',
      icon: Command,
      isActive: false,
    },
  ],
};

export function AppSidebar({
  session,
  ...props
}: React.ComponentProps<typeof Sidebar> & { session: Session }) {
  // Use session data from server component
  const userData = {
    name: session.user.name || 'User',
    email: session.user.email || '',
    avatar: session.user.image || '',
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={staticData.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={staticData.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
