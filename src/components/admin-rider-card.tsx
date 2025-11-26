'use client';

import type { AdminRider } from '@/lib/data';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Power } from 'lucide-react';
import { Button } from './ui/button';

type AdminRiderCardProps = {
  rider: AdminRider;
};

export function AdminRiderCard({ rider }: AdminRiderCardProps) {
  const [isEnabled, setIsEnabled] = useState(rider.enabled);

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
    <Card className="flex items-center justify-between p-4">
      <div className="flex flex-col gap-2">
        <h3 className="text-base font-bold">{rider.name}</h3>
        <p className="text-sm text-muted-foreground capitalize">{rider.vehicle}</p>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={cn(getVerificationBadgeColor(rider.verificationStatus))}>
            {rider.verificationStatus || 'Unknown'}
          </Badge>
          <Badge variant="outline" className={cn(getOnlineBadgeColor(rider.onlineStatus))}>
            {rider.onlineStatus || 'Unknown'}
          </Badge>
        </div>
      </div>
      <Button size="icon" variant={isEnabled ? 'secondary' : 'outline'} onClick={() => setIsEnabled(!isEnabled)}>
        <Power className={cn("h-5 w-5", isEnabled ? 'text-primary' : 'text-muted-foreground')} />
      </Button>
    </Card>
  );
}
