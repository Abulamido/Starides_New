
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";

export default function AdminReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
        <p className="text-muted-foreground">
          Generate and view platform reports.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Report Generation</CardTitle>
          <CardDescription>
            This page will allow admins to generate financial, user, and sales reports.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center gap-4 text-center text-muted-foreground pt-10">
          <FileText className="h-24 w-24" />
          <p className="text-lg font-semibold">Coming Soon</p>
          <p>The report generation module is under construction.</p>
          <div className="mt-4 flex gap-4">
             <Button>Generate Sales Report</Button>
             <Button variant="secondary">Generate User Report</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
