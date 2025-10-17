import type { ReactNode } from 'react';
import Link from 'next/link';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarTrigger,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { UserNav } from './user-nav';
import { Separator } from './ui/separator';
import { Button } from './ui/button';
import { StaridesLogo } from './starides-logo';

export type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  active?: boolean;
};

type DashboardLayoutProps = {
  children: ReactNode;
  navItems: NavItem[];
  userName: string;
  userRole: string;
};

export function DashboardLayout({
  children,
  navItems,
  userName,
  userRole,
}: DashboardLayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen bg-background">
        <Sidebar>
          <SidebarHeader>
            <div className="flex items-center gap-2">
              <StaridesLogo className="size-6 text-primary" />
              <span className="text-lg font-semibold text-foreground">
                Starides
              </span>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={item.active}
                    tooltip={item.label}
                  >
                    <Link href={item.href}>
                      <item.icon />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter>
            <Separator className="my-2" />
            <UserNav />
          </SidebarFooter>
        </Sidebar>
        <SidebarInset>
          <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
            <div className="flex items-center gap-2 md:hidden">
              <SidebarTrigger />
              <StaridesLogo className="size-6 text-primary" />
            </div>
            <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
              <form className="ml-auto flex-1 sm:flex-initial">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search..."
                    className="pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px]"
                  />
                </div>
              </form>
              <div className="hidden md:block">
                <UserNav />
              </div>
            </div>
          </header>
          <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
