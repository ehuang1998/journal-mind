import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verify, JwtPayload } from 'jsonwebtoken';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
});

// Get secret from environment
const secret = process.env.BETTER_AUTH_SECRET || 'supersecret';

// Define interface for expected token payload
interface DecodedToken extends JwtPayload {
  sessionId?: string;
}

export async function POST(_req: NextRequest) {
  try {
    // Get the auth token from cookies
    const cookieStore = await cookies();
    const authToken = cookieStore.get('auth_token')?.value;
    
    if (authToken) {
      // Try to decode the token to get sessionId
      try {
        // Use the defined interface for the decoded token type
        const decodedToken = verify(authToken, secret) as DecodedToken;
        
        if (decodedToken?.sessionId) {
          // Remove session from database
          await pool.query(
            'DELETE FROM "session" WHERE id = $1',
            [decodedToken.sessionId]
          );
        }
      } catch (error: unknown) {
        // Token might be invalid, just continue to delete the cookie
        console.error('Error decoding token during logout:', error);
      }
    }
    
    // Clear the auth cookie
    cookieStore.delete('auth_token');
    
    return NextResponse.json({ message: 'Logged out successfully' });
  } catch (error: unknown) {
    console.error('Logout error:', error);
    let errorMessage = 'Failed to log out';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
} 