'use client';

import { usePathname } from 'next/navigation';
import { DashboardLayout, type NavItem } from '@/components/dashboard-layout';
import {
  Users,
  Store,
  Package,
  BarChart,
  Shield,
  LayoutGrid,
  MapPin,
  Bike,
  FileText,
} from 'lucide-react';

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const navItems: NavItem[] = [
    { href: '/admin', label: 'Dashboard', icon: LayoutGrid },
    { href: '/admin/map', label: 'Live Map', icon: MapPin },
    { href: '/admin/vendors', label: 'Vendors', icon: Store },
    { href: '/admin/riders', label: 'Riders', icon: Bike },
    { href: '/admin/users', label: 'Users', icon: Users },
    { href: '/admin/orders', label: 'Orders', icon: Package },
    { href: '/admin/analytics', label: 'Analytics', icon: BarChart },
    { href: '/admin/reports', label: 'Reports', icon: FileText },
  ].map((item) => ({ ...item, active: pathname === item.href }));


  return (
    <DashboardLayout
      navItems={navItems}
      userName="Abubakar Lamido"
      userEmail="lamido665@gmail.com"
      userRole="Administrator"
      isVendor
    >
      {children}
    </DashboardLayout>
  );
}
