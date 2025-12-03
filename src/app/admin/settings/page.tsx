'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Settings, DollarSign, Truck, Bell } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export default function AdminSettingsPage() {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    platformFee: '10',
    deliveryFee: '500',
    minOrderAmount: '1000',
    maxDeliveryRadius: '15',
    autoApproveVendors: false,
    autoApproveRiders: false,
    enableNotifications: true,
  });

  const handleSave = () => {
    toast({
      title: 'Settings saved',
      description: 'Platform settings have been updated successfully.',
    });
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Platform Settings</h1>
        <p className="text-muted-foreground">Configure global settings for the marketplace</p>
      </div>

      {/* Fees & Pricing */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            <CardTitle>Fees & Pricing</CardTitle>
          </div>
          <CardDescription>Configure platform fees and pricing</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="platformFee">Platform Fee (%)</Label>
              <Input
                id="platformFee"
                type="number"
                value={settings.platformFee}
                onChange={(e) => setSettings({ ...settings, platformFee: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="deliveryFee">Base Delivery Fee (₦)</Label>
              <Input
                id="deliveryFee"
                type="number"
                value={settings.deliveryFee}
                onChange={(e) => setSettings({ ...settings, deliveryFee: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="minOrder">Minimum Order Amount (₦)</Label>
              <Input
                id="minOrder"
                type="number"
                value={settings.minOrderAmount}
                onChange={(e) => setSettings({ ...settings, minOrderAmount: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxRadius">Max Delivery Radius (km)</Label>
              <Input
                id="maxRadius"
                type="number"
                value={settings.maxDeliveryRadius}
                onChange={(e) => setSettings({ ...settings, maxDeliveryRadius: e.target.value })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Approval Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            <CardTitle>Approval Settings</CardTitle>
          </div>
          <CardDescription>Configure automatic approval settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Auto-approve Vendors</Label>
              <p className="text-sm text-muted-foreground">Automatically approve new vendor registrations</p>
            </div>
            <Switch
              checked={settings.autoApproveVendors}
              onCheckedChange={(checked) => setSettings({ ...settings, autoApproveVendors: checked })}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Auto-approve Riders</Label>
              <p className="text-sm text-muted-foreground">Automatically approve new rider registrations</p>
            </div>
            <Switch
              checked={settings.autoApproveRiders}
              onCheckedChange={(checked) => setSettings({ ...settings, autoApproveRiders: checked })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            <CardTitle>Notifications</CardTitle>
          </div>
          <CardDescription>Configure platform notifications</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable Notifications</Label>
              <p className="text-sm text-muted-foreground">Send notifications to users</p>
            </div>
            <Switch
              checked={settings.enableNotifications}
              onCheckedChange={(checked) => setSettings({ ...settings, enableNotifications: checked })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} size="lg">
          Save Changes
        </Button>
      </div>
    </div>
  );
}
