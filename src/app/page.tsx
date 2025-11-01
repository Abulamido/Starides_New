
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
  Rocket,
  PlayCircle,
} from 'lucide-react';
import Link from 'next/link';
import { StaridesLogo } from '@/components/starides-logo';

export default function Home() {
  const features = [
    {
      title: 'Secure Payments',
      description:
        'Multiple payment options with bank-level security and encryption.',
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
        <section className="relative w-full overflow-hidden py-20 md:py-32 lg:py-40">
          <div className="container mx-auto grid grid-cols-1 items-center gap-12 px-4 md:grid-cols-2 lg:gap-20">
            <div className="flex flex-col items-start text-left">
              <div className="neumorphic-flat mb-4 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-primary">
                <Rocket className="h-4 w-4" />
                The Future of Delivery
              </div>
              <h1 className="text-4xl font-bold tracking-tighter text-foreground sm:text-5xl md:text-6xl lg:text-7xl">
                Your <span className="text-primary">All-in-One</span>
                <br />
                Marketplace Platform
              </h1>
              <p className="mt-4 max-w-lg text-lg text-muted-foreground">
                Connect customers, vendors, and riders in one seamless
                ecosystem. Real-time tracking, secure payments, and instant
                delivery at your fingertips.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Button asChild size="lg">
                  <Link href="/auth">
                    Get Started Now <ArrowRight className="ml-2" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="secondary">
                  <Link href="#">
                    <PlayCircle className="mr-2" /> Watch Demo
                  </Link>
                </Button>
              </div>
            </div>
            <div className="relative flex h-full min-h-[300px] items-center justify-center">
              <div className="neumorphic-flat flex h-64 w-full max-w-md items-center justify-center rounded-2xl p-8 md:h-80">
                <div className="flex items-center gap-4">
                  <StaridesLogo className="h-24 w-auto text-primary" />
                  <span className="text-6xl font-bold text-foreground/80">
                    RIDES
                  </span>
                </div>
              </div>
            </div>
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
            <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-4">
              {howItWorksSteps.map((item) => (
                <Card
                  key={item.step}
                  className="transform text-center transition-transform hover:scale-105 hover:shadow-[8px_8px_16px_#c1c8d0,-8px_-8px_16px_#ffffff] dark:hover:shadow-[8px_8px_16px_#11131a,-8px_-8px_16px_#232734]"
                >
                  <CardHeader className="items-center">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full neumorphic-pressed text-primary">
                      <item.icon className="h-10 w-10" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <h3 className="text-xl font-semibold">{item.title}</h3>
                    <p className="mt-2 text-muted-foreground">
                      {item.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
