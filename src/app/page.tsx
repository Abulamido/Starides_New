import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { StaridesLogo } from '@/components/starides-logo';
import {
  ShoppingBag,
  Store,
  Bike,
  Clock,
  Shield,
  Zap,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';

export default function LandingPage() {
  const features = [
    {
      icon: Clock,
      title: 'Fast Delivery',
      description: 'Get your orders delivered within 30-45 minutes from local vendors',
    },
    {
      icon: Shield,
      title: 'Secure Payments',
      description: 'Safe and secure payment processing with multiple payment options',
    },
    {
      icon: Zap,
      title: 'Real-Time Tracking',
      description: 'Track your order and rider location in real-time on the map',
    },
  ];

  const howItWorks = [
    {
      step: '1',
      title: 'Browse Vendors',
      description: 'Discover local restaurants and browse their products',
    },
    {
      step: '2',
      title: 'Place Order',
      description: 'Add items to cart and checkout with your delivery address',
    },
    {
      step: '3',
      title: 'Track Delivery',
      description: 'Watch your order being prepared and delivered in real-time',
    },
    {
      step: '4',
      title: 'Enjoy!',
      description: 'Receive your order at your doorstep and enjoy',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 flex h-20 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <StaridesLogo className="h-16 w-auto" />
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/auth/login">
              <Button variant="ghost">Log In</Button>
            </Link>
            <Link href="/auth/customer/signup">
              <Button>Sign Up</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/10 via-background to-background">
        <div className="container mx-auto px-4 py-20 md:py-32">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              Your Local Marketplace,
              <span className="text-primary"> Delivered Fast</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Connect with local vendors, order your favorite products, and get them delivered to your doorstep in minutes.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/auth/customer/signup">
                <Button size="lg" className="gap-2 min-w-[200px]">
                  <ShoppingBag className="h-5 w-5" />
                  Order Now
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/auth/vendor/signup">
                <Button size="lg" variant="outline" className="gap-2 min-w-[200px]">
                  <Store className="h-5 w-5" />
                  Become a Vendor
                </Button>
              </Link>
              <Link href="/auth/rider/signup">
                <Button size="lg" variant="outline" className="gap-2 min-w-[200px]">
                  <Bike className="h-5 w-5" />
                  Deliver with Us
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose Starides?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We make local shopping and delivery simple, fast, and reliable
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {features.map((feature, index) => (
              <Card key={index} className="text-center">
                <CardHeader>
                  <div className="mx-auto h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Getting your favorite products delivered is easy
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {howItWorks.map((step, index) => (
              <div key={index} className="text-center space-y-4">
                <div className="mx-auto h-16 w-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-2xl font-bold">
                  {step.step}
                </div>
                <h3 className="text-xl font-semibold">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* For Vendors */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <h2 className="text-3xl md:text-4xl font-bold">Grow Your Business</h2>
                <p className="text-muted-foreground text-lg">
                  Join hundreds of local vendors reaching more customers through our platform
                </p>
                <ul className="space-y-3">
                  {[
                    'Reach thousands of local customers',
                    'Easy-to-use vendor dashboard',
                    'Real-time order management',
                    'Analytics and insights',
                    'Fast and reliable payments',
                  ].map((benefit, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/auth/vendor/signup">
                  <Button size="lg" className="gap-2">
                    Start Selling
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
              <div className="bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl p-8 h-[400px] flex items-center justify-center">
                <Store className="h-32 w-32 text-primary/40" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* For Riders */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl p-8 h-[400px] flex items-center justify-center order-2 md:order-1">
                <Bike className="h-32 w-32 text-primary/40" />
              </div>
              <div className="space-y-6 order-1 md:order-2">
                <h2 className="text-3xl md:text-4xl font-bold">Earn on Your Schedule</h2>
                <p className="text-muted-foreground text-lg">
                  Become a delivery partner and earn money on your own time
                </p>
                <ul className="space-y-3">
                  {[
                    'Flexible working hours',
                    'Competitive delivery fees',
                    'Weekly payouts',
                    'Performance bonuses',
                    'Easy-to-use rider app',
                  ].map((benefit, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/auth/rider/signup">
                  <Button size="lg" className="gap-2">
                    Start Delivering
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Join thousands of satisfied customers, vendors, and riders on Starides
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth">
              <Button size="lg" variant="secondary" className="gap-2 min-w-[200px]">
                Sign Up Now
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button size="lg" variant="outline" className="gap-2 min-w-[200px] bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
                Log In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2025 Starides. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
