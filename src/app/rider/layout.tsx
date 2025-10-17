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
    { href: '/rider/map', label: 'Live Map', icon: Map },
    { href: '/rider/earnings', label: 'My Earnings', icon: DollarSign },
    { href: '/rider/settings', label: 'Settings', icon: Settings },
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
