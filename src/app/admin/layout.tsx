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
  const navItems: NavItem[] = [
    { href: '/admin', label: 'Dashboard', icon: BarChart, active: true },
    { href: '#', label: 'Users', icon: Users },
    { href: '#', label: 'Vendors', icon: Store },
    { href: '#', label: 'Riders', icon: Shield },
    { href: '#', label: 'Products', icon: Package },
    { href: '#', label: 'Orders', icon: Package },
    { href: '#', label: 'Payments', icon: CreditCard },
    { href: '#', label: 'Settings', icon: Settings },
  ];

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
