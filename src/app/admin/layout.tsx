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
  DollarSign,
} from 'lucide-react';
import { useUser } from '@/firebase';
import { RoleGuard } from '@/components/role-guard';
import { SearchProvider, useSearch } from '@/contexts/search-context';

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useUser();
  const { searchQuery, setSearchQuery } = useSearch();

  const handleSearch = (query: string) => {
    console.log('AdminLayout: handleSearch called with:', query);
    setSearchQuery(query);
  };

  const navItems: NavItem[] = [
    { href: '/admin', label: 'Dashboard', icon: LayoutGrid },
    { href: '/admin/map', label: 'Live Map', icon: MapPin },
    { href: '/admin/vendors', label: 'Vendors', icon: Store },
    { href: '/admin/riders', label: 'Riders', icon: Bike },
    { href: '/admin/users', label: 'Users', icon: Users },
    { href: '/admin/orders', label: 'Orders', icon: Package },
    { href: '/admin/payouts', label: 'Payouts', icon: DollarSign },
    { href: '/admin/analytics', label: 'Analytics', icon: BarChart },
    { href: '/admin/reports', label: 'Reports', icon: FileText },
  ].map((item) => ({ ...item, active: pathname === item.href }));

  return (
    <DashboardLayout
      navItems={navItems}
      userName={user?.displayName || 'Admin'}
      userEmail={user?.email || ''}
      userRole="Administrator"
      onSearch={handleSearch}
      searchQuery={searchQuery}
    >
      {children}
    </DashboardLayout>
  );
}

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleGuard allowedRole="admin">
      <SearchProvider>
        <AdminLayoutContent>{children}</AdminLayoutContent>
      </SearchProvider>
    </RoleGuard>
  );
}
