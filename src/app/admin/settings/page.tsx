'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Settings, DollarSign, Truck, Bell, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { getPlatformSettings, updatePlatformSettings, type PlatformSettings } from './actions';

export default function AdminSettingsPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState<PlatformSettings>({
    platformFee: '10',
    deliveryFee: '500',
    minOrderAmount: '1000',
    maxDeliveryRadius: '15',
    autoApproveVendors: false,
    autoApproveRiders: false,
    enableNotifications: true,
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const result = await getPlatformSettings();
        if (result.success && result.data) {
          setSettings(result.data);
        }
      } catch (error) {
        console.error('Failed to fetch settings:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load settings.',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, [toast]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const result = await updatePlatformSettings(settings);
      if (result.success) {
        toast({
          title: 'Settings saved',
          description: 'Platform settings have been updated successfully.',
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to save settings.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

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
        <Button onClick={handleSave} size="lg" disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Changes'
          )}
        </Button>
      </div>
    </div>
  );
}
