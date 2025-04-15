"use client";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Input } from "@/components/UI/input";
import { Button } from "@/components/UI/button";
import DashboardHeader from "@/components/Dashboard/DashboardHeader";
import { useRouter } from "next/navigation";
import { Upload } from "lucide-react";
import { avatarEvents } from "@/lib/avatarEvents";

// Define the expected API response type for avatar update
interface AvatarUpdateResponse {
  user: {
    image: string;
  };
  error?: string; // Optional error message
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("account");
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Loading state
  const [isLoading, setIsLoading] = useState(true);
  
  // Display name state (only updates after form submission)
  const [displayName, setDisplayName] = useState({
    firstName: "",
    lastName: ""
  });
  
  // User info state (form values)
  const [userInfo, setUserInfo] = useState({
    email: "",
    firstName: "",
    lastName: ""
  });

  // Avatar state
  const [avatar, setAvatar] = useState<string | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState("");
  const [avatarSuccess, setAvatarSuccess] = useState("");

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

  const [lastUpdateTime, setLastUpdateTime] = useState(Date.now());
  const [avatarImgError, setAvatarImgError] = useState(false);

  // Fetch user data when component mounts
  useEffect(() => {
    async function fetchUserData() {
      try {
        setIsLoading(true);
        const response = await fetch('/api/auth/session');
        
        if (!response.ok) {
          // Redirect to login if not authenticated
          router.push('/auth/login');
          return;
        }
        
        const data = await response.json();
        if (data.user) {
          // Parse the user's name into first name and last name
          let firstName = "";
          let lastName = "";
          
          if (data.user.name) {
            const nameParts = data.user.name.split(' ');
            firstName = nameParts[0] || "";
            lastName = nameParts.slice(1).join(' ') || "";
          }
          
          // Set both display name and form values
          setDisplayName({
            firstName,
            lastName
          });
          
          setUserInfo({
            email: data.user.email || "",
            firstName,
            lastName
          });

          // Set avatar if available
          if (data.user.image) {
            setAvatar(data.user.image);
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchUserData();
  }, [router]);

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

  const handleAvatarClick = () => {
    // Trigger file input click
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset status
    setAvatarError("");
    setAvatarSuccess("");

    // File validation
    if (!file.type.startsWith('image/')) {
      setAvatarError("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setAvatarError("Image size must be less than 5MB");
      return;
    }

    setIsUploadingAvatar(true);

    try {
      // First try the standard file upload approach
      const formData = new FormData();
      formData.append('avatar', file);

      // If available, also prepare a base64 version as backup
      let dataUrl = null;
      try {
        dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      } catch (e) {
        console.error('Failed to convert file to data URL:', e);
        // Continue with just the formData approach
      }

      // First try the standard formData upload
      const response = await fetch('/api/user/update-avatar', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      let result: AvatarUpdateResponse;
      
      // If the standard approach fails and we have a dataUrl, try the alternative approach
      if (!response.ok && dataUrl) {
        console.log('Standard upload failed, trying alternative approach');
        
        const alternativeResponse = await fetch('/api/user/alternative-avatar', {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ dataUrl }),
        });
        
        result = await alternativeResponse.json();
        
        if (!alternativeResponse.ok) {
          throw new Error(result.error || 'Failed to update avatar');
        }
      } else {
        result = await response.json();
        
        if (!response.ok) {
          throw new Error(result.error || 'Failed to update avatar');
        }
      }

      // Update avatar with the new URL
      setAvatar(result.user.image);
      // Update timestamp to force image refresh
      setLastUpdateTime(Date.now());
      setAvatarImgError(false); // Reset error state
      setAvatarSuccess("Avatar updated successfully");
      
      // Trigger avatar update event to notify other components
      avatarEvents.triggerUpdate();
    } catch (error) {
      const errorMessage = (error as Error).message || "There was a problem updating your avatar";
      setAvatarError(errorMessage);
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleAvatarImageError = () => {
    setAvatarImgError(true);
  };

  const handleUpdateInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingInfo(true);
    setInfoError("");
    setInfoSuccess("");

    try {
      // Call the API to update user profile
      const response = await fetch('/api/user/update-profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for authentication
        body: JSON.stringify(userInfo),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update profile');
      }

      // Update the display name only after successful update
      setDisplayName({
        firstName: userInfo.firstName,
        lastName: userInfo.lastName
      });
      
      setInfoSuccess("Your account information has been updated successfully.");
    } catch (error) {
      const errorMessage = (error as Error).message || "There was a problem updating your information.";
      setInfoError(errorMessage);
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
      // HTTP-only cookies are automatically sent with the request when using credentials: 'include'
      const response = await fetch('/api/auth/update-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // This ensures cookies are sent with the request
        body: JSON.stringify({
          oldPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update password');
      }

      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });

      setPasswordSuccess("Your password has been changed successfully.");
    } catch (error) {
      const errorMessage = (error as Error).message || "There was a problem updating your password.";
      setPasswordError(errorMessage);
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  // Show loading state while fetching user data
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader />
        <main className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-center h-64">
            <p className="text-lg">Loading your profile information...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      
      <main className="container mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <div className="w-full md:w-64 shrink-0">
            <div className="flex flex-col items-center mb-6">
              <div className="relative w-24 h-24 mb-4">
                <div className="w-full h-full rounded-full overflow-hidden relative">
                  {avatar && !avatarImgError ? (
                    <Image
                      src={`${avatar}?t=${lastUpdateTime}`}
                      alt="Profile Avatar"
                      fill
                      className="object-cover"
                      onError={handleAvatarImageError}
                      priority
                    />
                  ) : (
                    <Image
                      src="/avatar-placeholder.svg"
                      alt="Default Profile Avatar"
                      fill
                      className="object-cover"
                      priority
                    />
                  )}
                </div>
                
                <button 
                  onClick={handleAvatarClick}
                  className="absolute bottom-0 right-0 bg-primary text-white p-1.5 rounded-full shadow-md hover:bg-primary/80 transition-colors"
                  title="Upload new avatar"
                >
                  <Upload size={16} />
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </button>
              </div>
              <h2 className="text-lg font-semibold">{displayName.firstName} {displayName.lastName}</h2>
              {avatarSuccess && (
                <p className="text-sm text-green-600 mt-1">{avatarSuccess}</p>
              )}
              {avatarError && (
                <p className="text-sm text-red-600 mt-1">{avatarError}</p>
              )}
              {isUploadingAvatar && (
                <p className="text-sm text-muted-foreground mt-1">Uploading...</p>
              )}
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
