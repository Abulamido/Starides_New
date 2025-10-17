import { AiRecommendations } from '@/components/ai-recommendations';

export default function RecommendationsPage() {
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

      <AiRecommendations />
    </div>
  );
}
