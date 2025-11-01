import { VendorCard } from '@/components/vendor-card';
import { mockVendors } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Search,
  Store,
  Utensils,
  Carrot,
  Pill,
  Laptop,
  Shirt,
} from 'lucide-react';

const categories = [
  { name: 'All', icon: Store },
  { name: 'Restaurants', icon: Utensils },
  { name: 'Groceries', icon: Carrot },
  { name: 'Pharmacy', icon: Pill },
  { name: 'Electronics', icon: Laptop },
  { name: 'Fashion', icon: Shirt },
];

export default function CustomerDashboard() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Discover Vendors
        </h1>
        <p className="text-muted-foreground">
          Find your favorite stores and products
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search vendors..."
          className="w-full pl-10 neumorphic-pressed"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {categories.map((category, index) => (
          <Button
            key={category.name}
            variant={index === 0 ? 'default' : 'secondary'}
            className={index === 0 ? 'neumorphic-pressed' : ''}
          >
            <category.icon className="mr-2 h-5 w-5" />
            {category.name}
          </Button>
        ))}
      </div>

      <div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
          {mockVendors.map((vendor) => (
            <VendorCard key={vendor.id} vendor={vendor} />
          ))}
        </div>
      </div>
    </div>
  );
}
