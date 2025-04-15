// src/app/page.tsx

import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { verify } from 'jsonwebtoken'

// Get secret from environment (make sure it's available server-side)
const secret = process.env.BETTER_AUTH_SECRET || 'supersecret'

export default async function Home() {
  const cookieStore = await cookies()
  const authToken = cookieStore.get('auth_token')?.value

  let isAuthenticated = false

  if (authToken) {
    try {
      // Verify the token
      verify(authToken, secret)
      isAuthenticated = true
    } catch (error) {
      // Token is invalid or expired
      console.log('Auth token verification failed:', error)
      // Clear the invalid cookie (optional but recommended)
      // Note: Modifying cookies in a Server Component might have limitations
      // It's often better handled in middleware or API routes
      // cookieStore.delete('auth_token')
      isAuthenticated = false
    }
  }

  if (isAuthenticated) {
    redirect('/dashboard')
  } else {
    redirect('/auth/login')
  }

  // This return is technically unreachable due to redirects
  // but necessary for function signature.
  return null
}
