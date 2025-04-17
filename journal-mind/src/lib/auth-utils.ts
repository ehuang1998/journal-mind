import jwt from 'jsonwebtoken';

// Helper function to extract user ID from JWT token
export async function getUserIdFromToken(request: Request): Promise<string | null> {
  try {
    // Get the token from the cookie
    const cookieHeader = request.headers.get('cookie');
    if (!cookieHeader) return null;
    
    // Parse cookies
    const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=');
      acc[key] = value;
      return acc;
    }, {} as Record<string, string>);
    
    // Get the session token
    const token = cookies.token || cookies.session;
    if (!token) return null;
    
    // Verify the token
    const decoded = jwt.verify(token, process.env.BETTER_AUTH_SECRET!) as { sub: string };
    return decoded.sub;
  } catch (error) {
    console.error('Error extracting user ID from token:', error);
    return null;
  }
} 