import { Card, CardContent, CardHeader } from "@/components/UI/card";
import { Button } from "@/components/UI/button";
import { Input } from "@/components/UI/input";
import { Checkbox } from "@/components/UI/checkbox";
import Link from "next/link";
import Image from "next/image";

export default function LoginPage() {
  return (
    <div className="min-h-screen grid grid-cols-[60fr_40fr]">
      {/* Left side with image and quote */}
      <div className="relative bg-gray-100">
        <div className="absolute inset-0">
          <Image
            src="/journal-loginpage.jpg"
            alt="Journal Stock Image"
            fill
            className="object-cover"
            priority
          />
          {/* Quote overlay */}
          <div className="absolute bottom-20 left-14 bg-black/40 backdrop-blur-sm p-8 rounded-lg text-white max-w-lg">
            <h2 className="text-2xl font-medium mb-3">Quote of the Day</h2>
            <p className="text-xl italic mb-3">
              "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed finibus eros ut purus molestie porttitor. Vestibulum lacus enim, volutpat non hendrerit vulputate, fermentum nec dui."
            </p>
            <p className="text-base">- Eric Huang, 2025</p>
          </div>
        </div>
      </div>

      {/* Right side with login form */}
      <div className="flex items-center justify-center px-8">
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
            <h1 className="text-2xl font-semibold">Welcome Back</h1>
            <p className="text-sm text-muted-foreground">
              Continue your journaling journey
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
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

              <div className="text-right pb-5">
                <Link
                  href="/forgot-password"
                  className="text-sm text-primary hover:underline"
                >
                  Forgot Password?
                </Link>
                
              </div>
            </div>
            <Button className="w-full" size="lg">
              Log In
            </Button>

            {/* <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-background px-2 text-muted-foreground">
                  OR CONTINUE WITH
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Button variant="outline" className="w-full" size="lg">
                <Image
                  src="/google.svg"
                  alt="Google"
                  width={20}
                  height={20}
                  className="mr-2"
                />
                Continue with Google
              </Button>
              <Button variant="outline" className="w-full" size="lg">
                <Image
                  src="/apple.svg"
                  alt="Apple"
                  width={20}
                  height={20}
                  className="mr-2"
                />
                Continue with Apple
              </Button>
            </div> */}

            <p className="text-center text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link href="/auth/signup" className="text-primary hover:underline">
                Create Account
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}