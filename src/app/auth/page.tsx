import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoginForm } from '@/components/login-form';
import { SignupForm } from '@/components/signup-form';
import Link from 'next/link';
import { StaridesLogo } from '@/components/starides-logo';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';

export default function AuthenticationPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-4 flex justify-center">
            <Link href="/" className="flex items-center space-x-2 text-foreground">
                <StaridesLogo className="h-8 w-auto" />
                <span className="text-2xl font-bold">Starides</span>
            </Link>
        </div>
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
          <TabsContent value="login">
            <Card>
              <CardHeader>
                <CardTitle>Welcome Back</CardTitle>
                <CardDescription>
                  Enter your credentials to access your account.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <LoginForm />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="signup">
            <Card>
              <CardHeader>
                <CardTitle>Create an Account</CardTitle>
                <CardDescription>
                  Choose your role and start your journey with us.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SignupForm />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Test Dashboards</CardTitle>
            <CardDescription>
              For testing purposes, you can directly access the dashboards.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col space-y-2">
            <Button asChild>
              <Link href="/customer">Customer Dashboard</Link>
            </Button>
            <Button asChild>
              <Link href="/vendor">Vendor Dashboard</Link>
            </Button>
            <Button asChild>
              <Link href="/rider">Rider Dashboard</Link>
            </Button>
            <Button asChild>
              <Link href="/admin">Admin Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
