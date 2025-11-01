'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, Search } from 'lucide-react';
import { StaridesLogo } from './starides-logo';
import { CartSheet } from './cart-sheet';
import { ThemeToggle } from './theme-toggle';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <StaridesLogo className="h-6 w-auto text-primary" />
            <span className="hidden font-bold sm:inline-block">
              Starides
            </span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            {/* Add more nav links here if needed */}
          </nav>
        </div>

        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="pr-0">
            <Link href="/" className="mr-6 flex items-center space-x-2">
              <StaridesLogo className="h-6 w-auto text-primary" />
              <span className="font-bold">Starides</span>
            </Link>
            <div className="my-4 h-[calc(100vh-8rem)] pb-10 pl-6">
              <div className="flex flex-col space-y-3">
                 {/* Add mobile nav links here */}
              </div>
            </div>
          </SheetContent>
        </Sheet>
        
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            <form>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search products..."
                  className="w-full rounded-lg bg-secondary pl-8 md:w-[200px] lg:w-[320px]"
                />
              </div>
            </form>
          </div>
          <nav className="flex items-center gap-2">
             <ThemeToggle />
             <Button asChild variant="ghost">
                <Link href="/auth">Login</Link>
            </Button>
            <Button asChild>
                <Link href="/auth">Sign Up</Link>
            </Button>
             <CartSheet />
          </nav>
        </div>
      </div>
    </header>
  );
}
