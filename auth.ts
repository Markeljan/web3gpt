import NextAuth, { type DefaultSession } from 'next-auth'
import GitHub from 'next-auth/providers/github'
import { storeUser } from '@/app/actions'

declare module 'next-auth' {
  interface Session {
    user: {
      /** The user's id. */
      id: string
    } & DefaultSession['user']
  }
}

export const {
  handlers: { GET, POST },
  auth,
  CSRF_experimental
} = NextAuth({
  providers: [GitHub],
  callbacks: {
    async jwt({ token, profile }) {
      if (profile) {
        token.id = profile.id
        token.image = profile.avatar_url || profile.picture
        const user = {
          ...profile,
          id: String(profile.id)
        }
        await storeUser(user)
      }
      return token
    },
    authorized({ auth }) {
      return !!auth?.user
    }
  },
  pages: {
    signIn: '/sign-in'
  }
})
