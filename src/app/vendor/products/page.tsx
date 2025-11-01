
'use client';
import { ProductCard } from '@/components/product-card';
import { Button } from '@/components/ui/button';
import { PlusCircle, ShoppingBag } from 'lucide-react';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import type { Product } from '@/lib/data';
import { Skeleton } from '@/components/ui/skeleton';

function ProductCardSkeleton() {
    return (
        <div className="space-y-2">
            <Skeleton className="aspect-square w-full" />
            <div className="space-y-1">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
            </div>
            <div className="flex justify-between">
                <Skeleton className="h-5 w-20" />
            </div>
        </div>
    )
}

export default function VendorProductsPage() {
    const firestore = useFirestore();
    const { user, isUserLoading } = useUser();

    const productsQuery = useMemoFirebase(() => {
        if (!firestore || !user) return null;
        return query(collection(firestore, 'products'), where('vendorId', '==', user.uid));
    }, [firestore, user]);
    
    const { data: vendorProducts, isLoading } = useCollection<Product>(productsQuery);

    const showLoading = isLoading || isUserLoading;

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
      
       {showLoading && (
           <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[...Array(4)].map((_, i) => <ProductCardSkeleton key={i} />)}
           </div>
       )}

       {!showLoading && vendorProducts && vendorProducts.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {vendorProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          !showLoading && (
            <div className="flex flex-col items-center justify-center gap-4 py-16 text-center text-muted-foreground border-2 border-dashed rounded-lg">
                <ShoppingBag className="h-16 w-16" />
                <p className="font-semibold">You haven't added any products yet.</p>
                <p className="text-sm">Click "Add Product" to get started.</p>
             </div>
          )
        )}
    </div>
  );
}
