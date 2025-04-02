// app/api/auth/[...all]/route.ts
import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";
import { NextRequest } from 'next/server';

// Create the handler with improved error handling
const handler = toNextJsHandler(auth);

// Export the handler functions with additional debugging
export async function POST(req: NextRequest) {
  console.log('Received POST request to:', req.url);
  try {
    return await handler.POST(req);
  } catch (error: any) {
    console.error('POST request error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: error.message || 'Unknown error',
        stack: error.stack 
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export async function GET(req: NextRequest) {
  console.log('Received GET request to:', req.url);
  try {
    return await handler.GET(req);
  } catch (error: any) {
    console.error('GET request error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: error.message || 'Unknown error',
        stack: error.stack
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
