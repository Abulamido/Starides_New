'use client';

import type { AdminRider } from '@/lib/data';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Power } from 'lucide-react';
import { Button } from './ui/button';
import { useFirestore } from '@/firebase';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { useEffect } from 'react';

type AdminRiderCardProps = {
  rider: AdminRider;
};

export function AdminRiderCard({ rider }: AdminRiderCardProps) {
  // Default to true if enabled is undefined
  const [isEnabled, setIsEnabled] = useState(rider.enabled ?? true);
  const firestore = useFirestore();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [riderDetails, setRiderDetails] = useState(rider);

  // Sync isEnabled with rider.enabled when it changes
  useEffect(() => {
    setIsEnabled(rider.enabled ?? true);
  }, [rider.enabled]);

  useEffect(() => {
    if (!firestore || (rider.name && rider.vehicle)) return;

    const fetchUserDetails = async () => {
      try {
        const userDoc = await getDoc(doc(firestore, 'users', rider.userId));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setRiderDetails(prev => ({
            ...prev,
            name: prev.name || `${userData.firstName} ${userData.lastName}`,
            vehicle: prev.vehicle || 'Motorcycle' // Default if not found
          }));
        }
      } catch (error) {
        console.error("Error fetching user details:", error);
      }
    };
    fetchUserDetails();
  }, [firestore, rider.userId, rider.name, rider.vehicle]);

  const handleStatusUpdate = async (newStatus: 'Verified' | 'Rejected') => {
    setIsLoading(true);
    try {
      const { updateRiderStatus } = await import('@/app/admin/riders/actions');
      const result = await updateRiderStatus(rider.id, {
        verificationStatus: newStatus,
        enabled: newStatus === 'Verified'
      });

      if (result.success) {
        // Check for Project Mismatch
        // @ts-ignore
        if (result.projectId && result.projectId !== 'studio-2143552053-ccbad') {
          toast({
            variant: "destructive",
            title: "Configuration Mismatch Detected",
            // @ts-ignore
            description: `Client is on 'studio-2143552053-ccbad' but Server is on '${result.projectId}'. Please fix .env.local or src/firebase/config.ts.`,
            duration: 10000,
          });
          return;
        }

        toast({
          title: `Rider ${newStatus}`,
          description: `${rider.name} has been ${newStatus.toLowerCase()}.`,
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      console.error("Error updating rider status:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update rider status.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleEnabled = async () => {
    setIsLoading(true);
    const newState = !isEnabled;
    setIsEnabled(newState); // Optimistic update
    try {
      const { updateRiderStatus } = await import('@/app/admin/riders/actions');
      const result = await updateRiderStatus(rider.id, { enabled: newState });

      if (result.success) {
        toast({
          title: `Rider ${newState ? 'Enabled' : 'Disabled'}`,
          description: `${riderDetails.name || 'Rider'} has been ${newState ? 'enabled' : 'disabled'}.`,
        });
      } else {
        setIsEnabled(!newState); // Revert on failure
        throw new Error(result.error);
      }
    } catch (error: any) {
      console.error("Error toggling rider:", error);
      setIsEnabled(!newState); // Revert on error
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update rider status.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  const getVerificationBadgeColor = (status: string) => {
    if (!status) return 'border-gray-300 bg-gray-50 text-gray-800 dark:bg-gray-900/50 dark:text-gray-300';
    switch (status.toLowerCase()) {
      case 'verified':
        return 'border-green-300 bg-green-50 text-green-800 dark:bg-green-900/50 dark:text-green-300';
      case 'unverified':
        return 'border-yellow-300 bg-yellow-50 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300';
      default:
        return 'border-gray-300 bg-gray-50 text-gray-800 dark:bg-gray-900/50 dark:text-gray-300';
    }
  };

  const getOnlineBadgeColor = (status: string) => {
    if (!status) return 'border-gray-300 bg-gray-50 text-gray-800 dark:bg-gray-900/50 dark:text-gray-300';
    switch (status.toLowerCase()) {
      case 'online':
        return 'border-blue-300 bg-blue-50 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300';
      case 'offline':
        return 'border-gray-300 bg-gray-50 text-gray-800 dark:bg-gray-900/50 dark:text-gray-300';
      default:
        return 'border-gray-300 bg-gray-50 text-gray-800 dark:bg-gray-900/50 dark:text-gray-300';
    }
  };

  return (
    <Card className="flex flex-col p-4 gap-4">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <h3 className="text-base font-bold">{riderDetails.name || 'Unknown Rider'}</h3>
          <p className="text-sm text-muted-foreground capitalize">{riderDetails.vehicle || 'Unknown Vehicle'}</p>
          {riderDetails.email && <p className="text-xs text-muted-foreground">{riderDetails.email}</p>}
          {riderDetails.phoneNumber && <p className="text-xs text-muted-foreground">{riderDetails.phoneNumber}</p>}
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={cn(getVerificationBadgeColor(riderDetails.verificationStatus || 'Unverified'))}>
              {riderDetails.verificationStatus || 'Unverified'}
            </Badge>
            <Badge variant="outline" className={cn(getOnlineBadgeColor(riderDetails.onlineStatus || 'Offline'))}>
              {riderDetails.onlineStatus || 'Offline'}
            </Badge>
          </div>
        </div>
        <Button size="icon" variant={isEnabled ? 'secondary' : 'outline'} onClick={toggleEnabled} disabled={isLoading}>
          <Power className={cn("h-5 w-5", isEnabled ? 'text-primary' : 'text-muted-foreground')} />
        </Button>
      </div>

      <div className="flex gap-2 mt-2">
        {rider.verificationStatus !== 'Verified' && (
          <>
            <Button
              size="sm"
              className="w-full bg-green-600 hover:bg-green-700 text-white"
              onClick={() => handleStatusUpdate('Verified')}
              disabled={isLoading}
            >
              {rider.verificationStatus === 'Rejected' ? 'Re-Verify' : 'Verify'}
            </Button>
            {rider.verificationStatus !== 'Rejected' && (
              <Button
                size="sm"
                variant="destructive"
                className="w-full"
                onClick={() => handleStatusUpdate('Rejected')}
                disabled={isLoading}
              >
                Reject
              </Button>
            )}
          </>
        )}
      </div>
    </Card>
  );
}
