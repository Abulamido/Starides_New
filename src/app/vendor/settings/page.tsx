
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Settings } from "lucide-react";

export default function VendorSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Store Settings</h1>
        <p className="text-muted-foreground">
          Manage your store profile, payment information, and policies.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Store Configuration</CardTitle>
          <CardDescription>
            This page will contain forms to update your store name, description, banner image, and other settings.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center gap-4 text-center text-muted-foreground pt-10">
          <Settings className="h-24 w-24" />
          <p className="text-lg font-semibold">Coming Soon</p>
          <p>Store management features will be available here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
