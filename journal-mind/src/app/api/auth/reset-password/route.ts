import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import bcrypt from 'bcrypt';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
});

export async function POST(req: NextRequest) {
  try {
    const { email, newPassword } = await req.json();
    
    console.log('Password reset attempt for:', { email });
    
    if (!email || !newPassword) {
      return NextResponse.json(
        { error: 'Email and new password are required' },
        { status: 400 }
      );
    }
    
    // Check if user exists
    const userResult = await pool.query(
      'SELECT * FROM "user" WHERE email = $1',
      [email]
    );
    
    if (userResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    const user = userResult.rows[0];
    console.log('Found user for password reset:', { id: user.id, email: user.email });
    
    // Hash the new password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    
    // Start a transaction
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Update user password
      await client.query(
        'UPDATE "user" SET password = $1, "updatedAt" = $2 WHERE id = $3',
        [hashedPassword, new Date(), user.id]
      );
      
      // Update account password if it exists
      const accountResult = await client.query(
        'SELECT * FROM "account" WHERE "userId" = $1 AND "providerId" = $2',
        [user.id, 'credentials']
      );
      
      if (accountResult.rows.length > 0) {
        await client.query(
          'UPDATE "account" SET password = $1, "updatedAt" = $2 WHERE "userId" = $3 AND "providerId" = $4',
          [hashedPassword, new Date(), user.id, 'credentials']
        );
      } else {
        // Create an account record if it doesn't exist
        const accountId = crypto.randomUUID();
        const now = new Date();
        
        await client.query(
          `INSERT INTO "account" (
            id, 
            "accountId", 
            "providerId", 
            "userId", 
            password, 
            "createdAt", 
            "updatedAt"
          ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            accountId,
            email,
            'credentials',
            user.id,
            hashedPassword,
            now,
            now
          ]
        );
      }
      
      // Invalidate all existing sessions for this user
      await client.query(
        'DELETE FROM "session" WHERE "userId" = $1',
        [user.id]
      );
      
      await client.query('COMMIT');
      
      return NextResponse.json({
        message: 'Password reset successful'
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('Password reset error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to reset password',
        details: error.message
      },
      { status: 500 }
    );
  }
}