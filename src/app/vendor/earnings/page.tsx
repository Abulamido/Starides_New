
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DollarSign } from "lucide-react";

export default function VendorEarningsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Your Earnings</h1>
        <p className="text-muted-foreground">
          Track your sales, revenue, and payouts.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Earnings Dashboard</CardTitle>
          <CardDescription>
            This page will show your total revenue, payout history, and options to manage your bank details.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center gap-4 text-center text-muted-foreground pt-10">
          <DollarSign className="h-24 w-24" />
          <p className="text-lg font-semibold">Coming Soon</p>
          <p>Your earnings and payout information will be displayed here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
