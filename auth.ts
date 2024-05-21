import GitHub from "next-auth/providers/github"
import NextAuth, { type DefaultSession } from "next-auth"

import { storeUser } from "@/lib/actions/db"

// override type definitions for session
declare module "next-auth" {
  interface Session {
    user: {
      id?: number
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
        token.id = profile.id
        const user = {
          ...token,
          ...profile,
          id: Number(profile.id)
        }
        await storeUser(user)
      }
      return token
    },

    async session({ session, token }) {
      if (token?.id) {
        session.user.id = Number(token.id)
      }
      return session
    }
  },
  pages: {
    signIn: "/sign-in"
  }
})
