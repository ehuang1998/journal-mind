// src/app/api/goals/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from '@prisma/client'
import prisma from "@/lib/prisma";  // Use your shared instance instead of creating new one
import jwt from 'jsonwebtoken';
import { TypedPrismaClient } from '@/lib/prisma-types';

// Use the TypedPrismaClient type to properly type our prisma instance
const typedPrisma = prisma as TypedPrismaClient;

// Get user goals
export async function GET(request: Request) {
  try {
    const userId = await getUserIdFromToken(request);
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Fetch user's goals
    const goals = await typedPrisma.goal.findMany({
      where: { userId }
    });

    return NextResponse.json(goals);
  } catch (error) {
    console.error('Error fetching goals:', error);
    return NextResponse.json(
      { error: 'Failed to fetch goals' },
      { status: 500 }
    );
  }
}

// Create a new goal
export async function POST(request: Request) {
  try {
    const userId = await getUserIdFromToken(request);
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    const data = await request.json();
    const { goalType, target } = data;
    
    // Validate inputs
    if (!goalType || !target || target < 1) {
      return NextResponse.json(
        { error: 'Invalid goal data' },
        { status: 400 }
      );
    }
    
    // Check if goal of this type already exists and update it instead
    const existingGoal = await typedPrisma.goal.findFirst({
      where: { 
        userId,
        type: goalType
      }
    });
    
    let goal;
    
    if (existingGoal) {
      // Update existing goal
      goal = await typedPrisma.goal.update({
        where: { id: existingGoal.id },
        data: { target }
      });
    } else {
      // Create new goal
      goal = await typedPrisma.goal.create({
        data: {
          type: goalType,
          target,
          userId
        }
      });
    }
    
    return NextResponse.json(goal);
  } catch (error) {
    console.error('Error saving goal:', error);
    return NextResponse.json(
      { error: 'Failed to save goal' },
      { status: 500 }
    );
  }
}

// Reuse your existing getUserIdFromToken function
async function getUserIdFromToken(request: Request): Promise<string | null> {
  try {
    const cookieHeader = request.headers.get('cookie');
    if (!cookieHeader) return null;
    
    const authToken = cookieHeader.split('; ')
      .find(cookie => cookie.startsWith('auth_token='))
      ?.split('=')[1];
    
    if (!authToken) return null;
    
    const decoded = jwt.verify(authToken, process.env.BETTER_AUTH_SECRET || 'supersecret') as { userId: string };
    return decoded.userId;
  } catch (error) {
    console.error('Error extracting user ID from token:', error);
    return null;
  }
}