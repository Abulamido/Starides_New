import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Store, Bike, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { placeholderImages } from '@/lib/placeholder-images';
import { StaridesLogo } from '@/components/starides-logo';

export default function Home() {
  const heroImage = placeholderImages.find((img) => img.id === 'hero-1');

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative h-[60vh] w-full text-white md:h-[70vh]">
          {heroImage && (
            <Image
              src={heroImage.imageUrl}
              alt={heroImage.description}
              fill
              className="object-cover"
              priority
              data-ai-hint={heroImage.imageHint}
            />
          )}
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative z-10 flex h-full flex-col items-center justify-center text-center">
            <h1 className="font-headline text-4xl font-bold md:text-6xl lg:text-7xl">
              Starides Unified Marketplace
            </h1>
            <p className="mt-4 max-w-2xl text-lg md:text-xl">
              Your one-stop solution for shopping, selling, and delivering.
            </p>
            <Button asChild size="lg" className="mt-8">
              <Link href="/auth">
                Get Started <ArrowRight className="ml-2" />
              </Link>
            </Button>
          </div>
        </section>

        {/* Features Section */}
        <section className="bg-white py-12 md:py-24">
          <div className="container mx-auto px-4">
            <h2 className="mb-12 text-center font-headline text-3xl font-bold text-foreground md:text-4xl">
              A Platform for Everyone
            </h2>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              <Card className="transform text-center transition-transform hover:scale-105 hover:shadow-xl">
                <CardHeader>
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <StaridesLogo className="h-8 w-8" />
                  </div>
                  <CardTitle className="mt-4 font-headline text-2xl">
                    For Customers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Browse a vast selection of products, enjoy personalized
                    recommendations, and track your orders in real-time.
                  </p>
                </CardContent>
              </Card>
              <Card className="transform text-center transition-transform hover:scale-105 hover:shadow-xl">
                <CardHeader>
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Store className="h-8 w-8" />
                  </div>
                  <CardTitle className="mt-4 font-headline text-2xl">
                    For Vendors
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Manage your inventory, process orders with ease, and grow
                    your business by reaching more customers.
                  </p>
                </CardContent>
              </Card>
              <Card className="transform text-center transition-transform hover:scale-105 hover:shadow-xl">
                <CardHeader>
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Bike className="h-8 w-8" />
                  </div>
                  <CardTitle className="mt-4 font-headline text-2xl">
                    For Riders
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Find delivery jobs, navigate with live maps, and earn on
                    your own schedule. Your next delivery awaits.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-12 md:py-24">
          <div className="container mx-auto px-4">
            <h2 className="mb-12 text-center font-headline text-3xl font-bold text-foreground md:text-4xl">
              How It Works
            </h2>
            <div className="relative flex flex-col items-center justify-between gap-8 md:flex-row">
              <div className="absolute top-1/2 left-0 hidden h-1 w-full -translate-y-1/2 bg-border md:block"></div>
              <div className="relative z-10 flex flex-col items-center text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-primary bg-background text-2xl font-bold text-primary">
                  1
                </div>
                <h3 className="mt-4 font-headline text-xl font-semibold">
                  Sign Up
                </h3>
                <p className="mt-2 max-w-xs text-muted-foreground">
                  Create an account as a customer, vendor, or rider.
                </p>
              </div>
              <div className="relative z-10 flex flex-col items-center text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-primary bg-background text-2xl font-bold text-primary">
                  2
                </div>
                <h3 className="mt-4 font-headline text-xl font-semibold">
                  Engage
                </h3>
                <p className="mt-2 max-w-xs text-muted-foreground">
                  Shop for products, manage your store, or accept deliveries.
                </p>
              </div>
              <div className="relative z-10 flex flex-col items-center text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-primary bg-background text-2xl font-bold text-primary">
                  3
                </div>
                <h3 className="mt-4 font-headline text-xl font-semibold">
                  Succeed
                </h3>
                <p className="mt-2 max-w-xs text-muted-foreground">
                  Enjoy seamless transactions and grow with our platform.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
