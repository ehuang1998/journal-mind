import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/UI/dropdown-menu";
import { Settings, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Image from "next/image";
import { Avatar, AvatarFallback } from "@/components/UI/avatar";
import { avatarEvents } from "@/lib/avatarEvents";

// Interface for User data
interface User {
  id: string;
  email: string;
  name?: string;
  image?: string;
}

// ProfileDropdown component for user profile options
export default function ProfileDropdown() {
  const router = useRouter(); // Initialize router for navigation
  const [user, setUser] = useState<User | null>(null);
  const [lastUpdateTime, setLastUpdateTime] = useState(0);
  const [imgError, setImgError] = useState(false);

  // Fetch current user data
  async function fetchUser() {
    try {
      const response = await fetch('/api/auth/session');
      if (response.ok) {
        const data = await response.json();
        if (data.user) {
          setUser(data.user);
          setImgError(false); // Reset error state on successful fetch
        }
      }
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  }

  // Initial fetch and periodic refresh
  useEffect(() => {
    fetchUser();
    
    // Set up an interval to refresh the user data periodically
    const intervalId = setInterval(fetchUser, 60000); // Refresh every minute
    
    // Clean up the interval when component unmounts
    return () => clearInterval(intervalId);
  }, []);
  
  // Listen for avatar update events
  useEffect(() => {
    // Handle avatar updates - refetch user data
    const handleAvatarUpdate = () => {
      fetchUser();
      setLastUpdateTime(Date.now());
    };
    
    // Set up event listener
    const cleanup = avatarEvents.onUpdate(handleAvatarUpdate);
    
    // Clean up event listener when component unmounts
    return cleanup;
  }, []);

  // Function to handle navigation to profile settings
  const handleProfileSettings = () => {
    router.push('/settings'); // Navigate to profile settings page
  };

  // Function to handle user logout
  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' }); // Call logout endpoint
      router.push('/auth/login'); // Redirect to login page after successful logout
    } catch (error) {
      console.error("Logout failed:", error); // Log any errors during logout
    }
  };

  // Handle image loading error
  const handleImageError = () => {
    setImgError(true);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="focus:outline-none">
        <Avatar className="h-9 w-9 rounded-full relative overflow-hidden">
          {user?.image && !imgError ? (
            <Image
              src={`${user.image}?t=${lastUpdateTime}`}
              alt={user.name || "User avatar"}
              fill
              className="object-cover"
              onError={handleImageError}
              priority
            />
          ) : (
            <AvatarFallback className="bg-background p-0 relative w-full h-full">
              <Image
                src="/avatar-placeholder.svg"
                alt="Default avatar"
                fill
                className="object-cover rounded-full"
                priority
              />
            </AvatarFallback>
          )}
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={handleProfileSettings} className="cursor-pointer">
          <Settings size={16} className="mr-2" />
          Profile Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive">
          <LogOut size={16} className="mr-2" />
          Log Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
