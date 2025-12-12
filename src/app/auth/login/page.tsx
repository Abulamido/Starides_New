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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth, useFirestore } from '@/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { StaridesLogo } from '@/components/starides-logo';
import { FirebaseConnectivityCheck } from '@/components/firebase-connectivity-check';
import { GoogleLoginButton } from '@/components/google-login-button';

const formSchema = z.object({
    email: z.string().email({ message: 'Please enter a valid email.' }),
    password: z.string().min(1, { message: 'Password is required.' }),
});

export default function LoginPage() {
    const auth = useAuth();
    const firestore = useFirestore();
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
        if (!auth || !firestore) {
            toast({
                variant: 'destructive',
                title: 'Firebase not initialized',
                description: 'Please try again later.',
            });
            return;
        }

        setIsLoading(true);
        try {
            // 1. Sign in with Firebase Auth
            const userCredential = await signInWithEmailAndPassword(auth, values.email, values.password);
            const user = userCredential.user;

            // 2. Fetch user's role from Firestore
            const userDoc = await getDoc(doc(firestore, 'users', user.uid));

            if (userDoc.exists()) {
                const userData = userDoc.data();
                const role = userData.role || 'customer';

                toast({
                    title: 'Welcome back!',
                    description: `Redirecting to your dashboard...`,
                });

                // 3. Redirect to appropriate dashboard based on role
                router.push(`/${role}`);
            } else {
                // Fallback to customer if no role found
                toast({
                    title: 'Welcome back!',
                    description: 'Redirecting to customer dashboard...',
                });
                router.push('/customer');
            }

        } catch (error: any) {
            console.error('Login Error:', error);

            // Provide specific error messages based on error code
            let errorTitle = 'Login Failed';
            let errorDescription = error.message || 'Invalid credentials.';

            if (error.code === 'auth/network-request-failed') {
                errorTitle = 'Network Error';
                errorDescription = 'Cannot connect to Firebase servers. Please check your network connection and try the diagnostics below.';
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
        <div className="flex min-h-screen items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="mb-4 flex justify-center">
                    <Link href="/auth" className="flex items-center text-foreground">
                        <StaridesLogo className="h-8 w-auto" />
                    </Link>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Welcome Back</CardTitle>
                        <CardDescription>
                            Enter your credentials to access your account
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <GoogleLoginButton />

                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-background px-2 text-muted-foreground">
                                    Or continue with email
                                </span>
                            </div>
                        </div>

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
                                            <FormLabel>Password</FormLabel>
                                            <FormControl>
                                                <Input type="password" placeholder="••••••••" {...field} disabled={isLoading} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button type="submit" className="w-full" disabled={isLoading}>
                                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Log In
                                </Button>
                            </form>
                        </Form>

                        <div className="mt-4 text-center text-sm">
                            <p className="text-muted-foreground">
                                Don't have an account?{' '}
                                <Link href="/auth" className="text-primary hover:underline">
                                    Sign up
                                </Link>
                            </p>
                        </div>

                        <FirebaseConnectivityCheck />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
