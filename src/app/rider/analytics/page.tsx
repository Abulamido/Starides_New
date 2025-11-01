
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart } from "lucide-react";

export default function RiderAnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground">
          Review your performance and earnings trends.
        </p>
      </div>

       <Card>
        <CardHeader>
          <CardTitle>Performance Analytics</CardTitle>
          <CardDescription>
            This page will contain detailed charts about your delivery times, acceptance rate, and earnings.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center gap-4 text-center text-muted-foreground pt-10">
          <BarChart className="h-24 w-24" />
          <p className="text-lg font-semibold">Coming Soon</p>
          <p>Your detailed performance analytics will be displayed here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
