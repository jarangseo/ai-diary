import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { authOptions } from '../[...nextauth]/route'

// Ensure origin has protocol
const getOrigin = () => {
  const url = process.env.FRONTEND_URL || 'http://localhost:5173'
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }
  return `https://${url}`
}

const corsHeaders = {
  'Access-Control-Allow-Origin': getOrigin(),
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, Cookie',
  'Access-Control-Allow-Credentials': 'true',
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders })
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    return NextResponse.json(session || {}, { headers: corsHeaders })
  } catch (error) {
    console.error('Session error:', error)
    return NextResponse.json({}, { headers: corsHeaders })
  }
}
