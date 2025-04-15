import { NextRequest, NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';
import prisma from '@/lib/prisma';
// Import the Journal type from Prisma client
import { Journal } from '@prisma/client';

const secret = process.env.BETTER_AUTH_SECRET || 'supersecret';

async function getUserIdFromToken(request: NextRequest) {
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

// PUT handler for updating a journal entry
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - Persistent build error on Route handler signature
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  
  try {
    const userId = await getUserIdFromToken(request);
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Parse the request body
    const body = await request.json();
    const { title, content, emotion } = body;

    // Validate required fields
    if (!title || !content || !emotion) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // First verify the journal belongs to the user
    const journal = await prisma.journal.findUnique({
      where: { id },
    });

    if (!journal) {
      return NextResponse.json(
        { error: 'Journal not found' },
        { status: 404 }
      );
    }

    if (journal.authorId !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Get new AI recommendation only if content or emotion changed
    // Use type assertion cautiously or ensure Journal type includes recommendation
    let recommendation: string | null = (journal as Journal)?.recommendation || null;
    if (content !== journal.content || emotion !== journal.emotion) {
      try {
        const aiResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/gemini-ai`, {
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
        // Keep existing recommendation if AI fails
      }
    }

    // Define the update data type more specifically
    const updateData: Partial<Omit<Journal, 'id' | 'authorId' | 'createdAt' | 'updatedAt'>> = {
      title,
      content,
      emotion,
      ...(recommendation !== null ? { recommendation } : { recommendation: null })
    };

    // Update the journal with new recommendation
    const updatedJournal = await prisma.journal.update({
      where: { id },
      data: updateData, // Use the defined type
    });

    return NextResponse.json(updatedJournal);
  } catch (error) {
    console.error('Error updating journal:', error);
    // Use unknown for catch block
    let errorMessage = 'Failed to update journal';
    if (error instanceof Error) {
        errorMessage = error.message;
    }
    return NextResponse.json(
      { error: errorMessage }, 
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest, 
  { params }: { params: { id: string } }
) {
  const id = params.id;
  
  try {
    // Now the type matches the expected parameter type
    const userId = await getUserIdFromToken(_request); 
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // First verify the journal belongs to the user
    const journal = await prisma.journal.findUnique({
      where: { id },
    });

    if (!journal) {
      return NextResponse.json(
        { error: 'Journal not found' },
        { status: 404 }
      );
    }

    if (journal.authorId !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Delete the journal
    await prisma.journal.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting journal:', error);
    // Use unknown for catch block
    let errorMessage = 'Failed to delete journal';
    if (error instanceof Error) {
        errorMessage = error.message;
    }
    return NextResponse.json(
      { error: errorMessage }, 
      { status: 500 }
    );
  }
}