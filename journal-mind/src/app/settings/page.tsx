"use client";
import { useState } from "react";
import { Input } from "@/components/UI/input";
import { Button } from "@/components/UI/button";
import DashboardHeader from "@/components/Dashboard/DashboardHeader";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("account");
  
  // User info state
  const [userInfo, setUserInfo] = useState({
    email: "support@profilepress.net",
    firstName: "John",
    lastName: "Doe"
  });

  // Password state
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  // Loading states
  const [isUpdatingInfo, setIsUpdatingInfo] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  
  // Error states
  const [infoError, setInfoError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [infoSuccess, setInfoSuccess] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  const handleUserInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserInfo(prev => ({ ...prev, [name]: value }));
    setInfoError("");
    setInfoSuccess("");
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
    setPasswordError("");
    setPasswordSuccess("");
  };

  const handleUpdateInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingInfo(true);
    setInfoError("");
    setInfoSuccess("");

    try {
      // API call would go here
      // const response = await fetch('/api/user/update-info', {
      //   method: 'PUT',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify(userInfo),
      // });

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setInfoSuccess("Your account information has been updated successfully.");
    } catch (error) {
      setInfoError("There was a problem updating your information.");
    } finally {
      setIsUpdatingInfo(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("New password and confirmation don't match.");
      return;
    }

    setIsUpdatingPassword(true);

    try {
      // API call would go here
      // const response = await fetch('/api/user/change-password', {
      //   method: 'PUT',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({
      //     currentPassword: passwordData.currentPassword,
      //     newPassword: passwordData.newPassword,
      //   }),
      // });

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });

      setPasswordSuccess("Your password has been changed successfully.");
    } catch (error) {
      setPasswordError("There was a problem updating your password.");
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      
      <main className="container mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <div className="w-full md:w-64 shrink-0">
            <div className="flex flex-col items-center mb-6">
              <div className="relative w-24 h-24 rounded-full overflow-hidden mb-4">
                <img
                  src="https://avatars.githubusercontent.com/u/124599?v=4"
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
              <h2 className="text-lg font-semibold">{userInfo.firstName} {userInfo.lastName}</h2>
            </div>
            
            <div className="bg-card rounded-lg border border-border overflow-hidden">
              <ul className="divide-y divide-border">
                <li>
                  <button 
                    onClick={() => setActiveTab("account")}
                    className={`w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-muted ${activeTab === "account" ? "bg-muted" : ""}`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                    Account Details
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setActiveTab("password")}
                    className={`w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-muted ${activeTab === "password" ? "bg-muted" : ""}`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                    Change Password
                  </button>
                </li>
                <li>
                  <button className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-muted">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                      <polyline points="16 17 21 12 16 7" />
                      <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                    Logout
                  </button>
                </li>
              </ul>
            </div>
          </div>
          
          {/* Content Area */}
          <div className="flex-1">
            {activeTab === "account" && (
              <div>
                <h1 className="text-2xl font-bold mb-6">Account Settings</h1>
                {infoSuccess && (
                  <div className="mb-4 p-3 bg-green-100 text-green-800 rounded">
                    {infoSuccess}
                  </div>
                )}
                {infoError && (
                  <div className="mb-4 p-3 bg-red-100 text-red-800 rounded">
                    {infoError}
                  </div>
                )}
                <form onSubmit={handleUpdateInfo} className="space-y-4">
                  <div className="space-y-1">
                    <label htmlFor="email" className="text-sm font-medium">
                      Email address
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={userInfo.email}
                      onChange={handleUserInfoChange}
                      required
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <label htmlFor="firstName" className="text-sm font-medium">
                      First name
                    </label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={userInfo.firstName}
                      onChange={handleUserInfoChange}
                      required
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <label htmlFor="lastName" className="text-sm font-medium">
                      Last name
                    </label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={userInfo.lastName}
                      onChange={handleUserInfoChange}
                      required
                    />
                  </div>
                  
                  <div className="mt-6">
                    <Button type="submit" disabled={isUpdatingInfo}>
                      {isUpdatingInfo ? "Updating..." : "Update Profile"}
                    </Button>
                  </div>
                </form>
              </div>
            )}
            
            {activeTab === "password" && (
              <div>
                <h1 className="text-2xl font-bold mb-6">Change Password</h1>
                {passwordSuccess && (
                  <div className="mb-4 p-3 bg-green-100 text-green-800 rounded">
                    {passwordSuccess}
                  </div>
                )}
                {passwordError && (
                  <div className="mb-4 p-3 bg-red-100 text-red-800 rounded">
                    {passwordError}
                  </div>
                )}
                <form onSubmit={handleUpdatePassword} className="space-y-4">
                  <div className="space-y-1">
                    <label htmlFor="currentPassword" className="text-sm font-medium">
                      Current Password
                    </label>
                    <Input
                      id="currentPassword"
                      name="currentPassword"
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      required
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <label htmlFor="newPassword" className="text-sm font-medium">
                      New Password
                    </label>
                    <Input
                      id="newPassword"
                      name="newPassword"
                      type="password"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      required
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <label htmlFor="confirmPassword" className="text-sm font-medium">
                      Confirm New Password
                    </label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      required
                    />
                  </div>
                  
                  <div className="mt-6">
                    <Button type="submit" disabled={isUpdatingPassword}>
                      {isUpdatingPassword ? "Updating..." : "Update Password"}
                    </Button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
