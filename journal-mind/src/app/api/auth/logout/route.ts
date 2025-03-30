import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
});

// Get secret from environment
const secret = process.env.BETTER_AUTH_SECRET || 'supersecret';

export async function POST(req: NextRequest) {
  try {
    // Get the auth token from cookies
    const cookieStore = await cookies();
    const authToken = cookieStore.get('auth_token')?.value;
    
    if (authToken) {
      // Try to decode the token to get sessionId
      try {
        const decodedToken = verify(authToken, secret) as any;
        
        if (decodedToken?.sessionId) {
          // Remove session from database
          await pool.query(
            'DELETE FROM "session" WHERE id = $1',
            [decodedToken.sessionId]
          );
        }
      } catch (error) {
        // Token might be invalid, just continue to delete the cookie
        console.error('Error decoding token during logout:', error);
      }
    }
    
    // Clear the auth cookie
    cookieStore.delete('auth_token');
    
    return NextResponse.json({ message: 'Logged out successfully' });
  } catch (error: any) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Failed to log out' },
      { status: 500 }
    );
  }
} 