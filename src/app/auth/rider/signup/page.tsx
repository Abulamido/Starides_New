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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth, useFirestore } from '@/firebase';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { StaridesLogo } from '@/components/starides-logo';
import { GoogleSignInButton } from '@/components/google-sign-in-button';

const formSchema = z.object({
    fullName: z.string().min(1, { message: 'Full name is required.' }),
    email: z.string().email({ message: 'Please enter a valid email.' }),
    password: z.string().min(8, { message: 'Password must be at least 8 characters.' }),
    phoneNumber: z.string().min(10, { message: 'Please enter a valid phone number.' }),
    vehicleType: z.enum(['Motorcycle', 'Bicycle', 'Car'], {
        required_error: 'Please select a vehicle type.',
    }),
    licensePlate: z.string().min(1, { message: 'License plate is required.' }),
});

export default function RiderSignupPage() {
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
            phoneNumber: '',
            licensePlate: '',
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

            // 3. Create user document
            const userDocRef = doc(firestore, 'users', user.uid);
            await setDoc(userDocRef, {
                id: user.uid,
                email: values.email,
                firstName: values.fullName.split(' ')[0],
                lastName: values.fullName.split(' ').slice(1).join(' '),
                role: 'rider',
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            });

            // 4. Create rider document with vehicle information
            const riderDocRef = doc(firestore, 'riders', user.uid);
            await setDoc(riderDocRef, {
                id: user.uid,
                userId: user.uid,
                phoneNumber: values.phoneNumber,
                vehicleType: values.vehicleType,
                licensePlate: values.licensePlate,
                status: 'available',
                email: values.email,
                verificationStatus: 'Unverified',
                onlineStatus: 'Offline',
                enabled: false,
                createdAt: serverTimestamp(),
            });

            toast({
                title: 'Account Created!',
                description: 'Welcome to Starides Riders!',
            });

            // 5. Redirect to rider dashboard
            router.push('/rider');

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
                        <StaridesLogo className="h-8 w-auto" />
                    </Link>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Sign Up as Rider</CardTitle>
                        <CardDescription>
                            Join our delivery team and start earning
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <GoogleSignInButton role="rider" mode="signup" />

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

                                <div className="border-t pt-4">
                                    <h3 className="font-semibold mb-3">Vehicle Information</h3>

                                    <FormField
                                        control={form.control}
                                        name="phoneNumber"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Phone Number</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="+234 800 000 0000" {...field} disabled={isLoading} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={form.control}
                                    name="vehicleType"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Vehicle Type</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select vehicle type" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="Motorcycle">Motorcycle</SelectItem>
                                                    <SelectItem value="Bicycle">Bicycle</SelectItem>
                                                    <SelectItem value="Car">Car</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="licensePlate"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>License Plate</FormLabel>
                                            <FormControl>
                                                <Input placeholder="ABC-123-XY" {...field} disabled={isLoading} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <Button type="submit" className="w-full" disabled={isLoading}>
                                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Create Account
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
