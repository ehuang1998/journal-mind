import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { sign } from 'jsonwebtoken';
import { cookies } from 'next/headers';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
});

// Get secret from environment
const secret = process.env.BETTER_AUTH_SECRET || 'supersecret';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    
    console.log('Direct login attempt for:', { email });
    
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }
    
    // First, find the user by email
    const userResult = await pool.query(
      'SELECT * FROM "user" WHERE email = $1',
      [email]
    );
    
    if (userResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }
    
    const user = userResult.rows[0];
    console.log('Found user:', { id: user.id, email: user.email });
    
    // Try to log in with the user password directly first
    // This handles users created with our direct signup
    try {
      // Compare the provided password with the user's stored password hash
      const userPasswordMatches = await bcrypt.compare(password, user.password);
      
      if (userPasswordMatches) {
        console.log('Password matches user record hash');
        
        // Proceed with creating session
        // Generate session token
        const sessionId = randomUUID();
        const token = randomUUID();
        
        // Session expiry (30 days)
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30);
        
        // Get IP and user agent
        const ipAddress = req.headers.get('x-forwarded-for') || '127.0.0.1';
        const userAgent = req.headers.get('user-agent') || 'unknown';
        
        // Current timestamp
        const now = new Date();
        
        // Create session in the database
        await pool.query(
          `INSERT INTO "session" (id, "expiresAt", token, "createdAt", "updatedAt", "ipAddress", "userAgent", "userId") 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [sessionId, expiresAt, token, now, now, ipAddress, userAgent, user.id]
        );
        
        // Create a JWT with the session information
        const jwt = sign(
          { 
            sessionId,
            userId: user.id,
            email: user.email,
          }, 
          secret,
          { expiresIn: '30d' }
        );
        
        // Set cookie with the session token
        const cookieStore = await cookies();
        cookieStore.set('auth_token', jwt, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          expires: expiresAt,
          path: '/',
        });
        
        // Return user info
        return NextResponse.json({
          message: 'Login successful',
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
          }
        });
      }
    } catch (err) {
      console.error('Error comparing password with user hash:', err);
    }
    
    // Check if account exists for this user
    let account;
    const accountResult = await pool.query(
      'SELECT * FROM "account" WHERE "userId" = $1 AND "providerId" = $2',
      [user.id, 'credentials']
    );
    
    if (accountResult.rows.length === 0) {
      console.log('No account record found - creating one with new password hash');
      
      // Create an account record with a fresh hash of the provided password
      const accountId = randomUUID();
      const now = new Date();
      
      // Hash the provided password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      
      await pool.query(
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
          hashedPassword, // Use freshly hashed password
          now,
          now
        ]
      );
      
      console.log('Created account record for existing user with new password hash');
      
      // Fetch the newly created account
      const newAccountResult = await pool.query(
        'SELECT * FROM "account" WHERE id = $1',
        [accountId]
      );
      
      if (newAccountResult.rows.length === 0) {
        return NextResponse.json(
          { error: 'Failed to create account record' },
          { status: 500 }
        );
      }
      
      account = newAccountResult.rows[0];
    } else {
      account = accountResult.rows[0];
      console.log('Found existing account for user');
    }
    
    // Verify password against the account password
    console.log('Comparing provided password with account hash');
    const passwordMatches = await bcrypt.compare(password, account.password);
    
    if (!passwordMatches) {
      console.log('Password does not match account hash');
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }
    
    console.log('Password matches account hash');
    
    // Generate session token
    const sessionId = randomUUID();
    const token = randomUUID();
    
    // Session expiry (30 days)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);
    
    // Get IP and user agent
    const ipAddress = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const userAgent = req.headers.get('user-agent') || 'unknown';
    
    // Current timestamp
    const now = new Date();
    
    // Create session in the database
    await pool.query(
      `INSERT INTO "session" (id, "expiresAt", token, "createdAt", "updatedAt", "ipAddress", "userAgent", "userId") 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [sessionId, expiresAt, token, now, now, ipAddress, userAgent, user.id]
    );
    
    // Create a JWT with the session information
    const jwt = sign(
      { 
        sessionId,
        userId: user.id,
        email: user.email,
      }, 
      secret,
      { expiresIn: '30d' }
    );
    
    // Set cookie with the session token
    const cookieStore = await cookies();
    cookieStore.set('auth_token', jwt, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: expiresAt,
      path: '/',
    });
    
    // Return user info
    return NextResponse.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      }
    });
    
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { 
        error: 'Authentication failed',
        details: error.message,
      },
      { status: 500 }
    );
  }
} 