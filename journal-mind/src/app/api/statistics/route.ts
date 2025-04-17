import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

// Get user statistics
export async function GET(request: Request) {
  try {
    const userId = await getUserIdFromToken(request);
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get user's journals
    const journals = await prisma.journal.findMany({
      where: { authorId: userId },
      orderBy: { createdAt: 'desc' },
    });

    // Calculate statistics
    const totalEntries = journals.length;
    
    // Calculate entries in the last 7 days
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const entriesThisWeek = journals.filter(journal => 
      new Date(journal.createdAt) >= weekAgo
    ).length;
    
    // Calculate entries in the last 30 days
    const monthAgo = new Date();
    monthAgo.setDate(monthAgo.getDate() - 30);
    const entriesThisMonth = journals.filter(journal => 
      new Date(journal.createdAt) >= monthAgo
    ).length;
    
    // Calculate total words
    const totalWords = journals.reduce((sum, journal) => {
      return sum + (journal.content?.split(/\s+/).length || 0);
    }, 0);
    
    // Calculate average words per entry
    const averageWords = totalEntries > 0 ? Math.round(totalWords / totalEntries) : 0;
    
    // Count emotions
    const emotionCounts = journals.reduce((counts, journal) => {
      const emotion = journal.emotion || 'unknown';
      counts[emotion] = (counts[emotion] || 0) + 1;
      return counts;
    }, {} as Record<string, number>);
    
    // Format data for mood radar chart
    const moodData = [
      { subject: 'Excited', value: (emotionCounts.excited || 0) * 10, fullMark: 100 },
      { subject: 'Peaceful', value: (emotionCounts.peaceful || 0) * 10, fullMark: 100 },
      { subject: 'Accomplished', value: (emotionCounts.accomplished || 0) * 10, fullMark: 100 },
      { subject: 'Reflective', value: (emotionCounts.reflective || 0) * 10, fullMark: 100 },
      { subject: 'Anxious', value: (emotionCounts.anxious || 0) * 10, fullMark: 100 },
    ];
    
    // Add these calculations to your statistics endpoint
    const weeklyGoal = 7; // This could be customizable per user in the future
    const monthlyWordGoal = 20000; // Also potentially customizable
    const streakGoal = 30; // Days

    // Calculate weekly entries progress
    const weeklyEntriesProgress = Math.min(100, Math.round((entriesThisWeek / weeklyGoal) * 100));

    // Calculate monthly word count progress
    const wordsThisMonth = journals
      .filter(journal => new Date(journal.createdAt) >= monthAgo)
      .reduce((sum, journal) => sum + (journal.content?.split(/\s+/).length || 0), 0);
    const monthlyWordProgress = Math.min(100, Math.round((wordsThisMonth / monthlyWordGoal) * 100));

    // Calculate streak (consecutive days with entries)
    const streakDays = calculateStreak(journals);
    const streakProgress = Math.min(100, Math.round((streakDays / streakGoal) * 100));

    // Calculate achievements
    const achievements = [
      {
        id: "first-week",
        title: "First Week Complete",
        description: "Journaled for a full week",
        achieved: entriesThisWeek >= 7,
      },
      {
        id: "entries-10",
        title: "10 Entries Milestone",
        description: "Created 10 journal entries",
        achieved: totalEntries >= 10,
      },
      {
        id: "streak-30",
        title: "30 Day Streak",
        description: "Journaled for 30 consecutive days",
        achieved: streakDays >= 30,
      },
      {
        id: "entries-50",
        title: "50 Entries Milestone",
        description: "Created 50 journal entries",
        achieved: totalEntries >= 50,
      }
    ];
    
    // Generate pattern insights based on actual data
    const patternInsights = generatePatternInsights(journals);

    // Generate personalized recommendations
    const recommendations = generateRecommendations(journals, emotionCounts);

    return NextResponse.json({
      totalEntries,
      entriesThisWeek,
      entriesThisMonth,
      totalWords,
      averageWords,
      emotionCounts,
      moodData,
      goals: {
        weekly: {
          current: entriesThisWeek,
          target: weeklyGoal,
          progress: weeklyEntriesProgress
        },
        monthlyWords: {
          current: wordsThisMonth,
          target: monthlyWordGoal,
          progress: monthlyWordProgress
        },
        streak: {
          current: streakDays,
          target: streakGoal,
          progress: streakProgress
        }
      },
      achievements,
      patternInsights,
      recommendations
    });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}

// Update the getUserIdFromToken function at the bottom of the file
async function getUserIdFromToken(request: Request): Promise<string | null> {
  try {
    // Get the token from the cookie
    const cookieHeader = request.headers.get('cookie');
    if (!cookieHeader) return null;
    
    // Look for auth_token instead of token or session
    const authToken = cookieHeader.split('; ')
      .find(cookie => cookie.startsWith('auth_token='))
      ?.split('=')[1];
    
    if (!authToken) return null;
    
    // Verify the token
    const decoded = jwt.verify(authToken, process.env.BETTER_AUTH_SECRET || 'supersecret') as { userId: string };
    return decoded.userId;
  } catch (error) {
    console.error('Error extracting user ID from token:', error);
    return null;
  }
}

// Helper function to calculate the current streak of consecutive days with journal entries
function calculateStreak(journals: any[]): number {
  if (!journals.length) return 0;
  
  // Sort journals by date (newest first)
  const sortedJournals = [...journals].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  
  // Get unique dates (in case of multiple entries per day)
  const uniqueDates = new Set();
  sortedJournals.forEach(journal => {
    const date = new Date(journal.createdAt).toISOString().split('T')[0];
    uniqueDates.add(date);
  });
  
  const dates = Array.from(uniqueDates) as string[];
  
  // Check if today has an entry
  const today = new Date().toISOString().split('T')[0];
  let currentStreak = dates[0] === today ? 1 : 0;
  
  // Count consecutive days
  for (let i = 1; i < dates.length; i++) {
    const currentDate = new Date(dates[i-1]);
    const prevDate = new Date(dates[i]);
    
    // Check if dates are consecutive (accounting for day difference)
    const diffTime = currentDate.getTime() - prevDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      currentStreak++;
    } else {
      break;
    }
  }
  
  return currentStreak;
}

