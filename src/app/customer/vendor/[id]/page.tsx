
import { mockVendors } from '@/lib/data';
import { ProductCard } from '@/components/product-card';
import Image from 'next/image';
import { Star, MapPin } from 'lucide-react';
import { notFound } from 'next/navigation';

export default function VendorPage({ params }: { params: { id: string } }) {
  const vendor = mockVendors.find((v) => v.id === params.id);

  if (!vendor) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <div className="relative h-48 w-full overflow-hidden rounded-lg md:h-64">
        <Image
          src={vendor.image}
          alt={vendor.name}
          fill
          className="object-cover"
          data-ai-hint={vendor.imageHint}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-4 left-4 text-white">
          <h1 className="text-3xl font-bold md:text-5xl">{vendor.name}</h1>
          <p className="max-w-xl text-sm md:text-base">
            {vendor.description}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
            <span className="font-bold">{vendor.rating}</span>
            <span className="text-sm text-muted-foreground">
              ({vendor.reviewCount} reviews)
            </span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-5 w-5" />
            <span>{vendor.category}</span>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold tracking-tight">Menu</h2>
        {vendor.menu && vendor.menu.length > 0 ? (
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {vendor.menu.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <p className="mt-4 text-muted-foreground">
            This vendor has not added any products yet.
          </p>
        )}
      </div>
    </div>
  );
}
