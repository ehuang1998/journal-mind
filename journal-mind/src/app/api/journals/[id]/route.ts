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

    // Update the journal
    const updatedJournal = await prisma.journal.update({
      where: { id },
      data: {
        title,
        content,
        emotion,
        // Don't update createdAt since we're just editing
      },
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