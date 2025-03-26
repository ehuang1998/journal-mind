// src/app/page.tsx

import { redirect } from 'next/navigation'
// import { getServerSession } from 'next-auth'
// import { authOptions } from './api/auth/[...betterAuth]/route'

export default async function Home() {

    redirect('/auth/login')
  

  // This fallback will never be seen due to redirect
  return null
}
