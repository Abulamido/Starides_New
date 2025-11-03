'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {useEffect} from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Optionally log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
            <Card className="w-full max-w-md text-center">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-destructive">
                        Something Went Wrong
                    </CardTitle>
                    <CardDescription>
                        We encountered an unexpected error. Please try again.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="mb-4 text-sm text-muted-foreground">
                        If the problem persists, please contact support.
                    </p>
                    <Button onClick={() => reset()}>
                        Try Again
                    </Button>
                </CardContent>
            </Card>
        </div>
      </body>
    </html>
  );
}
