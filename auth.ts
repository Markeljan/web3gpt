import NextAuth, { type DefaultSession } from "next-auth"
import GitHub from "next-auth/providers/github"

import { storeUser } from "@/lib/actions/db"

// override type definitions for session
declare module "next-auth" {
  interface Session {
    user: {
      id?: string
    } & DefaultSession["user"]
  }
}

export const {
  handlers: { GET, POST },
  auth
} = NextAuth({
  providers: [GitHub],
  callbacks: {
    async jwt({ token, profile }) {
      if (profile?.id) {
        const profileId = String(profile.id)
        token.id = profileId
        const user = {
          ...token,
          ...profile,
          id: profileId
        }
        await storeUser(user)
      }
      return token
    },

    async session({ session, token }) {
      if (token?.id) {
        session.user.id = String(token.id)
      }
      return session
    }
  },
  pages: {
    signIn: "/sign-in"
  }
})
