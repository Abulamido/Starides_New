
import { ProductCard } from '@/components/product-card';
import { mockProducts } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

// Filter products for a specific vendor (e.g., ABU EATS)
const vendorProducts = mockProducts.filter(p => ['prod-009', 'prod-010', 'prod-011'].includes(p.id));

export default function VendorProductsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
            <h1 className="text-3xl font-bold tracking-tight">Manage Products</h1>
            <p className="text-muted-foreground">
                Add, edit, and manage your product listings.
            </p>
        </div>
        <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Product
        </Button>
      </div>
      
       {vendorProducts.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {vendorProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <p className="mt-4 text-muted-foreground">
            You haven't added any products yet.
          </p>
        )}
    </div>
  );
}
