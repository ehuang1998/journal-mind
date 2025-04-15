import Link from "next/link";
import Image from "next/image";
import { House, NotebookPen, BarChart2 } from "lucide-react";
import ProfileDropdown from "./ProfileDropdown";

export default function DashboardHeader() {
  return (
    <header className="flex items-center justify-between px-10 py-4 border-b border-border">
      <div className="flex items-center">
        <div className="mr-4 text-primary">
          <Image 
            src="/logo.svg" 
            alt="JournalMind Logo" 
            width={35} 
            height={35} 
          />
        </div>
        <h1 className="text-xl font-semibold">JournalMind</h1>
      </div>
      
      <nav className="flex items-center gap-10">
        <Link href="/dashboard" className="flex items-center gap-2">
          <House size={18} />
          <span>Home</span>
        </Link>
        <Link href="/journals" className="flex items-center gap-2">
          <NotebookPen size={18} />
          <span>My Journals</span>
        </Link>
        <Link href="/statistics" className="flex items-center gap-2">
          <BarChart2 size={18} />
          <span>Statistics</span>
        </Link>
        <ProfileDropdown />
      </nav>
    </header>
  );
}