"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardHeader from "@/components/Dashboard/DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/UI/card";
import { Progress } from "@/components/UI/progress";
import { Badge } from "@/components/UI/badge";
import { Button } from "@/components/UI/button";
import { Plus, TrendingUp, Clock, CalendarDays, LineChart, Lock, Trophy, Lightbulb, Activity } from "lucide-react";
import MoodRadarChart from "@/components/Dashboard/RadarChart";

// Define interfaces
interface Journal {
  id: string;
  title: string;
  content: string;
  emotion: string;
  recommendation?: string;
  createdAt: string;
}

interface User {
  id: string;
  email: string;
  name?: string;
}

interface WritingGoal {
  name: string;
  current: number;
  target: number;
  unit: string;
  percentage: number;
}

interface Achievement {
  name: string;
  unlocked: boolean;
  icon: React.ReactNode;
}

interface PatternInsight {
  title: string;
  description: string;
  icon: React.ReactNode;
}

interface Recommendation {
  title: string;
  description: string;
  icon: React.ReactNode;
}

// Add a Statistics interface
interface Statistics {
  totalEntries: number;
  entriesThisWeek: number;
  entriesThisMonth: number;
  totalWords: number;
  averageWords: number;
  emotionCounts: Record<string, number>;
  moodData: { subject: string, value: number, fullMark: number }[];
  achievements: { name: string, unlocked: boolean }[];
  writingGoals: {
    weeklyEntries: { current: number, target: number, percentage: number };
    monthlyWordCount: { current: number, target: number, percentage: number };
    streakGoal: { current: number, target: number, percentage: number };
  };
}

