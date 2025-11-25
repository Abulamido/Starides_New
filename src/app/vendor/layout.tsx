'use client';

import { usePathname } from 'next/navigation';
import { DashboardLayout, type NavItem } from '@/components/dashboard-layout';
import {
  Home,
  Package,
  DollarSign,
  Settings,
  BarChart,
  Star,
  Store,
} from 'lucide-react';
import { useUser } from '@/firebase';
import { RoleGuard } from '@/components/role-guard';

export default function VendorDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user } = useUser();

  const navItems: NavItem[] = [
    { href: '/vendor', label: 'Dashboard', icon: Home },
    { href: '/vendor/products', label: 'Products', icon: Store },
    { href: '/vendor/orders', label: 'Orders', icon: Package },
    { href: '/vendor/analytics', label: 'Analytics', icon: BarChart },
    { href: '/vendor/reviews', label: 'Reviews', icon: Star },
    { href: '/vendor/earnings', label: 'Earnings', icon: DollarSign },
    { href: '/vendor/settings', label: 'Settings', icon: Settings },
  ].map((item) => ({ ...item, active: pathname === item.href }));

  return (
    <RoleGuard allowedRole="vendor">
      <DashboardLayout
        navItems={navItems}
        userName={user?.displayName || 'Vendor'}
        userEmail={user?.email || ''}
        userRole="Vendor"
        isVendor
      >
        {children}
      </DashboardLayout>
    </RoleGuard>
  );
}
