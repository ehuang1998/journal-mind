import { NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';

// Get secret from environment
const secret = process.env.BETTER_AUTH_SECRET || 'supersecret';

// Helper function to get user ID from auth token
async function getUserIdFromToken(request: Request) {
  const cookies = request.headers.get('cookie');
  const authToken = cookies?.split('; ')
    .find(cookie => cookie.startsWith('auth_token='))
    ?.split('=')[1];

  if (!authToken) return null;

  try {
    const decoded = verify(authToken, secret) as { userId: string };
    return decoded.userId;
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getUserIdFromToken(request);
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { title, content, emotion } = await request.json();
    if (!title || !content || !emotion) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get AI recommendation
    let recommendation = null;
    try {
      const aiResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/gemini-ai`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content, emotion }),
      });
      
      if (aiResponse.ok) {
        const data = await aiResponse.json();
        recommendation = data.recommendation;
      }
    } catch (aiError) {
      console.error('Error getting AI recommendation:', aiError);
      // Continue without recommendation if AI fails
    }

    // Define the create data type specifically
    const createData: Prisma.JournalCreateInput = {
      title,
      content,
      emotion,
      author: { connect: { id: userId } }, // Correct way to link relation
      ...(recommendation ? { recommendation } : {})
    };

    // Create journal with recommendation
    const journal = await prisma.journal.create({
      data: createData, // Use the defined type
    });

    return NextResponse.json(journal, { status: 201 });
  } catch (error: unknown) { // Add unknown type
    console.error('Error creating journal:', error);
    let errorMessage = 'Failed to create journal';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

// Get user's journals
export async function GET(request: Request) {
  try {
    const userId = await getUserIdFromToken(request);
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const journals = await prisma.journal.findMany({
      where: { authorId: userId },
      orderBy: { createdAt: 'desc' },
    });

    // Return response with cache-control headers to prevent caching
    return NextResponse.json(journals, {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (error: unknown) { // Add unknown type
    console.error('Error fetching journals:', error);
    let errorMessage = 'Failed to fetch journals';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
