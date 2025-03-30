// lib/auth.ts
import { betterAuth } from "better-auth";
import { Pool } from "pg";

// Initialize our server-side auth instance
export const auth = betterAuth({
  appName: "Journal App",
  // Use the correct environment variable names
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  secret: process.env.BETTER_AUTH_SECRET!,
  database: new Pool({
    connectionString: process.env.DATABASE_URL!,
  }),
  debug: true, // Enable debug mode for more detailed logs
  emailAndPassword: {
    enabled: true,
    // Add password configuration to specify requirements
    passwordValidation: {
      minLength: 8,
    },
    // Configure sign-up options
    signUp: {
      enabled: true,
      verifyEmail: false, // Don't require email verification for simplicity
    },
    // Add sign-in options for when users successfully register
    signIn: {
      shouldCreateSession: true,
    }
  },
  // For debugging purposes
  onApiRequest: (req: any) => {
    console.log(`API Request: ${req.method} ${req.path}`);
    // For sign-up requests, let's log the body
    if (req.path === '/sign-up/email' && req.method === 'POST') {
      try {
        console.log('Sign-up request body:', req.body);
      } catch (e) {
        console.error('Could not log request body:', e);
      }
    }
  },
  // Log all errors
  onError: (err: any) => {
    console.error('BetterAuth Error:', err);
  },
});
