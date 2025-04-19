"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import MoodRadarChart from "@/components/Dashboard/RadarChart";
import JournalCard from "@/components/Journal/JournalCard";
import SuggestedTopics from "@/components/Dashboard/SuggestedTopics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/UI/card";
import { Button } from "@/components/UI/button";
import { Progress } from "@/components/UI/progress";
import { Badge } from "@/components/UI/badge";
import { Plus } from "lucide-react";
import { emotionTips, journalingTips } from "@/lib/constants";
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
  recommendation?: string;
  createdAt: string;
}

export default function Dashboard() {
  const [isNewEntryModalOpen, setIsNewEntryModalOpen] = useState(false);
  // Add authentication state
  const [user, setUser] = useState<{ name: string | null } | null>(null);
  const [loading, setLoading] = useState(true);
  const [journals, setJournals] = useState<Journal[]>([]);
  const [allJournals, setAllJournals] = useState<Journal[]>([]);

  const showEmotionNext = useRef(false);

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
        setAllJournals(data);          // full list for notifications
      } catch (error) {
        console.error('Error fetching journals:', error);
      }
    }

    fetchJournals();
  }, [router]);

  const userHasWrittenToday = () => {
    const today = new Date().toDateString();
    return allJournals.some(journal => new Date(journal.createdAt).toDateString() === today);
  };

  const getDominantEmotion = (): string | null => {
    const recent = allJournals.slice(0, 5); // last 5 entries
    const emotionCount: Record<string, number> = {};
  
    for (const journal of recent) {
      emotionCount[journal.emotion] = (emotionCount[journal.emotion] || 0) + 1;
    }
  
    const sorted = Object.entries(emotionCount).sort((a, b) => b[1] - a[1]);
    return sorted.length > 0 ? sorted[0][0] : null;
  };

  useEffect(() => {
    if ("Notification" in window) {
      if (Notification.permission !== "granted") {
        Notification.requestPermission();
      }
  
      const interval = setInterval(() => {
        if (Notification.permission === "granted") {
          if (!userHasWrittenToday()) {
            new Notification("Time to journal!", {
              body: `Hey ${user?.name || "there"}, take 2 minutes to reflect on your day.`,
            });
          } else {
            if (showEmotionNext.current) {
              const emotion = getDominantEmotion();
              if (emotion && emotionTips[emotion]) {
                const tips = emotionTips[emotion];
                const tip = tips[Math.floor(Math.random() * tips.length)];
                new Notification(`Tip for feeling ${emotion}`, { body: tip });
              } else {
                const tip = journalingTips[Math.floor(Math.random() * journalingTips.length)];
                new Notification("Journaling Tip", { body: tip });
              }
            } else {
              const tip = journalingTips[Math.floor(Math.random() * journalingTips.length)];
              new Notification("Journaling Tip", { body: tip });
            }
      
            // Alternate tip type next time
            showEmotionNext.current = !showEmotionNext.current;
          }
        }
      }, 120000);
  
      return () => clearInterval(interval);
    }
  }, [allJournals, user]);

  // Refresh journals after creating a new one
  const handleJournalCreated = () => {
    fetch('/api/journals')
      .then(res => res.json())
      .then((data) => {
        setJournals(data.slice(0, 3));  // for display
        setAllJournals(data);           // for notification logic
      })
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}

      <DashboardHeader />

      {/* Main Content */}
      <div className="grid grid-cols-[450px_1fr_400px] gap-6 p-6">
        {/* Left Sidebar */}
        <div className="space-y-6">
          <div className="text-2xl font-semibold mb-6 pl-3">
              Welcome - {user?.name || 'User'}
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
                  id={journal.id}
                  title={journal.title}
                  excerpt={journal.content}
                  content={journal.content}
                  dateTime={journal.createdAt}
                  mood={journal.emotion}
                  recommendation={journal.recommendation}
                  onEditSuccess={handleJournalCreated}
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