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
    
    // Create achievements data
    const achievements = [
      {
        name: 'First Entry',
        unlocked: totalEntries > 0,
      },
      {
        name: 'First Week Complete',
        unlocked: entriesThisWeek >= 5,
      },
      {
        name: '10 Entries Milestone',
        unlocked: totalEntries >= 10,
      },
      {
        name: '30 Day Streak',
        unlocked: false, // Complex calculation omitted for simplicity
      },
      {
        name: '50 Entries Milestone',
        unlocked: totalEntries >= 50,
      },
    ];
    
    return NextResponse.json({
      totalEntries,
      entriesThisWeek,
      entriesThisMonth,
      totalWords,
      averageWords,
      emotionCounts,
      moodData,
      achievements,
      writingGoals: {
        weeklyEntries: {
          current: entriesThisWeek,
          target: 7,
          percentage: Math.min(Math.round((entriesThisWeek / 7) * 100), 100)
        },
        monthlyWordCount: {
          current: totalWords,
          target: 20000,
          percentage: Math.min(Math.round((totalWords / 20000) * 100), 100)
        },
        streakGoal: {
          current: 12, // Demo value for display
          target: 30,
          percentage: 40 // 12/30 days
        }
      }
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