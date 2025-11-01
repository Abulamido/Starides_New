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
    switch (status.toLowerCase()) {
      case 'verified':
        return 'border-green-300 bg-green-50 text-green-800 dark:bg-green-900/50 dark:text-green-300';
      default:
        return 'border-gray-300 bg-gray-50 text-gray-800 dark:bg-gray-900/50 dark:text-gray-300';
    }
  };

  const getOnlineBadgeColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'online':
        return 'border-sky-300 bg-sky-50 text-sky-800 dark:bg-sky-900/50 dark:text-sky-300';
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
            {rider.verificationStatus}
          </Badge>
          <Badge variant="outline" className={cn(getOnlineBadgeColor(rider.onlineStatus))}>
            {rider.onlineStatus}
          </Badge>
        </div>
      </div>
      <Button size="icon" variant={isEnabled ? 'secondary': 'outline'} onClick={() => setIsEnabled(!isEnabled)}>
        <Power className={cn("h-5 w-5", isEnabled ? 'text-primary': 'text-muted-foreground')} />
      </Button>
    </Card>
  );
}
