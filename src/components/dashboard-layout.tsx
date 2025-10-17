import type { ReactNode } from 'react';
import React from 'react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Search, Menu } from 'lucide-react';
import { UserNav } from './user-nav';
import { StaridesLogo } from './starides-logo';
import { CartSheet } from './cart-sheet';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';


export type NavItem = {
  href: string;
  label:string;
  icon: React.ComponentType<{ className?: string }>;
  active?: boolean;
};

type DashboardLayoutProps = {
  children: ReactNode;
  navItems: NavItem[];
  userName: string;
  userRole: string;
};

function NavLinks({ navItems, isMobile = false }: { navItems: NavItem[], isMobile?: boolean }) {
  return (
    <nav
      className={cn(
        'flex items-center gap-4 text-sm font-medium',
        isMobile && 'flex-col items-start gap-2'
      )}
    >
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            'transition-colors hover:text-primary',
            item.active ? 'text-primary' : 'text-muted-foreground',
            isMobile && 'flex items-center gap-2 rounded-md p-2 text-base w-full',
            isMobile && item.active && 'bg-accent text-accent-foreground'
          )}
        >
          <item.icon className={cn('h-5 w-5', !isMobile && "hidden")} />
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

export function DashboardLayout({
  children,
  navItems,
  userName,
  userRole,
}: DashboardLayoutProps) {
  const [open, setOpen] = React.useState(false);
  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
        <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2 font-semibold">
                <StaridesLogo className="h-6 w-6 text-primary" />
                <span className="hidden md:inline-block">Starides</span>
            </Link>
        </div>

        <div className="hidden md:flex md:gap-6">
            <NavLinks navItems={navItems} />
        </div>

        <div className="ml-auto flex items-center gap-4">
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
            <CartSheet />
            <UserNav />
        </div>
        
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Toggle Menu</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col">
               <div className="flex items-center gap-2 border-b pb-4">
                  <Link href="/" className="flex items-center gap-2 font-semibold" onClick={() => setOpen(false)}>
                      <StaridesLogo className="h-6 w-6 text-primary" />
                      <span>Starides</span>
                  </Link>
              </div>
              <div className='py-4'>
                <NavLinks navItems={navItems} isMobile={true} />
              </div>
            </SheetContent>
        </Sheet>
      </header>
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        {children}
      </main>
    </div>
  );
}
