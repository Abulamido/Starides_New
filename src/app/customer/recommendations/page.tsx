
'use client';
import { AiRecommendations } from '@/components/ai-recommendations';
import { useUser } from '@/firebase';

export default function RecommendationsPage() {
  const { user } = useUser();

  // In a real app, browsing and purchase history would be fetched from your database
  const browsingHistory = ['prod-004', 'prod-002'];
  const purchaseHistory = ['prod-007'];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Personalized For You
        </h1>
        <p className="text-muted-foreground">
          Products we think you&apos;ll love, powered by AI.
        </p>
      </div>

      {user ? (
        <AiRecommendations 
            customerId={user.uid}
            browsingHistory={browsingHistory}
            purchaseHistory={purchaseHistory}
        />
      ) : (
        <p className="text-muted-foreground">Please log in to see recommendations.</p>
      )}
    </div>
  );
}
