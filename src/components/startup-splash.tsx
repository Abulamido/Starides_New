'use client';

import { StaridesLogo } from '@/components/starides-logo';

/**
 * StartupSplash - A branded loading screen for PWA cold-starts.
 * 
 * This component is shown during Firebase auth restoration to prevent
 * any UI flash or the landing page appearing briefly. It provides a
 * polished, branded experience for users opening the installed PWA.
 */
export function StartupSplash() {
    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
            <div className="relative">
                {/* Animated glow effect behind logo */}
                <div className="absolute inset-0 bg-[#6186a8]/20 rounded-full blur-3xl animate-pulse" />
                <div className="neumorphic-flat p-8 relative animate-in fade-in zoom-in duration-500">
                    <StaridesLogo className="h-24 w-auto animate-pulse" />
                </div>
            </div>
            <div className="mt-8 flex flex-col items-center gap-2">
                {/* Progress bar */}
                <div className="h-1.5 w-48 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-[#6186a8] animate-progress-extended rounded-full" />
                </div>
                <p className="text-sm font-medium text-muted-foreground animate-pulse">
                    Getting things ready...
                </p>
            </div>
        </div>
    );
}
