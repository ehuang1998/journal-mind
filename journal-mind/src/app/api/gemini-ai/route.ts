import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

/**
 * API route for generating content using Gemini AI model.
 */
export async function POST(request: Request): Promise<Response> {
  try {
    // Parse the request body
    const { content, emotion } = await request.json();
    
    if (!content || !emotion) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Generate a prompt for the AI
    const prompt = `
      Analyze the following journal entry and provide a brief recommendation (max 50 words) to help the person improve their mental wellbeing. 
      The journal entry has an associated mood: ${emotion}.
      Be supportive, specific, and action-oriented in your recommendation.
      
      Journal entry: ${content}
    `;

    // Call the Gemini API
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-001' });
    const result = await model.generateContent(prompt);
    const response = result.response;
    const recommendation = response.text().trim();
    
    // Ensure the response is not too long (40 words max)
    const words = recommendation.split(/\s+/);
    const truncatedRecommendation = words.length > 40 
      ? words.slice(0, 40).join(' ') + '...'
      : recommendation;

    return NextResponse.json({ recommendation: truncatedRecommendation });
  } catch (error) {
    console.error('Error generating AI recommendation:', error);
    return NextResponse.json(
      { error: 'Failed to generate recommendation' },
      { status: 500 }
    );
  }
}