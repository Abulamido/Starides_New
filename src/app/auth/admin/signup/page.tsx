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
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Loader2, Shield } from 'lucide-react';
import Link from 'next/link';
import { StaridesLogo } from '@/components/starides-logo';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { GoogleSignInButton } from '@/components/google-sign-in-button';

const formSchema = z.object({
    fullName: z.string().min(1, { message: 'Full name is required.' }),
    email: z.string().email({ message: 'Please enter a valid email.' }),
    password: z
        .string()
        .min(8, { message: 'Password must be at least 8 characters.' }),
});

export default function AdminSignupPage() {
    const auth = useAuth();
    const firestore = useFirestore();
    const { toast } = useToast();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            fullName: '',
            email: '',
            password: '',
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        if (!firestore || !auth) {
            toast({
                variant: 'destructive',
                title: 'Firebase not initialized',
                description: 'Please try again later.',
            });
            return;
        }

        setIsLoading(true);
        try {
            // 1. Create user in Firebase Auth
            const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
            const user = userCredential.user;

            // 2. Update user's profile
            await updateProfile(user, {
                displayName: values.fullName,
            });

            // 3. Create user document in Firestore with admin role
            const userDocRef = doc(firestore, 'users', user.uid);
            await setDoc(userDocRef, {
                id: user.uid,
                email: values.email,
                firstName: values.fullName.split(' ')[0],
                lastName: values.fullName.split(' ').slice(1).join(' '),
                role: 'admin',
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            });

            toast({
                title: 'Admin Account Created!',
                description: 'Welcome to Starides Admin.',
            });

            // 4. Redirect to admin dashboard
            router.push('/admin');

        } catch (error: any) {
            console.error('Signup Error:', error);
            toast({
                variant: 'destructive',
                title: 'Signup Failed',
                description: error.message || 'Could not create your account.',
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
                        <StaridesLogo className="h-24 w-auto" />
                    </Link>
                </div>

                <Card className="border-primary/20">
                    <CardHeader className="bg-gradient-to-br from-primary/5 to-primary/10">
                        <div className="flex items-center gap-2">
                            <Shield className="h-6 w-6 text-primary" />
                            <CardTitle>Sign Up as Admin</CardTitle>
                        </div>
                        <CardDescription>
                            Create your admin account to manage the platform
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <Alert className="mb-4 border-amber-200 bg-amber-50 dark:bg-amber-900/20">
                            <AlertDescription className="text-sm">
                                Admin accounts have full access to manage users, vendors, riders, and orders.
                            </AlertDescription>
                        </Alert>

                        <GoogleSignInButton role="admin" mode="signup" />

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
                                    name="fullName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Full Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="John Doe" {...field} disabled={isLoading} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Email</FormLabel>
                                            <FormControl>
                                                <Input placeholder="admin@example.com" {...field} disabled={isLoading} />
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
                                    Create Admin Account
                                </Button>
                            </form>
                        </Form>

                        <div className="mt-4 text-center text-sm">
                            <p className="text-muted-foreground">
                                Already have an account?{' '}
                                <Link href="/auth/login" className="text-primary hover:underline">
                                    Log in
                                </Link>
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
