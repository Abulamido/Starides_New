import { DashboardLayout, type NavItem } from '@/components/dashboard-layout';
import {
  LayoutGrid,
  Package,
  Wallet,
  Settings,
  Star,
} from 'lucide-react';

export default function CustomerDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const navItems: NavItem[] = [
    { href: '/customer', label: 'Browse', icon: LayoutGrid, active: true },
    { href: '#', label: 'My Orders', icon: Package },
    { href: '#', label: 'Wallet', icon: Wallet },
    { href: '#', label: 'Recommendations', icon: Star },
    { href: '#', label: 'Settings', icon: Settings },
  ];

  return (
    <DashboardLayout
      navItems={navItems}
      userName="John Doe"
      userRole="Customer"
    >
      {children}
    </DashboardLayout>
  );
}
