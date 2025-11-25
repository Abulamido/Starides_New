
'use client';

import { usePathname } from 'next/navigation';
import { DashboardLayout, type NavItem } from '@/components/dashboard-layout';
import {
  LayoutGrid,
  Package,
  Wallet,
  Settings,
  Star,
} from 'lucide-react';
import { useUser } from '@/firebase';
import { OrderStatusListener } from '@/components/order-status-listener';
import { RoleGuard } from '@/components/role-guard';

export default function CustomerDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user } = useUser();

  const navItems: NavItem[] = [
    { href: '/customer', label: 'Browse', icon: LayoutGrid },
    { href: '/customer/orders', label: 'My Orders', icon: Package },
    { href: '/customer/wallet', label: 'Wallet', icon: Wallet },
    { href: '/customer/recommendations', label: 'For You', icon: Star },
    { href: '/customer/settings', label: 'Settings', icon: Settings },
  ].map((item) => ({
    ...item,
    active:
      pathname === item.href || (item.href === '/customer/orders' && pathname.startsWith('/customer/orders')),
  }));

  return (
    <RoleGuard allowedRole="customer">
      <DashboardLayout
        navItems={navItems}
        userName={user?.displayName || 'Customer'}
        userEmail={user?.email || ''}
        userRole="Customer"
      >
        {user && <OrderStatusListener customerId={user.uid} />}
        {children}
      </DashboardLayout>
    </RoleGuard>
  );
}
