// lib/auth-client.ts
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  // The base URL of the server (optional if you're using the same domain)
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:3000",
  debug: true, // Enable debug logging
  // Add request and response interceptors for debugging
  fetch: {
    onRequest: (req: Request) => {
      console.log('Client request:', {
        url: req.url,
        method: req.method,
        headers: Object.fromEntries(req.headers.entries())
      });
      return req;
    },
    onResponse: (res: Response) => {
      console.log('Client response:', {
        status: res.status,
        statusText: res.statusText,
        headers: Object.fromEntries(res.headers.entries())
      });
      return res;
    }
  }
});

// Export the client methods for convenience
export const { signIn, signUp, signOut, useSession, getSession } = authClient;
