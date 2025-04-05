import MoodRadarChart from "@/components/Dashboard/RadarChart";
import JournalCard from "@/components/Journal/JournalCard";
import SuggestedTopics from "@/components/Dashboard/SuggestedTopics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/UI/card";
import { Button } from "@/components/UI/button";
import { Progress } from "@/components/UI/progress";
import { Badge } from "@/components/UI/badge";
import { Plus, House, Search, NotebookPen, BarChart2, Settings } from "lucide-react";
import Link from "next/link";
import ProfileDropdown from "@/components/Dashboard/ProfileDropdown";

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
      <header className="flex items-center justify-between px-10 py-4 border-b border-border">
        <div className="flex items-center">
          <div className="mr-4 text-primary">
            <img 
                src="/logo.svg" 
                alt="JournalMind Logo" 
                width={35} 
                height={35} 
                className="text-primary"
              />
          </div>
          <h1 className="text-xl font-semibold">JournalMind</h1>
        </div>
        
        <nav className="flex items-center gap-10">
          <Link href="/dashboard" className="flex items-center gap-2">
          <House size={18} />
            <span>Home</span>
          </Link>
          <Link href="/search" className="flex items-center gap-2">
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

      {/* Main Content */}
      <div className="grid grid-cols-[450px_1fr_400px] gap-6 p-6">
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