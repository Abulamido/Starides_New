import React from 'react';
import Image from 'next/image';

export function StaridesLogo({ className }: { className?: string }) {
  return (
    <div className={`relative flex items-center ${className}`}>
      <Image
        src="/logo_option_b.png"
        alt="Starides Logo"
        width={150}
        height={50}
        className="object-contain"
        style={{ width: 'auto', height: 'auto' }}
        priority
        unoptimized
      />
    </div>
  );
}
