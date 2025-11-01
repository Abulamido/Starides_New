'use client';

import type { AdminVendor } from '@/lib/data';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Power } from 'lucide-react';
import { Button } from './ui/button';

type AdminVendorCardProps = {
  vendor: AdminVendor;
};

export function AdminVendorCard({ vendor }: AdminVendorCardProps) {
  const [isEnabled, setIsEnabled] = useState(vendor.enabled);

  const getApprovalBadgeColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'border-yellow-300 bg-yellow-50 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300';
      case 'approved':
        return 'border-green-300 bg-green-50 text-green-800 dark:bg-green-900/50 dark:text-green-300';
      default:
        return 'border-gray-300 bg-gray-50 text-gray-800 dark:bg-gray-900/50 dark:text-gray-300';
    }
  };
  
  const getActiveBadgeColor = (status: string) => {
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
    <Card className="flex items-center justify-between p-4">
      <div className="flex flex-col gap-2">
        <h3 className="text-base font-bold">{vendor.name}</h3>
        <p className="text-sm text-muted-foreground capitalize">{vendor.category}</p>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={cn(getApprovalBadgeColor(vendor.approvalStatus))}>
            {vendor.approvalStatus}
          </Badge>
           <Badge variant="outline" className={cn(getActiveBadgeColor(vendor.activeStatus))}>
            {vendor.activeStatus}
          </Badge>
        </div>
      </div>
      <Button size="icon" variant={isEnabled ? 'secondary': 'outline'} onClick={() => setIsEnabled(!isEnabled)}>
        <Power className={cn("h-5 w-5", isEnabled ? 'text-primary': 'text-muted-foreground')} />
      </Button>
    </Card>
  );
}
