'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useUser, useFirestore, useMemoFirebase, useDoc } from '@/firebase';
import { Loader2, User, Bike, FileText } from 'lucide-react';
import { useState, useEffect } from 'react';
import { doc } from 'firebase/firestore';
import { updateRiderAvailability, updateRiderProfile, updateRiderVehicle, updateRiderDocuments } from './actions';
import { useToast } from '@/hooks/use-toast';

export default function RiderProfilePage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  // Fetch rider data from Firestore
  const userQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: userData, isLoading: isUserDataLoading } = useDoc(userQuery);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    vehicleType: '',
    vehiclePlate: '',
    licenseNumber: '',
    address: '',
  });

  const [availability, setAvailability] = useState({
    isOnline: false,
    acceptingOrders: false,
  });

  // Update form when user data loads
  useEffect(() => {
    if (userData) {
      setFormData({
        name: userData.displayName || '',
        email: userData.email || user?.email || '',
        phone: userData.phone || '',
        vehicleType: userData.riderProfile?.vehicle?.type || '',
        vehiclePlate: userData.riderProfile?.vehicle?.licensePlate || '',
        licenseNumber: userData.riderProfile?.documents?.licenseNumber || '',
        address: userData.address || '',
      });

      setAvailability({
        isOnline: userData.riderProfile?.isOnline || false,
        acceptingOrders: userData.riderProfile?.acceptingOrders || false,
      });
    }
  }, [userData, user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleAvailabilityChange = async (field: 'isOnline' | 'acceptingOrders', value: boolean) => {
    if (!user) return;

    const newAvailability = { ...availability, [field]: value };
    setAvailability(newAvailability);

    try {
      const result = await updateRiderAvailability(user.uid, newAvailability);

      if (result.success) {
        toast({
          title: 'Availability updated',
          description: `You are now ${value ? 'online' : 'offline'}.`,
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      // Revert on error
      setAvailability(availability);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to update availability.',
      });
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setIsSaving(true);
    try {
      // Update profile
      const profileResult = await updateRiderProfile(user.uid, {
        displayName: formData.name,
        phone: formData.phone,
        address: formData.address,
      });

      if (!profileResult.success) {
        throw new Error(profileResult.error);
      }

      // Update vehicle info
      const vehicleResult = await updateRiderVehicle(user.uid, {
        type: formData.vehicleType,
        licensePlate: formData.vehiclePlate,
      });

      if (!vehicleResult.success) {
        throw new Error(vehicleResult.error);
      }

      // Update documents
      const docsResult = await updateRiderDocuments(user.uid, {
        licenseNumber: formData.licenseNumber,
      });

      if (!docsResult.success) {
        throw new Error(docsResult.error);
      }

      toast({
        title: 'Profile updated',
        description: 'Your rider profile has been updated successfully.',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to update profile.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isUserLoading || isUserDataLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground">Manage your rider profile and vehicle information</p>
      </div>

      {/* Availability Status */}
      <Card>
        <CardHeader>
          <CardTitle>Availability Status</CardTitle>
          <CardDescription>Control when you receive delivery requests</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="online-status">Online Status</Label>
              <p className="text-sm text-muted-foreground">
                Make yourself visible to receive orders
              </p>
            </div>
            <Switch
              id="online-status"
              checked={availability.isOnline}
              onCheckedChange={(checked) => handleAvailabilityChange('isOnline', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="accepting-orders">Accepting Orders</Label>
              <p className="text-sm text-muted-foreground">
                Receive new delivery requests
              </p>
            </div>
            <Switch
              id="accepting-orders"
              checked={availability.acceptingOrders}
              onCheckedChange={(checked) => handleAvailabilityChange('acceptingOrders', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Personal Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="h-5 w-5" />
            <CardTitle>Personal Information</CardTitle>
          </div>
          <CardDescription>Your contact details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your name"
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
              disabled
            />
            <p className="text-xs text-muted-foreground">Email cannot be changed</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Your address"
            />
          </div>
        </CardContent>
      </Card>

      {/* Vehicle Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bike className="h-5 w-5" />
            <CardTitle>Vehicle Information</CardTitle>
          </div>
          <CardDescription>Details about your delivery vehicle</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="vehicleType">Vehicle Type</Label>
              <Input
                id="vehicleType"
                name="vehicleType"
                value={formData.vehicleType}
                onChange={handleChange}
                placeholder="Motorcycle, Bicycle, etc."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vehiclePlate">License Plate</Label>
              <Input
                id="vehiclePlate"
                name="vehiclePlate"
                value={formData.vehiclePlate}
                onChange={handleChange}
                placeholder="ABC-123-XY"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Documents */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            <CardTitle>Documents</CardTitle>
          </div>
          <CardDescription>Your license and verification documents</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="licenseNumber">Driver's License Number</Label>
            <Input
              id="licenseNumber"
              name="licenseNumber"
              value={formData.licenseNumber}
              onChange={handleChange}
              placeholder="DL-12345678"
            />
          </div>

          <div className="space-y-2">
            <Label>License Document</Label>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                Upload New
              </Button>
              <span className="text-sm text-muted-foreground">
                Document upload coming soon
              </span>
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
