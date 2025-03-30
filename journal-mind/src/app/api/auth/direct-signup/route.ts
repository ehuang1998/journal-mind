import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import { randomUUID } from 'crypto';
import bcrypt from 'bcrypt';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
});

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();
    
    console.log('Direct signup attempt for:', { name, email, passwordLength: password?.length });
    
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }
    
    // Check if user already exists
    const checkUserResult = await pool.query(
      'SELECT * FROM "user" WHERE email = $1',
      [email]
    );
    
    if (checkUserResult.rows.length > 0) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }
    
    // Start a transaction
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Hash the password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      
      // Generate UUIDs
      const userId = randomUUID();
      const accountId = randomUUID();
      
      // Current timestamp
      const now = new Date();
      
      // Insert the user
      const insertUserResult = await client.query(
        `INSERT INTO "user" (id, email, password, name, "createdAt", "emailVerified", "updatedAt") 
         VALUES ($1, $2, $3, $4, $5, $6, $7) 
         RETURNING id, email, name, "createdAt"`,
        [userId, email, hashedPassword, name, now, false, now]
      );
      
      console.log('User created:', insertUserResult.rows[0]);
      
      // Now create the account record for email authentication
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
          email,           // accountId is the email for email auth
          'credentials',   // providerId for email/password authentication
          userId,          // link to the user
          hashedPassword,  // store the password hash
          now,             // createdAt
          now              // updatedAt
        ]
      );
      
      console.log('Account record created for email authentication');
      
      // Commit the transaction
      await client.query('COMMIT');
      
      return NextResponse.json({
        message: 'User created successfully',
        user: {
          id: insertUserResult.rows[0].id,
          email: insertUserResult.rows[0].email,
          name: insertUserResult.rows[0].name,
          createdAt: insertUserResult.rows[0].createdAt,
        }
      });
    } catch (error) {
      // If anything goes wrong, roll back the transaction
      await client.query('ROLLBACK');
      throw error;
    } finally {
      // Release the client back to the pool
      client.release();
    }
  } catch (error: any) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create user',
        details: error.message,
        stack: error.stack
      },
      { status: 500 }
    );
  }
} 