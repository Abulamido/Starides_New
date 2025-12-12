
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { useAuth } from '@/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';

const formSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
});

export function LoginForm() {
  const auth = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      if (!auth) throw new Error("Auth service not available");
      await signInWithEmailAndPassword(auth, values.email, values.password);

      // Let the DashboardLayout handle the redirect based on role.
      // This avoids trying to guess the role on the client.
      router.push('/customer');

    } catch (error: any) {
      console.error("Login Error:", error);

      // Provide specific error messages based on error code
      let errorTitle = 'Login Failed';
      let errorDescription = error.message || 'Invalid email or password.';

      if (error.code === 'auth/network-request-failed') {
        errorTitle = 'Network Error';
        errorDescription = 'Cannot connect to Firebase servers. Please check:\n• Browser extensions (disable ad blockers)\n• Network connectivity\n• Try incognito mode\n• Clear browser cache';
      } else if (error.code === 'auth/invalid-credential') {
        errorDescription = 'Invalid email or password. Please check your credentials or sign up for a new account.';
      } else if (error.code === 'auth/user-not-found') {
        errorDescription = 'No account found with this email. Please sign up first.';
      } else if (error.code === 'auth/wrong-password') {
        errorDescription = 'Incorrect password. Please try again.';
      } else if (error.code === 'auth/too-many-requests') {
        errorDescription = 'Too many failed login attempts. Please try again later or reset your password.';
      }

      toast({
        variant: 'destructive',
        title: errorTitle,
        description: errorDescription,
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="you@example.com" {...field} disabled={isLoading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between">
                <FormLabel>Password</FormLabel>
                <Link
                  href="#"
                  className="text-sm font-medium text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} disabled={isLoading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Login
        </Button>

        <div className="relative">
          <Separator className="my-4" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-2 bg-card text-muted-foreground text-sm">
            OR
          </div>
        </div>

        <div className="space-y-2">
          <Button variant="outline" className="w-full" disabled={isLoading}>
            Login with Google
          </Button>
          <Button variant="outline" className="w-full" disabled={isLoading}>
            Login with Facebook
          </Button>
        </div>
      </form>
    </Form>
  );
}
