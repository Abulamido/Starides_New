'use client';

import type { AdminVendor } from '@/lib/data';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Power } from 'lucide-react';
import { Button } from './ui/button';
import { useFirestore } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

type AdminVendorCardProps = {
  vendor: AdminVendor;
};

export function AdminVendorCard({ vendor }: AdminVendorCardProps) {
  const [isEnabled, setIsEnabled] = useState(vendor.enabled);
  const firestore = useFirestore();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleStatusUpdate = async (newStatus: 'Approved' | 'Rejected') => {
    if (!firestore) return;
    setIsLoading(true);
    try {
      const vendorRef = doc(firestore, 'vendors', vendor.id);
      await updateDoc(vendorRef, {
        approvalStatus: newStatus,
        activeStatus: newStatus === 'Approved' ? 'Active' : 'Inactive',
        enabled: newStatus === 'Approved'
      });

      toast({
        title: `Vendor ${newStatus}`,
        description: `${vendor.name} has been ${newStatus.toLowerCase()}.`,
      });
    } catch (error) {
      console.error("Error updating vendor status:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update vendor status.",
      });
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
      const vendorRef = doc(firestore, 'vendors', vendor.id);
      await updateDoc(vendorRef, {
        enabled: newState,
        activeStatus: newState ? 'Active' : 'Inactive'
      });
    } catch (error) {
      console.error("Error toggling vendor:", error);
      setIsEnabled(!newState); // Revert on error
    } finally {
      setIsLoading(false);
    }
  }

  const getApprovalBadgeColor = (status: string) => {
    if (!status) return 'border-gray-300 bg-gray-50 text-gray-800 dark:bg-gray-900/50 dark:text-gray-300';
    switch (status.toLowerCase()) {
      case 'pending':
        return 'border-yellow-300 bg-yellow-50 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300';
      case 'approved':
        return 'border-green-300 bg-green-50 text-green-800 dark:bg-green-900/50 dark:text-green-300';
      case 'rejected':
        return 'border-red-300 bg-red-50 text-red-800 dark:bg-red-900/50 dark:text-red-300';
      default:
        return 'border-gray-300 bg-gray-50 text-gray-800 dark:bg-gray-900/50 dark:text-gray-300';
    }
  };

  const getActiveBadgeColor = (status: string) => {
    if (!status) return 'border-gray-300 bg-gray-50 text-gray-800 dark:bg-gray-900/50 dark:text-gray-300';
    switch (status.toLowerCase()) {
      case 'active':
        return 'border-blue-300 bg-blue-50 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300';
      case 'inactive':
        return 'border-gray-300 bg-gray-50 text-gray-800 dark:bg-gray-900/50 dark:text-gray-300';
      default:
        return 'border-gray-300 bg-gray-50 text-gray-800 dark:bg-gray-900/50 dark:text-gray-300';
    }
  };

  return (
    <Card className="flex flex-col p-4 gap-4">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <h3 className="text-base font-bold">{vendor.name}</h3>
          <p className="text-sm text-muted-foreground capitalize">{vendor.category}</p>
          {vendor.email && <p className="text-xs text-muted-foreground">{vendor.email}</p>}
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={cn(getApprovalBadgeColor(vendor.approvalStatus || 'Pending'))}>
              {vendor.approvalStatus || 'Pending'}
            </Badge>
            <Badge variant="outline" className={cn(getActiveBadgeColor(vendor.activeStatus || 'Inactive'))}>
              {vendor.activeStatus || 'Inactive'}
            </Badge>
          </div>
        </div>
        <Button size="icon" variant={isEnabled ? 'secondary' : 'outline'} onClick={toggleEnabled} disabled={isLoading}>
          <Power className={cn("h-5 w-5", isEnabled ? 'text-primary' : 'text-muted-foreground')} />
        </Button>
      </div>

      <div className="flex gap-2 mt-2">
        {vendor.approvalStatus !== 'Approved' && (
          <>
            <Button
              size="sm"
              className="w-full bg-green-600 hover:bg-green-700 text-white"
              onClick={() => handleStatusUpdate('Approved')}
              disabled={isLoading}
            >
              {vendor.approvalStatus === 'Rejected' ? 'Re-Approve' : 'Approve'}
            </Button>
            {vendor.approvalStatus !== 'Rejected' && (
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
