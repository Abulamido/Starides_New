import { ProductCard } from '@/components/product-card';
import { mockProducts } from '@/lib/data';
import { AiRecommendations } from '@/components/ai-recommendations';

export default function CustomerDashboard() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back, John!
        </h1>
        <p className="text-muted-foreground">
          Here's a look at our latest products.
        </p>
      </div>

      <AiRecommendations />

      <div>
        <h2 className="mb-4 text-2xl font-semibold tracking-tight">
          Browse All Products
        </h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {mockProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
}