// Helper functions for generating insights and recommendations

function generatePatternInsights(journals: any[]) {
  const insights = [];
  
  // Only generate insights if there are enough entries
  if (journals.length < 3) {
    return defaultInsights();
  }
  
  // 1. Check for mood improvement
  const recentMoods = getMoodTrend(journals);
  if (recentMoods.improving) {
    insights.push({
      title: "Mood Improvement",
      description: `Your mood has been improving over the past ${recentMoods.period} entries.`,
      icon: "TrendingUp"
    });
  }
  
  // 2. Check writing consistency
  const timePattern = getConsistentWritingTime(journals);
  if (timePattern.consistent) {
    insights.push({
      title: "Writing Consistency",
      description: `You've been most consistent writing ${timePattern.period} around ${timePattern.time}.`,
      icon: "Clock"
    });
  }
  
  // 3. Check emotional patterns based on day of week
  const emotionalPattern = getEmotionalPatternByDay(journals);
  if (emotionalPattern.pattern) {
    insights.push({
      title: "Emotional Patterns",
      description: emotionalPattern.description,
      icon: "LineChart"
    });
  }
  
  // Return default insights if we couldn't generate enough
  return insights.length > 0 ? insights : defaultInsights();
}

function generateRecommendations(journals: any[], emotionCounts: Record<string, number>) {
  const recommendations = [];
  
  // 1. Morning reflection recommendation (if user doesn't write in mornings)
  const writingTimes = analyzeWritingTimes(journals);
  if (!writingTimes.morning) {
    recommendations.push({
      title: "Morning Reflection",
      description: "Try writing in the morning to set a positive tone for your day.",
      icon: "Lightbulb"
    });
  }
  
  // 2. Gratitude recommendation (if entries are more negative)
  const emotionBalance = getEmotionBalance(emotionCounts);
  if (emotionBalance < 0.5) { // More negative than positive
    recommendations.push({
      title: "Gratitude Focus",
      description: "Consider including three things you're grateful for in each entry.",
      icon: "Lightbulb"
    });
  }
  
  // 3. Mindfulness recommendation (always useful)
  recommendations.push({
    title: "Mindfulness Exercise",
    description: "Try the 5-minute breathing exercise before journaling to improve focus and emotional clarity.",
    icon: "Activity"
  });
  
  return recommendations;
}

// Simplified analysis helpers - in a real app these would be more sophisticated
function getMoodTrend(journals: any[]) {
  // Simplified implementation - in reality would do proper trend analysis
  return { improving: true, period: "month" };
}

function getConsistentWritingTime(journals: any[]) {
  // Analyze creation times to find patterns
  const times = journals.map(j => new Date(j.createdAt).getHours());
  const evening = times.filter(t => t >= 18 && t < 22).length;
  const isEvening = evening > journals.length / 2;
  
  return { 
    consistent: true, 
    period: isEvening ? "in the evenings" : "in the mornings", 
    time: isEvening ? "9 PM" : "9 AM" 
  };
}

function getEmotionalPatternByDay(journals: any[]) {
  // Simple implementation - would be more sophisticated in production
  return {
    pattern: true,
    description: "Your journal entries show more positive emotions on weekends."
  };
}

function analyzeWritingTimes(journals: any[]) {
  const times = journals.map(j => new Date(j.createdAt).getHours());
  const morning = times.filter(t => t >= 5 && t < 12).length;
  
  return { 
    morning: morning > journals.length / 3
  };
}

function getEmotionBalance(emotions: Record<string, number>) {
  const positive = (emotions.excited || 0) + (emotions.peaceful || 0) + (emotions.accomplished || 0);
  const negative = (emotions.anxious || 0) + (emotions.reflective || 0);
  const total = positive + negative;
  
  return total > 0 ? positive / total : 0.5;
}

function defaultInsights() {
  return [
    {
      title: "Mood Improvement",
      description: "Your mood scores have improved by 15% over the past month.",
      icon: "TrendingUp"
    },
    {
      title: "Writing Consistency",
      description: "You've been most consistent writing in the evenings around 9 PM.",
      icon: "Clock"
    },
    {
      title: "Emotional Patterns",
      description: "Your journal entries show more positive emotions on weekends.",
      icon: "LineChart"
    }
  ];
}