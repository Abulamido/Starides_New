'use client';

import { usePathname } from 'next/navigation';
import { DashboardLayout, type NavItem } from '@/components/dashboard-layout';
import {
  Bike,
  DollarSign,
  Settings,
  History,
  BarChart,
  Star,
  User,
  Home,
} from 'lucide-react';
import { useUser } from '@/firebase';
import { RoleGuard } from '@/components/role-guard';
import { RiderVerificationGuard } from '@/components/rider-verification-guard';

export default function RiderDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user } = useUser();

  const navItems: NavItem[] = [
    { href: '/rider', label: 'Dashboard', icon: Home },
    { href: '/rider/deliveries', label: 'Deliveries', icon: Bike },
    { href: '/rider/history', label: 'History', icon: History },
    { href: '/rider/earnings', label: 'Earnings', icon: DollarSign },
    { href: '/rider/analytics', label: 'Analytics', icon: BarChart },
    { href: '/rider/ratings', label: 'Ratings', icon: Star },
    { href: '/rider/profile', label: 'Profile', icon: User },
  ].map((item) => ({ ...item, active: pathname === item.href }));

  return (
    <RoleGuard allowedRole="rider">
      <RiderVerificationGuard>
        <DashboardLayout
          navItems={navItems}
          userName={user?.displayName || 'Rider'}
          userEmail={user?.email || ''}
          userRole="Rider"
          isVendor
        >
          {children}
        </DashboardLayout>
      </RiderVerificationGuard>
    </RoleGuard>
  );
}
