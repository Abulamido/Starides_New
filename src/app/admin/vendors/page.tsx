
import { AdminVendorCard } from '@/components/admin-vendor-card';
import { mockAdminVendors } from '@/lib/data';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

export default function AdminVendorsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Manage Vendors</h1>
        <p className="text-muted-foreground">
          View, manage, and approve all vendor accounts on the platform.
        </p>
      </div>
       <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search vendors by name or category..."
          className="w-full pl-10"
        />
      </div>
       <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {mockAdminVendors.map((vendor) => (
            <AdminVendorCard key={vendor.id} vendor={vendor} />
          ))}
        </div>
    </div>
  );
}
