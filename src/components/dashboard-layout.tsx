import React from 'react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Search, Menu, LogOut, Dot } from 'lucide-react';
import { UserNav } from './user-nav';
import { StaridesLogo } from './starides-logo';
import { CartSheet } from './cart-sheet';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ThemeToggle } from './theme-toggle';
import { NotificationCenter } from './notification-center';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useUser, useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';

export type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  active?: boolean;
};

type DashboardLayoutProps = {
  children: React.ReactNode;
  navItems: NavItem[];
  userName: string;
  userRole: string;
  userEmail?: string;
  isVendor?: boolean;
  onSearch?: (query: string) => void;
};

function NavLinks({ navItems, isMobile = false, onNavigate }: { navItems: NavItem[], isMobile?: boolean, onNavigate?: () => void }) {
  return (
    <nav
      className={cn(
        'flex flex-col items-start gap-1 text-base font-medium'
      )}
    >
      {navItems.map((item) => (
        <Button
          key={item.href}
          asChild
          variant={item.active ? "secondary" : "ghost"}
          className={cn(
            'w-full justify-start gap-3 rounded-md px-3 py-2 text-muted-foreground transition-all hover:text-primary',
            item.active && 'font-semibold text-primary',
            isMobile ? 'text-base' : 'text-sm'
          )}
        >
          <Link href={item.href} onClick={onNavigate}>
            <item.icon className={cn('h-5 w-5')} />
            {item.label}
          </Link>
        </Button>
      ))}
    </nav>
  );
}

function SidebarContent({ navItems, onNavigate }: { navItems: NavItem[], onNavigate?: () => void }) {
  const { user } = useUser();
  const auth = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    if (!auth) return;
    await signOut(auth);
    router.push('/auth');
  };

  return (
    <div className="flex h-full flex-col gap-2">
      <div className="flex h-16 shrink-0 items-center border-b px-4 lg:h-[60px] lg:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold text-foreground" onClick={onNavigate}>
          <StaridesLogo className="h-8 w-auto text-primary" />
          <span className="text-xl font-bold">Starides</span>
        </Link>
      </div>
      <div className="flex-1 overflow-auto py-2">
        <div className="px-4">
          <NavLinks navItems={navItems} onNavigate={onNavigate} />
        </div>
      </div>
      <div className="mt-auto border-t p-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 border">
            <AvatarFallback>{user?.displayName?.charAt(0) || 'U'}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-semibold">{user?.displayName || 'User'}</p>
            <p className="text-xs text-muted-foreground">{user?.email}</p>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-green-500">
            <Dot className="h-6 w-6 animate-pulse" />
            Live
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="flex items-center gap-2 text-muted-foreground">
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
}


export function DashboardLayout({
  children,
  navItems,
  userName,
  userRole,
  userEmail,
  isVendor = false,
  onSearch,
}: DashboardLayoutProps) {
  const [open, setOpen] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState('');
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  React.useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/auth');
    }
  }, [user, isUserLoading, router]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);
    onSearch?.(value);
  };

  if (isUserLoading || !user) {
    // You can return a loading spinner here
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  // Unified Sidebar Layout for Vendor and Customer
  if (isVendor || userRole === 'Customer') {
    return (
      <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
        <div className="hidden border-r bg-background md:block">
          <SidebarContent navItems={navItems} />
        </div>
        <div className="flex flex-col max-h-screen overflow-hidden">
          <header className="flex h-14 items-center gap-4 border-b bg-background px-4 lg:h-[60px] lg:px-6 shrink-0">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="shrink-0 md:hidden"
                >
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle navigation menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="flex flex-col p-0">
                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                <SheetDescription className="sr-only">Main navigation menu</SheetDescription>
                <SidebarContent navItems={navItems} onNavigate={() => setOpen(false)} />
              </SheetContent>
            </Sheet>

            <div className="w-full flex-1">
              <form onSubmit={(e) => e.preventDefault()}>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search vendors, riders..."
                    className="w-full appearance-none bg-background pl-8 shadow-none md:w-2/3 lg:w-1/3"
                    value={searchValue}
                    onChange={handleSearchChange}
                  />
                </div>
              </form>
            </div>
            <div className="flex items-center gap-2">
              <NotificationCenter />
              <CartSheet />
              <ThemeToggle />
              <UserNav />
            </div>
          </header>
          <main className="flex-1 overflow-auto p-4 lg:p-6 bg-secondary/40">
            {children}
          </main>
        </div>
      </div>
    );
  }

  // Fallback for other roles (if any) or public pages
  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-4 border-b bg-background px-4 md:px-6">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <StaridesLogo className="h-6 w-6 text-primary" />
            <span className="hidden md:inline-block">Starides</span>
          </Link>
        </div>

        <div className="hidden md:flex md:gap-2">
          <NavLinks navItems={navItems} />
        </div>

        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
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
            <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
            <SheetDescription className="sr-only">Main navigation menu</SheetDescription>
            <div className="flex items-center gap-2 border-b pb-4">
              <Link href="/" className="flex items-center gap-2 font-semibold" onClick={() => setOpen(false)}>
                <StaridesLogo className="h-6 w-6 text-primary" />
                <span>Starides</span>
              </Link>
            </div>
            <div className='py-4'>
              <NavLinks navItems={navItems} isMobile={true} onNavigate={() => setOpen(false)} />
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
