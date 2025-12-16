'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoginForm } from '@/components/login-form';
import Link from 'next/link';
import { StaridesLogo } from '@/components/starides-logo';
import { FirebaseConnectivityCheck } from '@/components/firebase-connectivity-check';

export default function LoginPage() {
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
                        <CardTitle>Welcome Back</CardTitle>
                        <CardDescription>
                            Enter your credentials to access your account
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <LoginForm />

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