export default function StatisticsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [journals, setJournals] = useState<Journal[]>([]);
  // Add statistics state
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Fetch user and journals
  useEffect(() => {
    async function fetchUserAndStats() {
      try {
        // Fetch user data
        const userResponse = await fetch('/api/auth/session');
        if (!userResponse.ok) {
          router.push('/auth/login');
          return;
        }
        const userData = await userResponse.json();
        setUser(userData.user);

        // Fetch journals
        const journalsResponse = await fetch('/api/journals');
        if (!journalsResponse.ok) {
          throw new Error('Failed to fetch journals');
        }
        const journalsData = await journalsResponse.json();
        setJournals(journalsData);

        // Fetch statistics data
        const statsResponse = await fetch('/api/statistics');
        if (!statsResponse.ok) {
          throw new Error('Failed to fetch statistics');
        }
        const statsData = await statsResponse.json();
        setStatistics(statsData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchUserAndStats();
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Calculate writing statistics
  const journalCount = journals.length;
  const lastWeekCount = journals.filter(journal => {
    const journalDate = new Date(journal.createdAt);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return journalDate >= weekAgo;
  }).length;

  const lastMonthCount = journals.filter(journal => {
    const journalDate = new Date(journal.createdAt);
    const monthAgo = new Date();
    monthAgo.setDate(monthAgo.getDate() - 30);
    return journalDate >= monthAgo;
  }).length;

  // Calculate total words in all journals
  const totalWords = journals.reduce((total, journal) => {
    return total + (journal.content.split(/\s+/).length || 0);
  }, 0);

  // Calculate average words per entry
  const averageWords = journalCount > 0 ? Math.round(totalWords / journalCount) : 0;

  // Calculate writing streak (consecutive days with entries)
  // This is a simplified version - a real implementation would be more complex
  const currentStreak = 12; // Demo value for display purposes

  // Define writing goals
  const writingGoals: WritingGoal[] = [
    {
      name: "Weekly entries",
      current: 5,
      target: 7,
      unit: "entries",
      percentage: 71
    },
    {
      name: "Monthly word count",
      current: 15000,
      target: 20000,
      unit: "words",
      percentage: 75
    },
    {
      name: "Streak goal",
      current: 12,
      target: 30,
      unit: "days",
      percentage: 40
    }
  ];

  // Define achievements
  const achievements: Achievement[] = [
    {
      name: "First Week Complete",
      unlocked: true,
      icon: <Trophy className="h-8 w-8 text-primary" />
    },
    {
      name: "10 Entries Milestone",
      unlocked: true,
      icon: <Trophy className="h-8 w-8 text-primary" />
    },
    {
      name: "30 Day Streak",
      unlocked: false,
      icon: <Lock className="h-8 w-8 text-muted" />
    },
    {
      name: "50 Entries Milestone",
      unlocked: false,
      icon: <Lock className="h-8 w-8 text-muted" />
    }
  ];

  // Define pattern insights
  const patternInsights: PatternInsight[] = [
    {
      title: "Mood Improvement",
      description: "Your mood scores have improved by 15% over the past month.",
      icon: <TrendingUp className="h-5 w-5 text-blue-500" />
    },
    {
      title: "Writing Consistency",
      description: "You've been most consistent writing in the evenings around 9 PM.",
      icon: <Clock className="h-5 w-5 text-blue-500" />
    },
    {
      title: "Emotional Patterns",
      description: "Your journal entries show more positive emotions on weekends.",
      icon: <LineChart className="h-5 w-5 text-blue-500" />
    }
  ];

  // Define recommendations
  const recommendations: Recommendation[] = [
    {
      title: "Morning Reflection",
      description: "Try writing in the morning to set a positive tone for your day.",
      icon: <Lightbulb className="h-5 w-5 text-green-500" />
    },
    {
      title: "Gratitude Focus",
      description: "Consider including three things you're grateful for in each entry.",
      icon: <Lightbulb className="h-5 w-5 text-green-500" />
    },
    {
      title: "Mindfulness Exercise",
      description: "Try the 5-minute breathing exercise before journaling to improve focus and emotional clarity.",
      icon: <Activity className="h-5 w-5 text-purple-500" />
    }
  ];

  // Sample mood data for the radar chart
  const moodData = [
    { subject: 'Happy', value: 80, fullMark: 100 },
    { subject: 'Accomplished', value: 70, fullMark: 100 },
    { subject: 'Thoughtful', value: 60, fullMark: 100 },
    { subject: 'Excited', value: 50, fullMark: 100 },
    { subject: 'Peaceful', value: 85, fullMark: 100 },
  ];

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      <main className="container mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold mb-8">Statistics & Insights</h1>

        {/* Goals & Milestones Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">Goals & Milestones</CardTitle>
            <p className="text-muted-foreground">Track your progress and celebrate achievements</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Writing Goals */}
              <div>
                <h3 className="text-xl font-semibold mb-4">Writing Goals</h3>
                <div className="space-y-6">
                  {writingGoals.map((goal) => (
                    <div key={goal.name}>
                      <div className="flex justify-between items-center mb-2">
                        <span>{goal.name} ({goal.current}/{goal.target})</span>
                        <span>{goal.percentage}%</span>
                      </div>
                      <Progress value={goal.percentage} className="h-2" />
                    </div>
                  ))}
                  <Button className="mt-4" variant="outline">
                    <Plus size={16} className="mr-2" />
                    Set New Goal
                  </Button>
                </div>
              </div>

              {/* Achievements */}
              <div>
                <h3 className="text-xl font-semibold mb-4">Achievements</h3>
                <div className="grid grid-cols-2 gap-4">
                  {achievements.map((achievement) => (
                    <Card key={achievement.name} className={`p-4 flex flex-col items-center justify-center ${achievement.unlocked ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-muted'}`}>
                      <div className="mb-2">
                        {achievement.icon}
                      </div>
                      <p className="text-center">{achievement.name}</p>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Insights & Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Insights & Recommendations</CardTitle>
            <p className="text-muted-foreground">Personalized observations based on your journaling patterns</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Pattern Insights */}
              <div>
                <h3 className="text-xl font-semibold mb-4">Pattern Insights</h3>
                <div className="space-y-4">
                  {patternInsights.map((insight) => (
                    <Card key={insight.title} className="p-4 bg-blue-50 dark:bg-blue-900/20">
                      <div className="flex items-start gap-3">
                        <div>{insight.icon}</div>
                        <div>
                          <h4 className="font-medium">{insight.title}</h4>
                          <p className="text-muted-foreground">{insight.description}</p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Recommendations */}
              <div>
                <h3 className="text-xl font-semibold mb-4">Recommendations</h3>
                <div className="space-y-4">
                  {recommendations.map((recommendation) => (
                    <Card key={recommendation.title} className="p-4 bg-green-50 dark:bg-green-900/20">
                      <div className="flex items-start gap-3">
                        <div>{recommendation.icon}</div>
                        <div>
                          <h4 className="font-medium">{recommendation.title}</h4>
                          <p className="text-muted-foreground">{recommendation.description}</p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </div>

            {/* Radar Chart Section */}
            <div className="mt-8">
              <h3 className="text-xl font-semibold mb-4">Mood Patterns</h3>
              <div className="h-[300px] w-full">
                <MoodRadarChart data={moodData} />
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}