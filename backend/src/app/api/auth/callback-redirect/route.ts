import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { authOptions } from '../[...nextauth]/route'

const getFrontendUrl = () => {
  const url = process.env.FRONTEND_URL || 'http://localhost:5173'
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  return `https://${url}`
}

export async function GET() {
  const frontendUrl = getFrontendUrl()

  try {
    const session = await getServerSession(authOptions)

    if (session?.user?.email) {
      const userData = Buffer.from(JSON.stringify({
        id: (session.user as { id?: string }).id || session.user.email,
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
        provider: (session as { provider?: string }).provider || 'unknown',
      })).toString('base64url')

      return NextResponse.redirect(`${frontendUrl}?auth=${userData}`)
    }
  } catch (error) {
    console.error('Callback redirect error:', error)
  }

  return NextResponse.redirect(`${frontendUrl}/login`)
}
