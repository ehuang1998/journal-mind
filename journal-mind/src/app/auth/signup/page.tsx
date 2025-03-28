import { Card, CardContent, CardHeader } from "@/components/UI/card";
import { Button } from "@/components/UI/button";
import { Input } from "@/components/UI/input";
import Link from "next/link";
import Image from "next/image";

export default function SignupPage() {
  return (
    <div className="min-h-screen relative">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src="/journal-signuppage.jpg"
          alt="Journal Stock Image"
          fill
          className="object-cover blur-sm"
          priority
        />
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Signup Form */}
      <div className="relative flex items-center justify-center min-h-screen px-8">
        <Card className="w-full max-w-[440px] p-6">
          <CardHeader className="text-center space-y-2">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Image
                src="/logo.svg"
                alt="JournalMind Logo"
                width={35}
                height={35}
              />
              <h1 className="text-2xl font-semibold">JournalMind</h1>
            </div>
            <h1 className="text-2xl font-semibold">Create Your Account Now</h1>
            <p className="text-sm text-muted-foreground">
              Start your journaling journey today
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Input
                type="name"
                placeholder="Name"
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Input
                type="email"
                placeholder="Email Address"
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Password"
                className="w-full"
              />
            </div>
            <div className="space-y-2 pb-5">
              <Input
                type="password"
                placeholder="Confirm Password"
                className="w-full"
              />
            </div>
            <Button className="w-full" size="lg">
              Sign Up
            </Button>

            <p className="text-center text-sm text-muted-foreground pt-3">
              Already have an account?{" "}
              <Link href="/auth/login" className="text-primary hover:underline">
                Log In
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}