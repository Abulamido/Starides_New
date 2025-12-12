'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ShoppingBag, Store, Bike, Shield } from 'lucide-react';
import { StaridesLogo } from '@/components/starides-logo';

export default function AuthPage() {
  return (
    <div className="container max-w-6xl py-16 px-4">
      <div className="text-center mb-12">
        <div className="flex justify-center items-center mb-4">
          <StaridesLogo className="h-10 w-auto" />
        </div>
        <p className="text-lg text-muted-foreground">
          Choose how you want to use Starides
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {/* Customer Card */}
        <Card className="p-6 hover:shadow-lg transition-shadow border-2 hover:border-primary">
          <div className="flex flex-col items-center text-center">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <ShoppingBag className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Customer</h2>
            <p className="text-muted-foreground mb-6">
              Order from local vendors and get items delivered to your doorstep
            </p>
            <Button asChild className="w-full">
              <Link href="/auth/customer/signup">Sign Up as Customer</Link>
            </Button>
          </div>
        </Card>

        {/* Vendor Card */}
        <Card className="p-6 hover:shadow-lg transition-shadow border-2 hover:border-primary">
          <div className="flex flex-col items-center text-center">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Store className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Vendor</h2>
            <p className="text-muted-foreground mb-6">
              Sell your products and reach more customers in your area
            </p>
            <Button asChild className="w-full">
              <Link href="/auth/vendor/signup">Sign Up as Vendor</Link>
            </Button>
          </div>
        </Card>

        {/* Rider Card */}
        <Card className="p-6 hover:shadow-lg transition-shadow border-2 hover:border-primary">
          <div className="flex flex-col items-center text-center">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Bike className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Rider</h2>
            <p className="text-muted-foreground mb-6">
              Earn money by delivering orders in your spare time
            </p>
            <Button asChild className="w-full">
              <Link href="/auth/rider/signup">Sign Up as Rider</Link>
            </Button>
          </div>
        </Card>

        {/* Admin Card */}
        <Card className="p-6 hover:shadow-lg transition-shadow border-2 hover:border-primary bg-gradient-to-br from-primary/5 to-primary/10">
          <div className="flex flex-col items-center text-center">
            <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center mb-4">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Admin</h2>
            <p className="text-muted-foreground mb-6">
              Manage the platform, vendors, riders, and oversee operations
            </p>
            <Button asChild className="w-full">
              <Link href="/auth/admin/signup">Sign Up as Admin</Link>
            </Button>
          </div>
        </Card>
      </div>

      <div className="text-center">
        <p className="text-muted-foreground">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-primary hover:underline font-semibold">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
