'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useUser } from '@/firebase';
import { Loader2, User, Bike, FileText, MapPin } from 'lucide-react';
import { useState } from 'react';

export default function RiderProfilePage() {
  const { user, isUserLoading } = useUser();
  const [isSaving, setIsSaving] = useState(false);

  // Mock rider data
  const [formData, setFormData] = useState({
    name: user?.displayName || '',
    email: user?.email || '',
    phone: '+234 800 000 0000',
    vehicleType: 'Motorcycle',
    vehiclePlate: 'ABC-123-XY',
    licenseNumber: 'DL-12345678',
    address: '78 Rider Street, Lagos',
  });

  const [availability, setAvailability] = useState({
    isOnline: true,
    acceptingOrders: true,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
  };

  if (isUserLoading) {
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
              onCheckedChange={(checked) =>
                setAvailability(prev => ({ ...prev, isOnline: checked }))
              }
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
              onCheckedChange={(checked) =>
                setAvailability(prev => ({ ...prev, acceptingOrders: checked }))
              }
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
                Current: license.pdf
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
