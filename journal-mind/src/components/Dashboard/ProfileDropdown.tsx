import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/UI/dropdown-menu";
import { Settings, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

// ProfileDropdown component for user profile options
export default function ProfileDropdown() {
  const router = useRouter(); // Initialize router for navigation

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

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="focus:outline-none">
        <div className="h-9 w-9 rounded-full bg-gray-300 overflow-hidden hover:ring-2 hover:ring-primary/20 transition-all">
          <img 
            src="/avatar-placeholder.svg" 
            alt="User avatar" 
            className="w-full h-full object-cover"
          />
        </div>
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
