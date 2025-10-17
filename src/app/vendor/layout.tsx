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
  const navItems: NavItem[] = [
    { href: '/vendor', label: 'Dashboard', icon: LayoutGrid, active: true },
    { href: '#', label: 'Products', icon: Package },
    { href: '#', label: 'Orders', icon: Package },
    { href: '#', label: 'Earnings', icon: DollarSign },
    { href: '#', label: 'Settings', icon: Settings },
  ];

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
