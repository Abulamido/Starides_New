'use client';

import { usePathname } from 'next/navigation';
import { DashboardLayout, type NavItem } from '@/components/dashboard-layout';
import {
  Users,
  Store,
  Package,
  CreditCard,
  BarChart,
  Settings,
  Shield,
} from 'lucide-react';

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const navItems: NavItem[] = [
    { href: '/admin', label: 'Dashboard', icon: BarChart },
    { href: '/admin/users', label: 'Users', icon: Users },
    { href: '/admin/vendors', label: 'Vendors', icon: Store },
    { href: '/admin/riders', label: 'Riders', icon: Shield },
    { href: '/admin/products', label: 'Products', icon: Package },
    { href: '/admin/orders', label: 'Orders', icon: Package },
    { href: '/admin/payments', label: 'Payments', icon: CreditCard },
    { href: '/admin/settings', label: 'Settings', icon: Settings },
  ].map((item) => ({ ...item, active: pathname === item.href }));


  return (
    <DashboardLayout
      navItems={navItems}
      userName="Admin User"
      userRole="Administrator"
    >
      {children}
    </DashboardLayout>
  );
}
