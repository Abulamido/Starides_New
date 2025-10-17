import React from 'react';

export function StaridesLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 48"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      fill="currentColor"
    >
      <path d="M24 0L30.31 16.57L48 18.35L35.22 30.5L38.47 48L24 39.1L9.53 48L12.78 30.5L0 18.35L17.69 16.57L24 0ZM24 9.17L20.75 17.42L12.06 18.52L18.64 24.8L16.97 33.65L24 29.1L31.03 33.65L29.36 24.8L35.94 18.52L27.25 17.42L24 9.17Z" />
      <text
        x="55"
        y="36"
        fontFamily="Arial, sans-serif"
        fontSize="36"
        fontWeight="bold"
      >
        RIDES
      </text>
    </svg>
  );
}
