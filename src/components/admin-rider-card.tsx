'use client';

import type { AdminRider } from '@/lib/data';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Power } from 'lucide-react';
import { Button } from './ui/button';
import { useFirestore } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';

type AdminRiderCardProps = {
  rider: AdminRider;
};

export function AdminRiderCard({ rider }: AdminRiderCardProps) {
  const [isEnabled, setIsEnabled] = useState(rider.enabled);
  const firestore = useFirestore();
  const [isLoading, setIsLoading] = useState(false);

  const handleStatusUpdate = async (newStatus: 'Verified' | 'Rejected') => {
    if (!firestore) return;
    setIsLoading(true);
    try {
      const riderRef = doc(firestore, 'riders', rider.id);
      await updateDoc(riderRef, {
        verificationStatus: newStatus,
        enabled: newStatus === 'Verified'
      });
    } catch (error) {
      console.error("Error updating rider status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleEnabled = async () => {
    if (!firestore) return;
    setIsLoading(true);
    const newState = !isEnabled;
    setIsEnabled(newState); // Optimistic update
    try {
      const riderRef = doc(firestore, 'riders', rider.id);
      await updateDoc(riderRef, { enabled: newState });
    } catch (error) {
      console.error("Error toggling rider:", error);
      setIsEnabled(!newState); // Revert on error
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
          <h3 className="text-base font-bold">{rider.name}</h3>
          <p className="text-sm text-muted-foreground capitalize">{rider.vehicle}</p>
          {rider.email && <p className="text-xs text-muted-foreground">{rider.email}</p>}
          {rider.phoneNumber && <p className="text-xs text-muted-foreground">{rider.phoneNumber}</p>}
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={cn(getVerificationBadgeColor(rider.verificationStatus || 'Unverified'))}>
              {rider.verificationStatus || 'Unverified'}
            </Badge>
            <Badge variant="outline" className={cn(getOnlineBadgeColor(rider.onlineStatus || 'Offline'))}>
              {rider.onlineStatus || 'Offline'}
            </Badge>
          </div>
        </div>
        <Button size="icon" variant={isEnabled ? 'secondary' : 'outline'} onClick={toggleEnabled} disabled={isLoading}>
          <Power className={cn("h-5 w-5", isEnabled ? 'text-primary' : 'text-muted-foreground')} />
        </Button>
      </div>

      {rider.verificationStatus === 'Unverified' && (
        <div className="flex gap-2 mt-2">
          <Button
            size="sm"
            className="w-full bg-green-600 hover:bg-green-700 text-white"
            onClick={() => handleStatusUpdate('Verified')}
            disabled={isLoading}
          >
            Verify
          </Button>
          <Button
            size="sm"
            variant="destructive"
            className="w-full"
            onClick={() => handleStatusUpdate('Rejected')}
            disabled={isLoading}
          >
            Reject
          </Button>
        </div>
      )}
    </Card>
  );
}
