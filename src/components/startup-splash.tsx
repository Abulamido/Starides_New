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
        <div className="min-h-screen bg-[#6186a8] flex flex-col items-center justify-center p-4">
            {/* Centered logo container */}
            <div className="flex flex-col items-center justify-center flex-1">
                <div className="relative">
                    {/* Animated glow effect behind logo */}
                    <div className="absolute inset-0 bg-white/20 rounded-full blur-3xl animate-pulse" />
                    <div className="bg-white/10 backdrop-blur-sm p-10 rounded-3xl relative animate-in fade-in zoom-in duration-500">
                        <StaridesLogo className="h-28 w-auto animate-pulse [filter:brightness(0)_invert(1)]" />
                    </div>
                </div>
            </div>

            {/* Bottom loading section */}
            <div className="pb-16 flex flex-col items-center gap-3">
                <div className="h-1.5 w-48 bg-white/30 rounded-full overflow-hidden">
                    <div className="h-full bg-white animate-progress-extended rounded-full" />
                </div>
                <p className="text-sm font-medium text-white/80 animate-pulse">
                    Getting things ready...
                </p>
            </div>
        </div>
    );
}
