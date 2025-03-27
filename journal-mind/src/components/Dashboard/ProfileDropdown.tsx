import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/UI/dropdown-menu";
import { Settings, LogOut } from "lucide-react";

export default function ProfileDropdown() {
  const handleProfileSettings = () => {
    // Navigate to profile settings page
    window.location.href = '/settings';
  };

  const handleLogout = () => {
    // Handle logout logic
    // For example: clear session, redirect to login page
    window.location.href = '/auth/login';
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
