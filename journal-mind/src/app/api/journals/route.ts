import { NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';
import prisma from '@/lib/prisma';

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

    const journal = await prisma.journal.create({
      data: { title, content, emotion, authorId: userId },
    });

    return NextResponse.json(journal, { status: 201 });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to create journal' },
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

    return NextResponse.json(journals);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch journals' },
      { status: 500 }
    );
  }
}
