
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Star } from "lucide-react";

export default function RiderRatingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Your Ratings</h1>
        <p className="text-muted-foreground">
          See feedback from customers.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Customer Feedback</CardTitle>
          <CardDescription>
            This page will display your average rating and individual reviews from customers.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center gap-4 text-center text-muted-foreground pt-10">
          <Star className="h-24 w-24" />
          <p className="text-lg font-semibold">Coming Soon</p>
          <p>Your ratings and reviews will appear here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
