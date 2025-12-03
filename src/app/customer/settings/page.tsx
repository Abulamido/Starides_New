'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useUser, useFirestore, useMemoFirebase, useDoc, useCollection } from '@/firebase';
import { Loader2, User, MapPin, Plus, Trash2, Bell } from 'lucide-react';
import { useState, useEffect } from 'react';
import { doc, collection } from 'firebase/firestore';
import { updateCustomerProfile, addDeliveryAddress, deleteDeliveryAddress, setDefaultAddress, type DeliveryAddress } from './actions';
import { useToast } from '@/hooks/use-toast';
import { MapsProvider } from '@/components/maps/maps-provider';
import { AddressAutocomplete } from '@/components/address-autocomplete';
import { ImageUpload } from '@/components/image-upload';
import { Switch } from '@/components/ui/switch';

export default function CustomerSettingsPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);

  // Fetch user data from Firestore
  const userQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: userData, isLoading: isUserDataLoading } = useDoc(userQuery);

  // Fetch addresses from Firestore
  const addressesQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, `users/${user.uid}/addresses`);
  }, [firestore, user]);

  const { data: addressesData, isLoading: isAddressesLoading } = useCollection<DeliveryAddress>(addressesQuery);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });

  const [newAddress, setNewAddress] = useState({
    label: '',
    address: '',
    city: '',
    state: '',
  });

  const [notificationPreferences, setNotificationPreferences] = useState({
    orderUpdates: true,
    promotions: true,
    soundEnabled: true,
  });

  // Update form when user data loads
  useEffect(() => {
    if (userData) {
      setFormData({
        name: userData.displayName || '',
        email: userData.email || user?.email || '',
        phone: userData.phone || '',
      });
      if (userData.notificationPreferences) {
        setNotificationPreferences({
          orderUpdates: userData.notificationPreferences.orderUpdates ?? true,
          promotions: userData.notificationPreferences.promotions ?? true,
          soundEnabled: userData.notificationPreferences.soundEnabled ?? true,
        });
      }
    }
  }, [userData, user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewAddress(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSave = async () => {
    if (!user) return;

    setIsSaving(true);
    try {
      const result = await updateCustomerProfile(user.uid, {
        displayName: formData.name,
        phone: formData.phone,
        email: formData.email,
        notificationPreferences,
      });

      if (result.success) {
        toast({
          title: 'Profile updated',
          description: 'Your profile has been updated successfully.',
        });
      } else {
        throw new Error(result.error);
      }
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

  const handleAddAddress = async () => {
    if (!user) return;
    if (!newAddress.label || !newAddress.address || !newAddress.city || !newAddress.state) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please fill in all address fields.',
      });
      return;
    }

    try {
      const result = await addDeliveryAddress(user.uid, {
        ...newAddress,
        isDefault: !addressesData || addressesData.length === 0,
      });

      if (result.success) {
        toast({
          title: 'Address added',
          description: 'Your delivery address has been added successfully.',
        });
        setNewAddress({ label: '', address: '', city: '', state: '' });
        setShowAddressForm(false);
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to add address.',
      });
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (!user) return;

    try {
      const result = await deleteDeliveryAddress(user.uid, addressId);

      if (result.success) {
        toast({
          title: 'Address deleted',
          description: 'Your delivery address has been removed.',
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to delete address.',
      });
    }
  };

  const handleSetDefault = async (addressId: string) => {
    if (!user) return;

    try {
      const result = await setDefaultAddress(user.uid, addressId);

      if (result.success) {
        toast({
          title: 'Default address updated',
          description: 'Your default delivery address has been changed.',
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to set default address.',
      });
    }
  };

  if (isUserLoading || isUserDataLoading || isAddressesLoading) {
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
        <p className="text-muted-foreground">Manage your profile and delivery addresses</p>
      </div>

      {/* Profile Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="h-5 w-5" />
            <CardTitle>Profile Information</CardTitle>
          </div>
          <CardDescription>Update your personal details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <ImageUpload
            currentImageUrl={userData?.photoURL}
            path={`users/${user?.uid}/profile`}
            onImageUploaded={async (url) => {
              if (user) {
                await updateCustomerProfile(user.uid, { photoURL: url });
              }
            }}
          />

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
              placeholder="you@example.com"
              disabled
            />
            <p className="text-xs text-muted-foreground">Email cannot be changed</p>
          </div>
        </CardContent>
      </Card>

      {/* Delivery Addresses */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                <CardTitle>Delivery Addresses</CardTitle>
              </div>
              <CardDescription>Manage your saved delivery locations</CardDescription>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowAddressForm(!showAddressForm)}
            >
              <Plus className="h-4 w-4 mr-2" />
              {showAddressForm ? 'Cancel' : 'Add New'}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add New Address Form */}
          {showAddressForm && (
            <div className="border rounded-lg p-4 space-y-3 bg-muted/30">
              <h4 className="font-medium">New Address</h4>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="newLabel">Label</Label>
                  <Input
                    id="newLabel"
                    name="label"
                    value={newAddress.label}
                    onChange={handleAddressChange}
                    placeholder="e.g., Home, Work"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <MapsProvider>
                    <AddressAutocomplete
                      onAddressSelect={(data) => {
                        setNewAddress(prev => ({
                          ...prev,
                          address: data.fullAddress,
                          city: data.city,
                          state: data.state
                        }));
                      }}
                      defaultValue={newAddress.address}
                    />
                  </MapsProvider>
                </div>
                {/* Hidden inputs for manual fallback if needed, or just display them as read-only/editable */}
                <div className="space-y-2">
                  <Label htmlFor="newCity">City</Label>
                  <Input
                    id="newCity"
                    name="city"
                    value={newAddress.city}
                    onChange={handleAddressChange}
                    placeholder="City"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newState">State</Label>
                  <Input
                    id="newState"
                    name="state"
                    value={newAddress.state}
                    onChange={handleAddressChange}
                    placeholder="State"
                  />
                </div>
              </div>
              <Button onClick={handleAddAddress} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Address
              </Button>
            </div>
          )}

          {/* Existing Addresses */}
          {addressesData && addressesData.length > 0 ? (
            <div className="space-y-3">
              {addressesData.map((address) => (
                <div
                  key={address.id}
                  className="flex items-start justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{address.label}</h4>
                      {address.isDefault && (
                        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {address.address}, {address.city}, {address.state}
                    </p>
                    <div className="flex gap-2 mt-2">
                      {!address.isDefault && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleSetDefault(address.id!)}
                        >
                          Set as Default
                        </Button>
                      )}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDeleteAddress(address.id!)}
                    disabled={address.isDefault}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              No delivery addresses yet. Click "Add New" to create one.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Notification Preferences */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            <CardTitle>Notification Preferences</CardTitle>
          </div>
          <CardDescription>Manage how you receive notifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Order Updates</Label>
              <p className="text-sm text-muted-foreground">Receive notifications about order status changes</p>
            </div>
            <Switch
              checked={notificationPreferences.orderUpdates}
              onCheckedChange={(checked) => setNotificationPreferences(prev => ({ ...prev, orderUpdates: checked }))}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Promotional Offers</Label>
              <p className="text-sm text-muted-foreground">Receive notifications about deals and offers</p>
            </div>
            <Switch
              checked={notificationPreferences.promotions}
              onCheckedChange={(checked) => setNotificationPreferences(prev => ({ ...prev, promotions: checked }))}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Sound Notifications</Label>
              <p className="text-sm text-muted-foreground">Play sound when receiving notifications</p>
            </div>
            <Switch
              checked={notificationPreferences.soundEnabled}
              onCheckedChange={(checked) => setNotificationPreferences(prev => ({ ...prev, soundEnabled: checked }))}
            />
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
    </div >
  );
}
