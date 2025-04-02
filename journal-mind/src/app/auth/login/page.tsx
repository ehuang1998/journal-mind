"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/UI/card";
import { Button } from "@/components/UI/button";
import { Input } from "@/components/UI/input";
import { Checkbox } from "@/components/UI/checkbox";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface Quote {
  q: string; // quote text
  a: string; // author
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [quote, setQuote] = useState<Quote | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchQuote() {
      try {
        const response = await fetch('/api/quotes');
        const data = await response.json();
        if (data && data[0]) {
          setQuote(data[0]);
        }
      } catch (err) {
        console.error('Error fetching quote:', err);
        // Fallback quote in case of API failure
        setQuote({
          q: "Write it on your heart that every day is the best day in the year.",
          a: "Ralph Waldo Emerson"
        });
      }
    }

    fetchQuote();
  }, []);

  async function handleLogin() {
    try {
      setLoading(true);
      setError("");
      
      console.log("Attempting direct login with:", { email });
      
      // Use our custom direct login endpoint
      const response = await fetch('/api/auth/direct-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });
      
      const responseData = await response.json();
      
      if (!response.ok) {
        console.error('Login error:', responseData);
        setError(responseData.error || 'Authentication failed');
        return;
      }
      
      console.log('Login successful:', responseData);
      
      // Redirect to dashboard after successful login
      router.push("/dashboard");
    } catch (err) {
      console.error("Login error:", err);
      setError(err instanceof Error ? err.message : "Failed to log in");
    } finally {
      setLoading(false);
    }
  }

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
              "{quote?.q}"
            </p>
            <p className="text-base">- {quote?.a || 'Unknown'}</p>
            <p className="text-xs mt-4 opacity-75">
              Quotes provided by <a href="https://zenquotes.io/" target="_blank" rel="noopener noreferrer" className="underline">ZenQuotes</a>
            </p>
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
            {error && (
              <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <Input
                type="email"
                placeholder="Email Address"
                className="w-full"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Password"
                className="w-full"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <div className="text-right pb-5">
                <Link
                  href="/auth/reset-password"
                  className="text-sm text-primary hover:underline"
                >
                  Forgot Password?
                </Link>
              </div>
            </div>
            <Button 
              className="w-full" 
              size="lg" 
              onClick={handleLogin}
              disabled={loading}
            >
              {loading ? "Logging in..." : "Log In"}
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