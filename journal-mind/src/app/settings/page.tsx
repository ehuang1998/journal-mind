"use client";
import { useState } from "react";
import { Button } from "@/components/UI/button";
import { Input } from "@/components/UI/input";
import { Card } from "@/components/UI/card";
import { Trash2 } from "lucide-react";
import DashboardHeader from "@/components/Dashboard/DashboardHeader";

export default function SettingsPage() {
  const [memberSince] = useState("March 25, 2025");
  const [username] = useState("@username");

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      
      <main className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-[300px_1fr] gap-8">
          {/* Profile Card */}
          <div className="space-y-6">
            <Card className="p-6">
              <div className="text-center">
                <h2 className="text-xl font-semibold mb-1">Eric Huang</h2>
                <p className="text-sm text-muted-foreground mb-6">{username}</p>
                
                <div className="relative w-32 h-32 mx-auto mb-4">
                  <img
                    src="/avatar-placeholder.svg"
                    alt="Profile"
                    className="rounded-full w-full h-full object-cover"
                  />
                  <button 
                    className="absolute top-0 right-0 p-1 rounded-full bg-background border border-border hover:bg-accent"
                    aria-label="Remove photo"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <Button className="w-full mb-4">
                  Upload New Photo
                </Button>
                <p className="text-xs text-muted-foreground">
                  Upload a new avatar. Larger image will be resized automatically.<br />
                  Maximum upload size is 1 MB
                </p>
              </div>

              <div className="mt-6 pt-6 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  Member Since: {memberSince}
                </p>
              </div>
            </Card>
          </div>

          {/* Edit Profile Form */}
          <div>
            <h1 className="text-2xl font-bold mb-6">Edit Profile</h1>
            
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="firstName" className="text-sm font-medium">
                    Full Name
                  </label>
                  <Input
                    id="firstName"
                    placeholder="Enter your first name"
                    defaultValue="First Name"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="lastName" className="text-sm font-medium">
                    Username
                  </label>
                  <Input
                    id="lastName"
                    placeholder="Enter your last name"
                    defaultValue="Last Name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium">
                    Password
                  </label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter new password"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="confirmPassword" className="text-sm font-medium">
                    Confirm Password
                  </label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm new password"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">
                    Email Address
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    defaultValue="demomail@mail.com"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="confirmEmail" className="text-sm font-medium">
                    Confirm Email Address
                  </label>
                  <Input
                    id="confirmEmail"
                    type="email"
                    placeholder="Confirm your email"
                    defaultValue="demomail@mail.com"
                  />
                </div>
              </div>

              <Button size="lg">
                Update Info
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
