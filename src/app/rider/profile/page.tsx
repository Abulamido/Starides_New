
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { User } from "lucide-react";

export default function RiderProfilePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground">
          Manage your profile and account settings.
        </p>
      </div>

       <Card>
        <CardHeader>
          <CardTitle>Your Profile</CardTitle>
          <CardDescription>
            This page will contain forms to update your personal information, vehicle details, and password.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center gap-4 text-center text-muted-foreground pt-10">
          <User className="h-24 w-24" />
          <p className="text-lg font-semibold">Coming Soon</p>
          <p>Profile management features will be available here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
