import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; 
import { verify, JwtPayload } from 'jsonwebtoken';
import { cookies } from 'next/headers';
import bcrypt from 'bcrypt';

// Get secret from environment
const secret = process.env.BETTER_AUTH_SECRET || 'supersecret';

// Define interface for expected token payload
interface DecodedToken extends JwtPayload {
  userId?: string;
}

// Helper function to get userId from cookies
async function getUserIdFromCookies(): Promise<string | null> {
  // Await the cookies() call
  const cookieStore = await cookies(); 
  const authToken = cookieStore.get('auth_token')?.value;

  if (!authToken) {
    return null;
  }

  try {
    const decoded = verify(authToken, secret) as DecodedToken;
    return decoded.userId ?? null;
  } catch (error) {
    console.error('Error verifying token in update-password:', error);
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    // Get userId from cookies
    const userId = await getUserIdFromCookies();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { oldPassword, newPassword } = await req.json();

    if (!oldPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Old password and new password are required' },
        { status: 400 }
      );
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
  } catch (error: unknown) {
    console.error('Password update error:', error);
    return NextResponse.json(
      { error: 'An error occurred while updating the password' },
      { status: 500 }
    );
  }
}
