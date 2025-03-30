"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/UI/card";
import { Button } from "@/components/UI/button";
import { Input } from "@/components/UI/input";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  // Basic validation function
  const validateForm = () => {
    setError("");
    
    if (!name || name.trim() === "") {
      setError("Please enter your name");
      return false;
    }
    
    if (!email || !email.includes('@')) {
      setError("Please enter a valid email address");
      return false;
    }
    
    if (!password || password.length < 8) {
      setError("Password must be at least 8 characters long");
      return false;
    }
    
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    
    return true;
  };

  async function handleSignUp() {
    if (!validateForm()) return;
  
    try {
      setLoading(true);
      setError("");
      
      // Use our custom direct signup endpoint
      const response = await fetch('/api/auth/direct-signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });
      
      const responseData = await response.json();
      
      if (!response.ok) {
        console.error('Signup error:', responseData);
        setError(responseData.error || 'Failed to sign up');
        return;
      }
      
      // After successful signup, redirect to login
      alert('Account created successfully! Please log in.');
      router.push("/auth/login");
    } catch (err) {
      console.error("Signup exception:", err);
      setError(err instanceof Error ? err.message : "Failed to sign up");
    } finally {
      setLoading(false);
    }
  }

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
            {error && (
              <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Input
                type="text"
                placeholder="Name"
                className="w-full"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
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
            </div>
            <div className="space-y-2 pb-5">
              <Input
                type="password"
                placeholder="Confirm Password"
                className="w-full"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            <Button 
              className="w-full" 
              size="lg" 
              onClick={handleSignUp}
              disabled={loading}
            >
              {loading ? "Signing Up..." : "Sign Up"}
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