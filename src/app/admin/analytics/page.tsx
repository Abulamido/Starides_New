
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart, Users, Store, Bike, DollarSign } from "lucide-react";

export default function AdminAnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Platform Analytics</h1>
        <p className="text-muted-foreground">
          Review key metrics and performance indicators for the entire platform.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Analytics Dashboard</CardTitle>
          <CardDescription>
            This page will contain detailed charts and graphs for platform-wide analytics.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center gap-4 text-center text-muted-foreground pt-10">
          <BarChart className="h-24 w-24" />
          <p className="text-lg font-semibold">Coming Soon</p>
          <p>Detailed analytics will be available here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
