import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ArrowRight,
  Shield,
  Users,
  BarChart,
  ShoppingBag,
  CheckCircle,
  MapPin,
  Star,
} from 'lucide-react';
import Link from 'next/link';
import { placeholderImages } from '@/lib/placeholder-images';

export default function Home() {
  const heroImage = placeholderImages.find((img) => img.id === 'hero-1');

  const features = [
    {
      title: 'Secure Payments',
      description: 'Multiple payment options with bank-level security and encryption.',
      icon: Shield,
    },
    {
      title: 'Community Driven',
      description: 'Built for and by the community with ratings and reviews.',
      icon: Users,
    },
    {
      title: 'Growth Tools',
      description: 'Analytics and insights to help vendors grow their business.',
      icon: BarChart,
    },
  ];

  const howItWorksSteps = [
    {
      step: 1,
      title: 'Browse',
      description: 'Explore vendors and products',
      icon: ShoppingBag,
    },
    {
      step: 2,
      title: 'Order',
      description: 'Add to cart and checkout',
      icon: CheckCircle,
    },
    {
      step: 3,
      title: 'Track',
      description: 'Follow your delivery live',
      icon: MapPin,
    },
    {
      step: 4,
      title: 'Enjoy',
      description: 'Receive and rate your order',
      icon: Star,
    },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative h-[60vh] w-full md:h-[70vh]">
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
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/50 to-transparent" />
          <div className="relative z-10 flex h-full flex-col items-center justify-center text-center">
            <h1 className="text-4xl font-bold tracking-tighter text-foreground md:text-6xl lg:text-7xl">
              Starides Unified Marketplace
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-foreground/80 md:text-xl">
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
        <section className="border-t border-border/40 bg-background py-12 md:py-24">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {features.map((feature) => (
                <Card
                  key={feature.title}
                  className="transform text-center transition-transform hover:scale-105 hover:shadow-[8px_8px_16px_#c1c8d0,-8px_-8px_16px_#ffffff] dark:hover:shadow-[8px_8px_16px_#11131a,-8px_-8px_16px_#232734]"
                >
                  <CardHeader>
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full neumorphic-pressed text-primary">
                      <feature.icon className="h-8 w-8" />
                    </div>
                    <CardTitle className="mt-4 text-2xl font-semibold">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="border-t border-border/40 py-12 md:py-24">
          <div className="container mx-auto px-4">
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tighter text-foreground md:text-4xl">
                How Starides Works
              </h2>
              <p className="mt-2 text-lg text-muted-foreground">
                Simple, fast, and efficient
              </p>
            </div>
            <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-4">
              {howItWorksSteps.map((item) => (
                <div
                  key={item.step}
                  className="flex flex-col items-center text-center"
                >
                  <div className="neumorphic-flat flex h-20 w-20 items-center justify-center rounded-full border-2 border-primary bg-background text-primary">
                    <item.icon className="h-10 w-10" />
                  </div>
                  <h3 className="mt-5 text-xl font-semibold">{item.title}</h3>
                  <p className="mt-2 text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
