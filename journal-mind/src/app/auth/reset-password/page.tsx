"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/UI/card";
import { Button } from "@/components/UI/button";
import { Input } from "@/components/UI/input";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleResetPassword() {
    if (!email || !newPassword || !confirmPassword) {
      setError("All fields are required");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      setError("");
      
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          newPassword,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to reset password");
      }

      alert('Password reset successful! Please log in.');
      router.push("/auth/login");
    } catch (err) {
      console.error("Reset password error:", err);
      setError("Failed to reset password. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen relative">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src="/journal-resetpassword.jpg"
          alt="Journal Stock Image"
          fill
          className="object-cover blur-sm"
          priority
        />
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Reset Password Form */}
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
            <h1 className="text-2xl font-semibold">Reset Your Password</h1>
            <p className="text-sm text-muted-foreground">
              Enter your details to reset your password
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
                placeholder="New Password"
                className="w-full"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div className="space-y-2 pb-5">
              <Input
                type="password"
                placeholder="Confirm New Password"
                className="w-full"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            <Button 
              className="w-full" 
              size="lg" 
              onClick={handleResetPassword}
              disabled={loading}
            >
              {loading ? "Resetting Password..." : "Reset Password"}
            </Button>

            <p className="text-center text-sm text-muted-foreground pt-3">
              Remember your password?{" "}
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