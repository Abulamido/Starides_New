'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
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
    storeName: z.string().min(1, { message: 'Store name is required.' }),
    storeDescription: z.string().min(10, { message: 'Please provide a description (at least 10 characters).' }),

    cuisine: z.array(z.string()).refine((value) => value.length > 0, {
        message: 'You have to select at least one cuisine type.',
    }),
});

const cuisineOptions = [
    { id: 'African', label: 'African' },
    { id: 'Fast Food', label: 'Fast Food' },
    { id: 'Continental', label: 'Continental' },
    { id: 'Desserts', label: 'Desserts' },
    { id: 'Drinks', label: 'Drinks' },
    { id: 'Healthy', label: 'Healthy' },
];

export default function VendorSignupPage() {
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
            storeName: '',

            storeDescription: '',
            cuisine: [],
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
                role: 'vendor',
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            });

            // 4. Create vendor document with store information
            const vendorDocRef = doc(firestore, 'vendors', user.uid);
            await setDoc(vendorDocRef, {
                id: user.uid,
                userId: user.uid,
                name: values.storeName,
                description: values.storeDescription,
                category: 'Restaurant', // Hardcoded as we are now Restaurant-only
                cuisine: values.cuisine,
                image: `https://api.dicebear.com/7.x/shapes/svg?seed=${values.storeName}`,
                imageHint: `${values.cuisine.join(', ')} restaurant`,
                rating: 0,
                reviewCount: 0,
                email: values.email,
                approvalStatus: 'Pending',
                activeStatus: 'Inactive',
                enabled: false,
                createdAt: serverTimestamp(),
            });

            toast({
                title: 'Store Created!',
                description: `Welcome to Starides, ${values.storeName}!`,
            });

            // 5. Redirect to vendor dashboard
            router.push('/vendor');

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

                <Card>
                    <CardHeader>
                        <CardTitle>Sign Up as Vendor</CardTitle>
                        <CardDescription>
                            Create your store and start selling to customers
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <GoogleSignInButton role="vendor" mode="signup" />

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
                                    <h3 className="font-semibold mb-3">Store Information</h3>

                                    <FormField
                                        control={form.control}
                                        name="storeName"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Store Name</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Abu's Fresh Market" {...field} disabled={isLoading} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={form.control}
                                    name="storeDescription"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Store Description</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Tell customers about your store..."
                                                    {...field}
                                                    disabled={isLoading}
                                                    rows={3}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="cuisine"
                                    render={() => (
                                        <FormItem>
                                            <div className="mb-4">
                                                <FormLabel className="text-base">Cuisine Type</FormLabel>
                                                <FormDescription>
                                                    Select the types of food you serve.
                                                </FormDescription>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                {cuisineOptions.map((item) => (
                                                    <FormField
                                                        key={item.id}
                                                        control={form.control}
                                                        name="cuisine"
                                                        render={({ field }) => {
                                                            return (
                                                                <FormItem
                                                                    key={item.id}
                                                                    className="flex flex-row items-start space-x-3 space-y-0"
                                                                >
                                                                    <FormControl>
                                                                        <Checkbox
                                                                            checked={field.value?.includes(item.id)}
                                                                            onCheckedChange={(checked) => {
                                                                                return checked
                                                                                    ? field.onChange([...field.value, item.id])
                                                                                    : field.onChange(
                                                                                        field.value?.filter(
                                                                                            (value) => value !== item.id
                                                                                        )
                                                                                    )
                                                                            }}
                                                                        />
                                                                    </FormControl>
                                                                    <FormLabel className="font-normal">
                                                                        {item.label}
                                                                    </FormLabel>
                                                                </FormItem>
                                                            )
                                                        }}
                                                    />
                                                ))}
                                            </div>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <Button type="submit" className="w-full" disabled={isLoading}>
                                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Create Store
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
