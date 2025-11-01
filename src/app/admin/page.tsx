'use client';

import { AdminVendorCard } from '@/components/admin-vendor-card';
import { AdminRiderCard } from '@/components/admin-rider-card';
import { mockAdminVendors, mockAdminRiders } from '@/lib/data';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function AdminDashboard() {
  return (
    <div className="space-y-8">
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold tracking-tight">
            Recent Vendors
          </h2>
          <Link
            href="/admin/vendors"
            className="flex items-center text-sm font-medium text-primary hover:underline"
          >
            View All <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {mockAdminVendors.map((vendor) => (
            <AdminVendorCard key={vendor.id} vendor={vendor} />
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold tracking-tight">
            Recent Riders
          </h2>
          <Link
            href="/admin/riders"
            className="flex items-center text-sm font-medium text-primary hover:underline"
          >
            View All <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {mockAdminRiders.map((rider) => (
            <AdminRiderCard key={rider.id} rider={rider} />
          ))}
        </div>
      </section>
    </div>
  );
}
