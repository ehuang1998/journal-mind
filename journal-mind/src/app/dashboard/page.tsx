import MoodRadarChart from "@/components/Dashboard/RadarChart";
import JournalCard from "@/components/Journal/JournalCard";
import SuggestedTopics from "@/components/Dashboard/SuggestedTopics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, BarChart2, Settings } from "lucide-react";
import Link from "next/link";

export default function Dashboard() {
  // Sample data for the radar chart
  const moodData = [
    { subject: 'Happy', value: 80, fullMark: 100 },
    { subject: 'Accomplished', value: 70, fullMark: 100 },
    { subject: 'Thoughtful', value: 60, fullMark: 100 },
    { subject: 'Excited', value: 50, fullMark: 100 },
    { subject: 'Peaceful', value: 85, fullMark: 100 },
  ];

  // Sample journal entries
  const entries = [
    {
      id: 1,
      title: "Morning Reflections on Career Growth",
      excerpt: "Today I had an inspiring meeting with my mentor. We discussed various opportunities for professional development...",
      dateTime: "2025-03-11 at 09:15 AM",
      mood: "excited",
      isPinned: true
    },
    {
      id: 2,
      title: "Evening Walk Thoughts",
      excerpt: "Took a peaceful walk in Central Park today. The spring flowers are starting to bloom, bringing new energy...",
      dateTime: "2025-03-10 at 06:30 PM",
      mood: "peaceful",
      isPinned: true
    },
    {
      id: 3,
      title: "Project Breakthrough",
      excerpt: "Finally solved that challenging coding problem that's been bothering me for days. The solution was simpler...",
      dateTime: "2025-03-09 at 03:45 PM",
      mood: "accomplished",
      isPinned: false
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-border">
        <div className="flex items-center">
          <div className="mr-2 text-primary">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="2" y="2" width="20" height="20" rx="2" stroke="currentColor" strokeWidth="2" />
              <path d="M6 7H18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <path d="M6 12H18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <path d="M6 17H12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold">JournalMind</h1>
        </div>
        
        <nav className="flex items-center gap-6">
          <Link href="/dashboard" className="flex items-center gap-1.5">
            <span>Home</span>
          </Link>
          <Link href="/search" className="flex items-center gap-1.5">
            <Search size={18} />
            <span>Search</span>
          </Link>
          <Link href="/statistics" className="flex items-center gap-1.5">
            <BarChart2 size={18} />
            <span>Statistics</span>
          </Link>
          <Link href="/settings" className="flex items-center gap-1.5">
            <Settings size={18} />
            <span>Settings</span>
          </Link>
          <div className="ml-4 h-9 w-9 rounded-full bg-gray-300 overflow-hidden">
            <img src="/avatar-placeholder.jpg" alt="User avatar" className="w-full h-full object-cover" />
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <div className="grid grid-cols-[300px_1fr_300px] gap-6 p-6">
        {/* Left Sidebar */}
        <div className="space-y-6">
          {/* Monthly Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Writing Streak</span>
                <span className="font-medium">12 days</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span>Total Entries</span>
                <span className="font-medium">156</span>
              </div>
              
              {/* Radar Chart */}
              <div className="h-48 w-full mt-4">
                <MoodRadarChart data={moodData} />
              </div>
            </CardContent>
          </Card>
          
          {/* Writing Goals */}
          <Card>
            <CardHeader>
              <CardTitle>Writing Goals</CardTitle>
            </CardHeader>
            <CardContent>
              <Progress value={75} className="h-2" />
              <p className="text-sm text-muted-foreground mt-2">
                75% of monthly goal completed
              </p>
            </CardContent>
          </Card>
        </div>
        
        {/* Main Content */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">My Journal Entries</h1>
            <Button>
              <Plus size={16} className="mr-1.5" />
              New Entry
            </Button>
          </div>
          
          {/* Journal Entries */}
          <div className="space-y-4">
            {entries.map(entry => (
              <JournalCard 
                key={entry.id}
                title={entry.title}
                excerpt={entry.excerpt}
                dateTime={entry.dateTime}
                mood={entry.mood}
                isPinned={entry.isPinned}
              />
            ))}
          </div>
        </div>
        
        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Suggested Topics */}
          <SuggestedTopics />
          
          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span>This Week</span>
                <Badge variant="secondary">5 entries</Badge>
              </div>
              
              <div className="flex justify-between items-center">
                <span>This Month</span>
                <Badge variant="secondary">22 entries</Badge>
              </div>
              
              <div className="flex justify-between items-center">
                <span>Average Words</span>
                <Badge variant="secondary">342</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}