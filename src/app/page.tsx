import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { StaridesLogo } from '@/components/starides-logo';
import {
  ShoppingBag,
  Store,
  Bike,
  Clock,
  Shield,
  Zap,
  ArrowRight,
  CheckCircle2,
  Sparkles
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 flex h-20 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="neumorphic-flat p-3 transition-all duration-300 group-hover:shadow-[8px_8px_16px_#bec3c9,-8px_-8px_16px_#ffffff] dark:group-hover:shadow-[8px_8px_16px_#11131a,-8px_-8px_16px_#232734]">
              <StaridesLogo className="h-12 w-auto" />
            </div>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/auth/login">
              <Button variant="ghost" className="font-medium">Log In</Button>
            </Link>
            <Link href="/auth/customer/signup">
              <Button className="neumorphic-flat border-0 font-semibold px-6 hover:scale-105 transition-transform">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-24 md:py-32">
        {/* Background gradient orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 relative">
          <div className="max-w-5xl mx-auto text-center space-y-10">
            {/* Prominent Logo Display */}
            <div className="flex justify-center mb-8">
              <div className="neumorphic-flat p-8 md:p-12 rounded-3xl inline-flex items-center justify-center relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent rounded-3xl" />
                <StaridesLogo className="h-32 md:h-44 w-auto relative z-10" />
              </div>
            </div>

            {/* Tagline */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
                <Sparkles className="h-4 w-4" />
                <span>Nigeria's Premier Delivery Platform</span>
              </div>

              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-tight">
                Your Local Marketplace,
                <br />
                <span className="text-primary">Delivered Fast</span>
              </h1>

              <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Connect with local vendors, order your favorite products, and get them delivered to your doorstep in minutes.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <Link href="/auth/customer/signup">
                <Button size="lg" className="neumorphic-flat border-0 gap-3 min-w-[220px] h-14 text-lg font-semibold hover:scale-105 transition-all duration-300">
                  <ShoppingBag className="h-5 w-5" />
                  Order Now
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="/auth/vendor/signup">
                <Button size="lg" variant="outline" className="neumorphic-flat border-0 gap-3 min-w-[220px] h-14 text-lg font-medium hover:scale-105 transition-all duration-300">
                  <Store className="h-5 w-5" />
                  Become a Vendor
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Why Choose Starides?</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              We make local shopping and delivery simple, fast, and reliable
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <div
                key={index}
                className="neumorphic-flat p-8 rounded-2xl text-center group hover:scale-105 transition-all duration-300"
              >
                <div className="neumorphic-pressed mx-auto h-20 w-20 rounded-2xl flex items-center justify-center mb-6 group-hover:neumorphic-active transition-all">
                  <feature.icon className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Getting your favorite products delivered is easy
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {howItWorks.map((step, index) => (
              <div key={index} className="text-center space-y-4 group">
                <div className="neumorphic-flat mx-auto h-20 w-20 rounded-full flex items-center justify-center text-3xl font-bold text-primary group-hover:neumorphic-pressed transition-all duration-300">
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
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
                  <Store className="h-4 w-4" />
                  <span>For Vendors</span>
                </div>
                <h2 className="text-3xl md:text-5xl font-bold">Grow Your Business</h2>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  Join hundreds of local vendors reaching more customers through our platform
                </p>
                <ul className="space-y-4">
                  {[
                    'Reach thousands of local customers',
                    'Easy-to-use vendor dashboard',
                    'Real-time order management',
                    'Analytics and insights',
                    'Fast and reliable payments',
                  ].map((benefit, index) => (
                    <li key={index} className="flex items-center gap-4">
                      <div className="neumorphic-flat h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0">
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                      </div>
                      <span className="font-medium">{benefit}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/auth/vendor/signup">
                  <Button size="lg" className="neumorphic-flat border-0 gap-3 font-semibold hover:scale-105 transition-all duration-300">
                    Start Selling
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
              </div>
              <div className="neumorphic-flat rounded-3xl p-12 h-[450px] flex items-center justify-center">
                <div className="neumorphic-pressed rounded-full p-8">
                  <Store className="h-24 w-24 text-primary/60" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* For Riders */}
      <section className="py-24 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="neumorphic-flat rounded-3xl p-12 h-[450px] flex items-center justify-center order-2 md:order-1">
                <div className="neumorphic-pressed rounded-full p-8">
                  <Bike className="h-24 w-24 text-primary/60" />
                </div>
              </div>
              <div className="space-y-8 order-1 md:order-2">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
                  <Bike className="h-4 w-4" />
                  <span>For Riders</span>
                </div>
                <h2 className="text-3xl md:text-5xl font-bold">Earn on Your Schedule</h2>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  Become a delivery partner and earn money on your own time
                </p>
                <ul className="space-y-4">
                  {[
                    'Flexible working hours',
                    'Competitive delivery fees',
                    'Weekly payouts',
                    'Performance bonuses',
                    'Easy-to-use rider app',
                  ].map((benefit, index) => (
                    <li key={index} className="flex items-center gap-4">
                      <div className="neumorphic-flat h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0">
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                      </div>
                      <span className="font-medium">{benefit}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/auth/rider/signup">
                  <Button size="lg" className="neumorphic-flat border-0 gap-3 font-semibold hover:scale-105 transition-all duration-300">
                    Start Delivering
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary/80" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent)]" />

        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="max-w-3xl mx-auto space-y-8">
            <h2 className="text-3xl md:text-5xl font-bold text-primary-foreground">Ready to Get Started?</h2>
            <p className="text-xl text-primary-foreground/90 leading-relaxed">
              Join thousands of satisfied customers, vendors, and riders on Starides
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link href="/auth">
                <Button size="lg" variant="secondary" className="gap-3 min-w-[220px] h-14 text-lg font-semibold hover:scale-105 transition-all duration-300">
                  Sign Up Now
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="/auth/login">
                <Button size="lg" variant="outline" className="gap-3 min-w-[220px] h-14 text-lg font-medium bg-transparent border-2 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary transition-all duration-300">
                  Log In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border/40">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="neumorphic-flat p-2 rounded-lg">
                <StaridesLogo className="h-8 w-auto" />
              </div>
              <span className="text-muted-foreground">© 2025 Starides. All rights reserved.</span>
            </div>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <Link href="#" className="hover:text-primary transition-colors">Terms</Link>
              <Link href="#" className="hover:text-primary transition-colors">Privacy</Link>
              <Link href="#" className="hover:text-primary transition-colors">Contact</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
