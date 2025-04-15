import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verify } from 'jsonwebtoken';
import { cookies } from 'next/headers';

// Get secret from environment
const secret = process.env.BETTER_AUTH_SECRET || 'supersecret';

// Function to get user ID from auth token in cookies
async function getUserIdFromCookies(req: NextRequest): Promise<string | null> {
  try {
    // Get the auth token from cookies
    const cookieStore = await cookies();
    const authToken = cookieStore.get('auth_token')?.value;
    
    if (!authToken) {
      return null;
    }
    
    // Verify and decode the JWT
    const decoded = verify(authToken, secret) as { userId: string };
    return decoded.userId;
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}

export async function PUT(req: NextRequest) {
  try {
    // Get userId from cookies
    const userId = await getUserIdFromCookies(req);
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Parse request body
    const { email, firstName, lastName } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    console.log('Updating profile for user:', userId);

    // Combine first name and last name to create the full name
    const name = [firstName, lastName].filter(Boolean).join(' ');

    // Update the user in the database
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { 
        email,
        name 
      }
    });

    console.log('Profile updated successfully');
    
    // Return updated user info (without sensitive fields)
    return NextResponse.json({
      message: 'Profile updated successfully',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name
      }
    });
  } catch (error: any) {
    console.error('Profile update error:', error);
    
    // If the error is a Prisma error with code P2002, it's a unique constraint violation (email already exists)
    if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
      return NextResponse.json(
        { error: 'This email is already in use' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: 'An error occurred while updating your profile' },
      { status: 500 }
    );
  }
} 