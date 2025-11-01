
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart } from "lucide-react";

export default function VendorAnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground">
          Review your store's performance.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sales Analytics</CardTitle>
          <CardDescription>
            This page will contain detailed charts and graphs for your sales, revenue, and top-selling products.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center gap-4 text-center text-muted-foreground pt-10">
          <BarChart className="h-24 w-24" />
          <p className="text-lg font-semibold">Coming Soon</p>
          <p>Detailed analytics for your store will be available here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
