import { DashboardLayout, type NavItem } from '@/components/dashboard-layout';
import {
  Bike,
  Map,
  DollarSign,
  Settings,
} from 'lucide-react';

export default function RiderDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const navItems: NavItem[] = [
    { href: '/rider', label: 'Deliveries', icon: Bike, active: true },
    { href: '#', label: 'Live Map', icon: Map },
    { href: '#', label: 'My Earnings', icon: DollarSign },
    { href: '#', label: 'Settings', icon: Settings },
  ];

  return (
    <DashboardLayout
      navItems={navItems}
      userName="Alex Ray"
      userRole="Rider"
    >
      {children}
    </DashboardLayout>
  );
}
