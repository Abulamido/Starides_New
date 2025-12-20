"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { StaridesLogo } from '@/components/starides-logo';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useUserRole } from '@/hooks/use-user-role';
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
  const router = useRouter();
  const { role, isLoading } = useUserRole();

  useEffect(() => {
    if (!isLoading && role) {
      router.push(`/${role}`);
    }
  }, [role, isLoading, router]);

  const services = [
    "African Dishes",
    "Fast Food",
    "Continental",
    "Desserts",
    "Cold Drinks",
    "Healthy Meals"
  ];

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
            <div className="neumorphic-flat p-5 transition-all duration-300 group-hover:shadow-[8px_8px_16px_#bec3c9,-8px_-8px_16px_#ffffff] dark:group-hover:shadow-[8px_8px_16px_#11131a,-8px_-8px_16px_#232734]">
              <StaridesLogo className="h-20 w-auto" />
            </div>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/auth/login">
              <Button variant="ghost" className="font-medium">Log In</Button>
            </Link>
            <Link href="/auth/customer/signup">
              <Button className="neumorphic-flat border-0 font-semibold px-6 hover:scale-105 transition-transform bg-[#6186a8] text-white hover:bg-[#6186a8]/90">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section - Careem Inspiration */}
      <section className="relative overflow-hidden pt-20 pb-16 md:pt-32 md:pb-24">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#6186a8]/5 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px]" />
        </div>

        <div className="container mx-auto px-4 relative">
          <div className="max-w-6xl mx-auto flex flex-col items-center text-center">
            {/* Tagline Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full bg-[#6186a8]/10 text-[#6186a8] text-sm font-semibold tracking-wider uppercase border border-[#6186a8]/20 animate-fade-in">
              <Sparkles className="h-4 w-4" />
              <span>Direct to your doorstep</span>
            </div>

            {/* Main Animated Headline */}
            <h1 className="w-full text-5xl md:text-8xl font-black tracking-tight leading-[1.1] mb-10 text-foreground flex flex-col items-center justify-center py-8 md:py-12">
              <span>Get</span>
              <div className="text-cycle-container mt-2 h-[1.3em]">
                {services.map((service, idx) => (
                  <span key={idx} className="text-cycle-item text-[#6186a8] whitespace-nowrap">
                    {service}
                  </span>
                ))}
              </div>
            </h1>



            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-12">
              Everything you need from your local neighborhood, delivered safely and fast.
            </p>

            {/* Main Action Area */}
            <div className="w-full max-w-2xl p-2 md:p-4 neumorphic-flat rounded-[2.5rem] flex flex-col md:flex-row gap-2 transition-all duration-500 hover:shadow-[10px_10px_20px_#bec3c9,-10px_-10px_20px_#ffffff] dark:hover:shadow-[10px_10px_20px_#11131a,-10px_-10px_20px_#232734]">
              <Link href="/auth/customer/signup" className="flex-1">
                <Button size="lg" className="w-full h-16 md:h-20 rounded-[1.8rem] bg-[#6186a8] text-white text-xl font-bold gap-3 hover:scale-[1.02] transition-transform shadow-lg">
                  <ShoppingBag className="h-6 w-6" />
                  Order Now
                  <ArrowRight className="h-6 w-6" />
                </Button>
              </Link>
              <Link href="/auth/vendor/signup" className="md:w-1/3">
                <Button size="lg" variant="ghost" className="w-full h-16 md:h-20 rounded-[1.8rem] text-[#6186a8] text-lg font-semibold hover:bg-[#6186a8]/5 transition-colors">
                  <Store className="h-5 w-5 mr-2" />
                  Apply as Merchant
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Rest of the sections remain styled with Neumorphic polish */}

      {/* Features Section */}
      <section className="py-24 relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-extrabold mb-4">The Starides Advantage</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Reliability is at the core of our platform.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <div
                key={index}
                className="neumorphic-flat p-10 rounded-[2rem] text-center group hover:-translate-y-2 transition-all duration-300"
              >
                <div className="neumorphic-pressed mx-auto h-24 w-24 rounded-3xl flex items-center justify-center mb-8 group-hover:text-[#6186a8] transition-colors">
                  <feature.icon className="h-12 w-12" />
                </div>
                <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                <p className="text-muted-foreground text-lg leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-extrabold mb-4">How It Works</h2>
          </div>

          <div className="relative max-w-6xl mx-auto">
            {/* Connector Line (Desktop) */}
            <div className="hidden md:block absolute top-12 left-0 w-full h-0.5 bg-border -z-10" />

            <div className="grid md:grid-cols-4 gap-12">
              {howItWorks.map((step, index) => (
                <div key={index} className="text-center space-y-6 group">
                  <div className="neumorphic-flat mx-auto h-24 w-24 rounded-[2rem] flex items-center justify-center text-4xl font-black text-[#6186a8] group-hover:neumorphic-pressed transition-all duration-500">
                    {step.step}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold mb-2">{step.title}</h3>
                    <p className="text-muted-foreground">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Partner Sections */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto space-y-32">
            {/* Vendors */}
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <div className="space-y-8">
                <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#6186a8]/10 text-[#6186a8] text-sm font-bold tracking-wide uppercase border border-[#6186a8]/20">
                  <Store className="h-4 w-4" />
                  <span>Partnership</span>
                </div>
                <h2 className="text-4xl md:text-6xl font-black leading-tight">Empower your <br /><span className="text-[#6186a8]">local business</span></h2>
                <p className="text-muted-foreground text-xl leading-relaxed">
                  Unlock digital growth and reach a massive local audience with our best-in-class tools.
                </p>
                <div className="space-y-4">
                  {['Wider reach', 'Automated dispatch', 'Detailed analytics'].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 py-1">
                      <div className="h-6 w-6 rounded-full bg-[#6186a8]/20 flex items-center justify-center">
                        <CheckCircle2 className="h-4 w-4 text-[#6186a8]" />
                      </div>
                      <span className="font-semibold text-lg">{item}</span>
                    </div>
                  ))}
                </div>
                <Link href="/auth/vendor/signup" className="inline-block pt-4">
                  <Button size="lg" className="h-16 px-10 rounded-2xl bg-[#6186a8] text-white font-bold text-lg hover:scale-105 transition-all">
                    Register Merchant
                  </Button>
                </Link>
              </div>
              <div className="neumorphic-flat rounded-[3rem] p-16 h-[500px] flex items-center justify-center relative group">
                <div className="absolute inset-0 bg-gradient-to-tr from-[#6186a8]/5 to-transparent rounded-[3rem]" />
                <div className="neumorphic-pressed rounded-[2.5rem] p-12 group-hover:scale-110 transition-transform duration-500">
                  <Store className="h-32 w-32 text-[#6186a8]/40" />
                </div>
              </div>
            </div>

            {/* Riders */}
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <div className="neumorphic-flat rounded-[3rem] p-16 h-[500px] flex items-center justify-center relative group order-2 md:order-1">
                <div className="absolute inset-0 bg-gradient-to-bl from-[#6186a8]/5 to-transparent rounded-[3rem]" />
                <div className="neumorphic-pressed rounded-[2.5rem] p-12 group-hover:scale-110 transition-transform duration-500">
                  <Bike className="h-32 w-32 text-[#6186a8]/40" />
                </div>
              </div>
              <div className="space-y-8 order-1 md:order-2">
                <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#6186a8]/10 text-[#6186a8] text-sm font-bold tracking-wide uppercase border border-[#6186a8]/20">
                  <Bike className="h-4 w-4" />
                  <span>Flexibility</span>
                </div>
                <h2 className="text-4xl md:text-6xl font-black leading-tight">Be your own <br /><span className="text-[#6186a8]">captain</span></h2>
                <p className="text-muted-foreground text-xl leading-relaxed">
                  Earn money on your own terms. Flexible hours, competitive pay, and a great community.
                </p>
                <Link href="/auth/rider/signup" className="inline-block pt-4">
                  <Button size="lg" className="h-16 px-10 rounded-2xl bg-foreground text-background font-bold text-lg hover:scale-105 transition-all">
                    Join the Fleet
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-foreground group" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(97,134,168,0.2),transparent)]" />

        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="max-w-4xl mx-auto space-y-12">
            <h2 className="text-5xl md:text-7xl font-black text-background leading-tight">Ready to join <br />the revolution?</h2>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link href="/auth">
                <Button size="lg" className="h-20 px-12 rounded-[1.8rem] bg-[#6186a8] text-white text-2xl font-black hover:scale-105 transition-all shadow-2xl">
                  Sign Up Free
                </Button>
              </Link>
              <Link href="/auth/login">
                <Button size="lg" variant="outline" className="h-20 px-12 rounded-[1.8rem] text-background border-2 border-background/20 hover:bg-background/10 text-xl font-bold transition-all">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 bg-background">
        <div className="container mx-auto px-4 border-t border-border/40 pt-12 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-4 group">
            <div className="neumorphic-flat p-2.5 rounded-2xl group-hover:neumorphic-pressed transition-all">
              <StaridesLogo className="h-8 w-auto" />
            </div>
            <span className="text-muted-foreground font-medium">© 2025 Starides Tech. All rights reserved.</span>
          </div>
          <div className="flex gap-10 text-lg text-muted-foreground font-semibold">
            <Link href="#" className="hover:text-[#6186a8] transition-colors">Safety</Link>
            <Link href="#" className="hover:text-[#6186a8] transition-colors">Help</Link>
            <Link href="#" className="hover:text-[#6186a8] transition-colors">Privacy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
