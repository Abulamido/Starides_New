'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useUser, useFirestore, useMemoFirebase, useDoc } from '@/firebase';
import { Loader2, Store, MapPin, Clock, Phone, Mail } from 'lucide-react';
import { useState, useEffect } from 'react';
import { doc } from 'firebase/firestore';
import { updateVendorSettings } from './actions';
import { useToast } from '@/hooks/use-toast';
import { MapsProvider } from '@/components/maps/maps-provider';
import { AddressAutocomplete } from '@/components/maps/address-autocomplete';
import { ImageUpload } from '@/components/image-upload';
import { Switch } from '@/components/ui/switch';
import { useDoc as useDocUser } from '@/firebase'; // Added to fetch user doc for notifications

export default function VendorSettingsPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  // Fetch vendor data from Firestore
  const vendorQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'vendors', user.uid);
  }, [firestore, user]);

  const { data: vendorData, isLoading: isVendorLoading } = useDoc(vendorQuery);

  // Fetch user data from Firestore
  const userQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  // Fetch user data for notification preferences
  const { data: userData } = useDocUser(userQuery);

  const [formData, setFormData] = useState({
    businessName: '',
    description: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    openTime: '08:00',
    closeTime: '20:00',
    deliveryRadius: '10',
    latitude: null as number | null,
    longitude: null as number | null,
    notificationPreferences: {
      orderUpdates: true,
      promotions: true,
      soundEnabled: true,
    },
  });

  // Update form when vendor data loads
  useEffect(() => {
    if (vendorData) {
      setFormData({
        businessName: vendorData.businessName || '',
        description: vendorData.description || '',
        phone: vendorData.phone || '',
        email: vendorData.email || user?.email || '',
        address: vendorData.address || '',
        city: vendorData.city || '',
        state: vendorData.state || '',
        openTime: vendorData.operatingHours?.opening || '08:00',
        closeTime: vendorData.operatingHours?.closing || '20:00',
        deliveryRadius: vendorData.deliveryRadius?.toString() || '10',
        latitude: vendorData.location?.lat || null,
        longitude: vendorData.location?.lng || null,
        notificationPreferences: {
          orderUpdates: userData?.notificationPreferences?.orderUpdates ?? true,
          promotions: userData?.notificationPreferences?.promotions ?? true,
          soundEnabled: userData?.notificationPreferences?.soundEnabled ?? true,
        },
      });
    }
  }, [vendorData, user, userData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleAddressSelect = (address: string, lat: number, lng: number) => {
    // Parse city and state from the address if possible
    const parts = address.split(',').map(p => p.trim());
    const city = parts.length > 1 ? parts[parts.length - 2] : '';
    const state = parts.length > 2 ? parts[parts.length - 1] : '';

    setFormData(prev => ({
      ...prev,
      address: parts[0] || address,
      city: city || prev.city,
      state: state || prev.state,
      latitude: lat,
      longitude: lng,
    }));
  };

  const handleSave = async () => {
    if (!user) return;

    setIsSaving(true);
    try {
      const settingsData: any = {
        businessName: formData.businessName,
        description: formData.description,
        phone: formData.phone,
        email: formData.email,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        deliveryRadius: parseFloat(formData.deliveryRadius),
        operatingHours: {
          opening: formData.openTime,
          closing: formData.closeTime,
        },
      };

      // Add location if available
      if (formData.latitude !== null && formData.longitude !== null) {
        settingsData.location = {
          lat: formData.latitude,
          lng: formData.longitude,
        };
      }

      const result = await updateVendorSettings(user.uid, {
        ...settingsData,
        notificationPreferences: formData.notificationPreferences,
      });

      if (result.success) {
        toast({
          title: 'Settings saved',
          description: 'Your restaurant settings have been updated successfully.',
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      console.error('Settings save error:', error);

      let errorMessage = error.message || 'Failed to save settings.';

      // Provide helpful message for permission errors
      if (error.message?.includes('PERMISSION_DENIED') || error.message?.includes('permission')) {
        errorMessage = 'Permission denied. Please try logging out and back in, or contact support if the issue persists.';
      }

      toast({
        variant: 'destructive',
        title: 'Error',
        description: errorMessage,
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isUserLoading || isVendorLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <MapsProvider>
      <div className="space-y-6 max-w-4xl">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">Manage your restaurant information and preferences</p>
        </div>

        {/* Business Information */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Store className="h-5 w-5" />
              <CardTitle>Business Information</CardTitle>
            </div>
            <CardDescription>Update your restaurant details and description</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-6">
              <ImageUpload
                currentImageUrl={vendorData?.logoUrl}
                path={`vendors/${user?.uid}/logo`}
                label="Store Logo"
                onImageUploaded={async (url) => {
                  if (user) {
                    await updateVendorSettings(user.uid, { logoUrl: url });
                  }
                }}
              />
              <ImageUpload
                currentImageUrl={vendorData?.bannerUrl}
                path={`vendors/${user?.uid}/banner`}
                label="Store Banner"
                onImageUploaded={async (url) => {
                  if (user) {
                    await updateVendorSettings(user.uid, { bannerUrl: url });
                  }
                }}
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="businessName">Business Name</Label>
                <Input
                  id="businessName"
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleChange}
                  placeholder="Enter business name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+234 800 000 0000"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="business@example.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Tell customers about your restaurant..."
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        {/* Location */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              <CardTitle>Location</CardTitle>
            </div>
            <CardDescription>Your restaurant address and delivery area</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="address">Street Address</Label>
              <AddressAutocomplete
                onSelect={handleAddressSelect}
                defaultValue={formData.address}
              />
              <p className="text-xs text-muted-foreground">
                Start typing to see address suggestions
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="Lagos"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="Lagos State"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="deliveryRadius">Delivery Radius (km)</Label>
              <Input
                id="deliveryRadius"
                name="deliveryRadius"
                type="number"
                value={formData.deliveryRadius}
                onChange={handleChange}
                placeholder="10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Notification Preferences */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Loader2 className="h-5 w-5" />
              <CardTitle>Notification Preferences</CardTitle>
            </div>
            <CardDescription>Manage how you receive notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Order Updates</Label>
                <p className="text-sm text-muted-foreground">Receive notifications about new orders and status changes</p>
              </div>
              <Switch
                checked={formData.notificationPreferences.orderUpdates}
                onCheckedChange={(checked) => setFormData(prev => ({
                  ...prev,
                  notificationPreferences: { ...prev.notificationPreferences, orderUpdates: checked }
                }))}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Sound Notifications</Label>
                <p className="text-sm text-muted-foreground">Play sound when receiving notifications</p>
              </div>
              <Switch
                checked={formData.notificationPreferences.soundEnabled}
                onCheckedChange={(checked) => setFormData(prev => ({
                  ...prev,
                  notificationPreferences: { ...prev.notificationPreferences, soundEnabled: checked }
                }))}
              />
            </div>
          </CardContent>
        </Card>

        {/* Operating Hours */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              <CardTitle>Operating Hours</CardTitle>
            </div>
            <CardDescription>Set your restaurant's opening and closing times</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="openTime">Opening Time</Label>
                <Input
                  id="openTime"
                  name="openTime"
                  type="time"
                  value={formData.openTime}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="closeTime">Closing Time</Label>
                <Input
                  id="closeTime"
                  name="closeTime"
                  type="time"
                  value={formData.closeTime}
                  onChange={handleChange}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={isSaving} size="lg">
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
    </MapsProvider>
  );
}
