'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useUser, useFirestore, useMemoFirebase, useDocument } from '@/firebase';
import { Loader2, Store, MapPin, Clock, Phone, Mail } from 'lucide-react';
import { useState, useEffect } from 'react';
import { doc } from 'firebase/firestore';
import { updateVendorSettings } from './actions';
import { useToast } from '@/hooks/use-toast';

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

  const { data: vendorData, isLoading: isVendorLoading } = useDocument(vendorQuery);

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
      });
    }
  }, [vendorData, user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSave = async () => {
    if (!user) return;

    setIsSaving(true);
    try {
      const result = await updateVendorSettings(user.uid, {
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
      });

      if (result.success) {
        toast({
          title: 'Settings saved',
          description: 'Your store settings have been updated successfully.',
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

  if (isUserLoading || isVendorLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your store information and preferences</p>
      </div>

      {/* Business Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Store className="h-5 w-5" />
            <CardTitle>Business Information</CardTitle>
          </div>
          <CardDescription>Update your store details and description</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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
              placeholder="Tell customers about your store..."
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
          <CardDescription>Your store address and delivery area</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="address">Street Address</Label>
            <Input
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="123 Market Street"
            />
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

      {/* Operating Hours */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            <CardTitle>Operating Hours</CardTitle>
          </div>
          <CardDescription>Set your store's opening and closing times</CardDescription>
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
  );
}
