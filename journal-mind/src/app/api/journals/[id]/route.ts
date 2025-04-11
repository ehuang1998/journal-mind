import { NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';
import prisma from '@/lib/prisma';

const secret = process.env.BETTER_AUTH_SECRET || 'supersecret';

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

// PUT handler for updating a journal entry
export async function PUT(
  request: Request,
  context: { params: { id: string } }
) {
  const id = context.params.id;
  
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
    let recommendation: string | null = (journal as any).recommendation || null;
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

    // Update the journal with new recommendation
    const updatedJournal = await prisma.journal.update({
      where: { id },
      data: {
        title,
        content,
        emotion,
        ...(recommendation !== null ? { recommendation } : {})
      } as any,
    });

    return NextResponse.json(updatedJournal);
  } catch (error) {
    console.error('Error updating journal:', error);
    return NextResponse.json(
      { error: 'Failed to update journal' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const id = (await context.params).id;
  
  try {
    const userId = await getUserIdFromToken(request);
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
    return NextResponse.json(
      { error: 'Failed to delete journal' },
      { status: 500 }
    );
  }
}