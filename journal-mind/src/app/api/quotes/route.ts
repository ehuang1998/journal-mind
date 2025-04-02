import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch('https://zenquotes.io/api/today');
    const data = await response.json();
    
    // Check if the response contains the rate limit message
    if (Array.isArray(data) && data[0]?.q?.includes("Too many requests")) {
      // Return fallback quote when rate limited
      return NextResponse.json([{
        q: "Write it on your heart that every day is the best day in the year.",
        a: "Ralph Waldo Emerson"
      }]);
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching quote:', error);
    
    // Return fallback quote for any other errors
    return NextResponse.json([{
      q: "Write it on your heart that every day is the best day in the year.",
      a: "Ralph Waldo Emerson"
    }]);
  }
}