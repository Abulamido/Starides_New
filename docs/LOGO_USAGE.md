# Logo Usage Documentation

## Official Logo
The official Starides logo is: **`logo_option_b.png`**

## Location
`/public/logo_option_b.png`

## Usage
The logo is used via the `<StaridesLogo />` component located at:
`/src/components/starides-logo.tsx`

## Specifications
- **Format:** PNG with transparent background
- **Dimensions:** 150x50 (width x height)
- **Usage:** Headers, navigation, branding

## Implementation
```tsx
import { StaridesLogo } from '@/components/starides-logo';

// In your component
<StaridesLogo className="h-10 w-auto" />
```

## Notes
- Logo is set to `priority` for faster loading
- Uses Next.js Image component with `unoptimized` flag
- Automatically scales based on container size
- Maintains aspect ratio with `object-contain`

## Other Logo Files (Legacy)
The following logo files exist but are not actively used:
- `logo.png` - Original logo
- `logo_option_a.png` - Alternative design (not selected)
- `starides_icon_only.png` - Icon variant
- `starides_logo_final.png` - Duplicate of logo.png
- `starides_logo_transparent.png` - Alternative transparent version
- `starides_rides_logo.png` - Alternative branding

**Recommendation:** These files can be archived or removed to reduce repository size.
