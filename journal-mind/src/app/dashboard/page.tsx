"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import MoodRadarChart from "@/components/Dashboard/RadarChart";
import JournalCard from "@/components/Journal/JournalCard";
import SuggestedTopics from "@/components/Dashboard/SuggestedTopics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/UI/card";
import { Button } from "@/components/UI/button";
import { Progress } from "@/components/UI/progress";
import { Badge } from "@/components/UI/badge";
import { Plus } from "lucide-react";
import JournalEntryModal from "@/components/Dashboard/JournalEntryModal";
import DashboardHeader from "@/components/Dashboard/DashboardHeader";

// Define user type for TypeScript type safety
interface User {
  id: string;
  email: string;
  name?: string;  // Optional field
  createdAt?: string;  // Optional field
}

interface Journal {
  id: string;
  title: string;
  content: string;
  emotion: string;
  createdAt: string;
}

export default function Dashboard() {
  const [isNewEntryModalOpen, setIsNewEntryModalOpen] = useState(false);
  // Add authentication state
  const [user, setUser] = useState<{ name: string | null } | null>(null);
  const [loading, setLoading] = useState(true);
  const [journals, setJournals] = useState<Journal[]>([]);
  const router = useRouter();

  useEffect(() => {
    // Function to check if user is authenticated
    async function checkAuth() {
      try {
        // Fetch current user from session endpoint
        const response = await fetch('/api/auth/session');
        
        if (!response.ok) {
          // If not authenticated, redirect to login page
          router.push('/auth/login');
          return;
        }
        
        // Parse and store user data if authenticated
        const userData = await response.json();
        setUser(userData.user);
      } catch (error) {
        // Handle any errors during authentication check
        console.error("Failed to check authentication:", error);
        router.push('/auth/login');
      } finally {
        // Set loading to false regardless of outcome
        setLoading(false);
      }
    }
    
    // Call the authentication check function when component mounts
    checkAuth();
  }, [router]); // Re-run if router changes

  useEffect(() => {
    async function fetchUser() {
      try {
        const response = await fetch('/api/auth/session');
        const data = await response.json();
        if (data.user) {
          setUser(data.user);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    }

    fetchUser();
  }, []);
  
  // Handler for user logout
  const handleLogout = async () => {
    try {
      // Call logout endpoint
      await fetch('/api/auth/logout', { method: 'POST' });
      // Redirect to login page after successful logout
      router.push('/auth/login');
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // Fetch user's journals
  useEffect(() => {
    async function fetchJournals() {
      try {
        const response = await fetch('/api/journals');
        if (!response.ok) {
          if (response.status === 401) {
            router.push('/auth/login');
            return;
          }
          throw new Error('Failed to fetch journals');
        }
        const data = await response.json();
        setJournals(data.slice(0,3 )); // Only take the last 3 journals
      } catch (error) {
        console.error('Error fetching journals:', error);
      }
    }

    fetchJournals();
  }, [router]);

  // Refresh journals after creating a new one
  const handleJournalCreated = () => {
    fetch('/api/journals')
      .then(res => res.json())
      .then(data => setJournals(data))
      .catch(err => console.error('Error refreshing journals:', err));
  };

  // Show loading state while checking authentication
  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  // Sample data for the radar chart
  const moodData = [
    { subject: 'Happy', value: 80, fullMark: 100 },
    { subject: 'Accomplished', value: 70, fullMark: 100 },
    { subject: 'Thoughtful', value: 60, fullMark: 100 },
    { subject: 'Excited', value: 50, fullMark: 100 },
    { subject: 'Peaceful', value: 85, fullMark: 100 },
  ];

  // Sample journal entries
  // const entries = [
  //   {
  //     id: 1,
  //     title: "Morning Reflections on Career Growth",
  //     excerpt: "Today I had an inspiring meeting with my mentor. We discussed various opportunities for professional development...",
  //     dateTime: "2025-03-11 at 09:15 AM",
  //     mood: "excited",
  //     isPinned: true
  //   },
  //   {
  //     id: 2,
  //     title: "Evening Walk Thoughts",
  //     excerpt: "Took a peaceful walk in Central Park today. The spring flowers are starting to bloom, bringing new energy...",
  //     dateTime: "2025-03-10 at 06:30 PM",
  //     mood: "peaceful",
  //     isPinned: true
  //   },
  //   {
  //     id: 3,
  //     title: "Project Breakthrough",
  //     excerpt: "Finally solved that challenging coding problem that's been bothering me for days. The solution was simpler...",
  //     dateTime: "2025-03-09 at 03:45 PM",
  //     mood: "accomplished",
  //     isPinned: false
  //   },
  //   {
  //     id: 4,
  //     title: "Project Breakthrough",
  //     excerpt: "Finally solved that challenging coding problem that's been bothering me for days. The solution was simpler...",
  //     dateTime: "2025-03-09 at 03:45 PM",
  //     mood: "accomplished",
  //     isPinned: false
  //   },
  //   {
  //     id: 5,
  //     title: "Project Breakthrough",
  //     excerpt: "Finally solved that challenging coding problem that's been bothering me for days. The solution was simpler...",
  //     dateTime: "2025-03-09 at 03:45 PM",
  //     mood: "accomplished",
  //     isPinned: false
  //   },
  //   {
  //     id: 6,
  //     title: "Project Breakthrough",
  //     excerpt: "Finally solved that challenging coding problem that's been bothering me for days. The solution was simpler...",
  //     dateTime: "2025-03-09 at 03:45 PM",
  //     mood: "accomplished",
  //     isPinned: false
  //   }
  // ];

  // // Get only the last 3 entries
  // const recentEntries = entries.slice(0, 3);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}

      <DashboardHeader />

      {/* Main Content */}
      <div className="grid grid-cols-[450px_1fr_400px] gap-6 p-6">
        {/* Left Sidebar */}
        <div className="space-y-6">
          <div className="text-2xl font-semibold mb-6 pl-3">
              Welcome {user?.name || 'User'}
          </div>
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
            <Button onClick={() => setIsNewEntryModalOpen(true)}>
              <Plus size={16} className="mr-1.5" />
              New Entry
            </Button>
          </div>
          {/* Journal Entries */}
          {journals.length === 0 ? (
            <div className="text-center py-12">
              <h2 className="text-xl font-semibold mb-2">No journal entries yet</h2>
              <p className="text-muted-foreground mb-4">
                Start your journaling journey by creating your first entry
              </p>
              <Button onClick={() => setIsNewEntryModalOpen(true)}>
                Create First Entry
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {journals.map((journal) => (
                <JournalCard 
                key={journal.id}
                title={journal.title}
                excerpt={journal.content}
                dateTime={journal.createdAt}
                mood={journal.emotion}
                //isPinned={entry.isPinned}
              />
            ))}
              
            </div>
          )}
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

      {/* Add the modal */}
      <JournalEntryModal 
        isOpen={isNewEntryModalOpen}
        onClose={() => setIsNewEntryModalOpen(false)}
        onSuccess={handleJournalCreated}
      />
    </div>
  );
}