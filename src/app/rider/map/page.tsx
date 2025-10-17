import Image from "next/image";

export default function RiderMapPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold tracking-tight">Live Map</h1>
      <p className="text-muted-foreground">
        View active delivery routes and locations.
      </p>
      <div className="relative aspect-video w-full overflow-hidden rounded-lg border">
         <Image src="https://picsum.photos/seed/map-dark/1200/600" alt="Map placeholder" fill className="object-cover" data-ai-hint="dark city map" />
         <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
         <div className="absolute bottom-4 left-4 text-white">
            <h2 className="text-lg font-bold">Live Map (Placeholder)</h2>
            <p className="text-sm">Google Maps API will be integrated here.</p>
         </div>
      </div>
    </div>
  );
}
