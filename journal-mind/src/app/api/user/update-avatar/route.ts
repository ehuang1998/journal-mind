import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verify } from 'jsonwebtoken';
import { cookies } from 'next/headers';
import supabase from '@/lib/supabase';

// Get secret from environment
const secret = process.env.BETTER_AUTH_SECRET || 'supersecret';

// Bucket name for avatar storage
const BUCKET_NAME = 'avatars';

// Function to get user ID from auth token in cookies
async function getUserIdFromCookies(): Promise<string | null> {
  try {
    // Get the auth token from cookies
    const cookieStore = await cookies();
    const authToken = cookieStore.get('auth_token')?.value;
    
    if (!authToken) {
      return null;
    }
    
    // Verify and decode the JWT
    const decoded = verify(authToken, secret) as { userId: string };
    return decoded.userId;
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    // Get userId from cookies
    const userId = await getUserIdFromCookies();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the form data
    const formData = await req.formData();
    const file = formData.get('avatar') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'File must be an image' }, { status: 400 });
    }

    // Limit file size to 5MB
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size must be less than 5MB' }, { status: 400 });
    }

    // Convert the file to a Buffer
    const buffer = await file.arrayBuffer();
    
    // Upload to Supabase Storage
    const fileName = `avatar-${userId}-${Date.now()}`;
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: true
      });

    if (error) {
      console.error('Supabase storage error:', error);
      return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 });
    }

    // Get the public URL for the uploaded image
    const publicUrlResult = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(fileName);
    
    const publicUrl = publicUrlResult.data.publicUrl;

    // Update the user's image field in the database
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { image: publicUrl }
    });

    return NextResponse.json({
      message: 'Avatar updated successfully',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        image: updatedUser.image
      }
    });
  } catch (error: unknown) {
    console.error('Avatar update error:', error);
    let errorMessage = 'An error occurred while updating your avatar';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
} 