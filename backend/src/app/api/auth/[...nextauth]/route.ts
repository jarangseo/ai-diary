import NextAuth, { type NextAuthOptions } from 'next-auth'
import type { JWT } from 'next-auth/jwt'
import GoogleProvider from 'next-auth/providers/google'
import GitHubProvider from 'next-auth/providers/github'

interface ExtendedToken extends JWT {
  accessToken?: string
  provider?: string
  id?: string
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID || '',
      clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account) {
        token.accessToken = account.access_token
        token.provider = account.provider
        token.id = (profile as { sub?: string; id?: string })?.sub ||
                   (profile as { sub?: string; id?: string })?.id ||
                   token.sub
      }
      return token
    },
    async session({ session, token }) {
      const extendedToken = token as ExtendedToken
      return {
        ...session,
        accessToken: extendedToken.accessToken,
        provider: extendedToken.provider,
        user: {
          ...session.user,
          id: extendedToken.id || extendedToken.sub,
        } as { id?: string; name?: string | null; email?: string | null; image?: string | null },
      }
    },
    async redirect({ url }) {
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173'
      if (url.startsWith(frontendUrl)) {
        return url
      }
      if (url.startsWith('/')) {
        return `${frontendUrl}${url}`
      }
      return frontendUrl
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
