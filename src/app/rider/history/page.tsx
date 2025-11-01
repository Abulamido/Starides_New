
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { History } from "lucide-react";

export default function RiderHistoryPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Delivery History</h1>
        <p className="text-muted-foreground">
          Review your past deliveries.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Completed Deliveries</CardTitle>
          <CardDescription>
            This page will show a detailed history of all your completed deliveries.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center gap-4 text-center text-muted-foreground pt-10">
          <History className="h-24 w-24" />
          <p className="text-lg font-semibold">Coming Soon</p>
          <p>Your delivery history will be available here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
