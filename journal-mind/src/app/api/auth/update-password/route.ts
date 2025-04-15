import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; 
import { verify } from 'jsonwebtoken';
import { cookies } from 'next/headers';
import bcrypt from 'bcrypt';

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

export async function POST(req: NextRequest) {
  try {
    // Get userId from cookies instead of Authorization header
    const userId = await getUserIdFromCookies(req);
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { oldPassword, newPassword } = await req.json();

    if (!oldPassword || !newPassword) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    console.log('Updating password for user:', userId);

    // Fetch the user from your DB
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      console.error('User not found:', userId);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (!user.password) {
      console.error('User has no password set:', userId);
      return NextResponse.json({ error: 'Password not set for user' }, { status: 404 });
    }

    console.log('Found user, checking password');

    // Verify the current password using bcrypt
    const isCorrect = await bcrypt.compare(oldPassword, user.password);
    
    if (!isCorrect) {
      console.log('Password verification failed');
      return NextResponse.json({ error: 'Incorrect current password' }, { status: 403 });
    }

    console.log('Password verified, hashing new password');

    // Hash the new password with bcrypt
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update the user's password in the database
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword }
    });

    console.log('Password updated successfully');
    return NextResponse.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Password update error:', error);
    return NextResponse.json(
      { error: 'An error occurred while updating the password' },
      { status: 500 }
    );
  }
}
