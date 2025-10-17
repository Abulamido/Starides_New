'use client';

import { usePathname } from 'next/navigation';
import { DashboardLayout, type NavItem } from '@/components/dashboard-layout';
import {
  LayoutGrid,
  Package,
  DollarSign,
  Settings,
} from 'lucide-react';

export default function VendorDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const navItems: NavItem[] = [
    { href: '/vendor', label: 'Dashboard', icon: LayoutGrid },
    { href: '/vendor/products', label: 'Products', icon: Package },
    { href: '/vendor/orders', label: 'Orders', icon: Package },
    { href: '/vendor/earnings', label: 'Earnings', icon: DollarSign },
    { href: '/vendor/settings', label: 'Settings', icon: Settings },
  ].map((item) => ({...item, active: pathname === item.href}));

  return (
    <DashboardLayout
      navItems={navItems}
      userName="Jane Smith"
      userRole="Vendor"
    >
      {children}
    </DashboardLayout>
  );
}
