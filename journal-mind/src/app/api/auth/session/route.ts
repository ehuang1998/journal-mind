import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import { verify, JwtPayload } from 'jsonwebtoken';
import { cookies } from 'next/headers';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
});

// Get secret from environment
const secret = process.env.BETTER_AUTH_SECRET || 'supersecret';

// Define interface for expected token payload
interface DecodedToken extends JwtPayload {
  userId?: string;
}

export async function GET(_req: NextRequest) {
  try {
    // Get the auth token from cookies
    const cookieStore = await cookies();
    const authToken = cookieStore.get('auth_token')?.value;
    
    if (!authToken) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    // Verify and decode the JWT
    let decodedToken: DecodedToken;
    try {
      // Use the defined interface
      decodedToken = verify(authToken, secret) as DecodedToken;
    } catch (error) {
      console.error('Invalid token:', error);
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }
    
    // Get session and user information
    const { userId } = decodedToken;
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Invalid session data' },
        { status: 401 }
      );
    }
    
    // Get user from database - include the image field
    const userResult = await pool.query(
      'SELECT id, email, name, image, "createdAt" FROM "user" WHERE id = $1',
      [userId]
    );
    
    if (userResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 401 }
      );
    }
    
    const user = userResult.rows[0];
    
    // Return user info, including the image URL
    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
        createdAt: user.createdAt,
      }
    });
    
  } catch (error: unknown) {
    console.error('Session error:', error);
    let errorMessage = 'Failed to get session';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
} 