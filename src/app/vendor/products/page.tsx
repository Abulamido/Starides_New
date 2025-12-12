'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlusCircle, ShoppingBag, Search } from 'lucide-react';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import type { Product } from '@/lib/data';
import { Skeleton } from '@/components/ui/skeleton';
import { VendorProductCard } from './vendor-product-card';
import { ProductFormDialog } from './product-form-dialog';

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
  );
}

export default function VendorProductsPage() {
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>();

  const productsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, 'products'), where('vendorId', '==', user.uid));
  }, [firestore, user]);

  const { data: vendorProducts, isLoading } = useCollection<Product>(productsQuery);

  const showLoading = isLoading || isUserLoading;

  // Filter products based on search query
  const filteredProducts = vendorProducts?.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (product.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  function handleEdit(product: Product) {
    setEditingProduct(product);
  }

  function handleCloseDialog() {
    setShowAddDialog(false);
    setEditingProduct(undefined);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manage Products</h1>
          <p className="text-muted-foreground">
            Add, edit, and manage your product listings.
          </p>
        </div>
        <Button onClick={() => setShowAddDialog(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </div>



      {/* Loading State */}
      {showLoading && (
        <div className="grid grid-cols-1 gap-3 md:gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Products Grid */}
      {!showLoading && filteredProducts && filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 gap-3 md:gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredProducts.map((product) => (
            <VendorProductCard
              key={product.id}
              product={product}
              onEdit={handleEdit}
            />
          ))}
        </div>
      ) : (
        !showLoading && (
          <div className="flex flex-col items-center justify-center gap-4 py-16 text-center text-muted-foreground border-2 border-dashed rounded-lg">
            <ShoppingBag className="h-16 w-16" />
            {searchQuery ? (
              <>
                <p className="font-semibold">No products found</p>
                <p className="text-sm">Try adjusting your search query.</p>
              </>
            ) : (
              <>
                <p className="font-semibold">You haven't added any products yet.</p>
                <p className="text-sm">Click "Add Product" to get started.</p>
              </>
            )}
          </div>
        )
      )}

      {/* Add/Edit Product Dialog */}
      <ProductFormDialog
        open={showAddDialog || !!editingProduct}
        onOpenChange={handleCloseDialog}
        vendorId={user?.uid || ''}
        product={editingProduct}
      />
    </div>
  );
}
