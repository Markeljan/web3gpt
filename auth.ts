import NextAuth, { type DefaultSession } from "next-auth"
import GitHub from "next-auth/providers/github"

import { storeUser } from "@/lib/data/kv"

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string
    } & DefaultSession["user"]
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [GitHub],
  callbacks: {
    async jwt({ token, profile }) {
      if (profile?.id) {
        const profileId = String(profile.id)
        token.id = profileId
        const user = {
          ...token,
          ...profile,
          id: profileId,
        }
        await storeUser(user)
      }
      return token
    },

    session({ session, token }) {
      if (token?.id) {
        session.user.id = String(token.id)
      }
      return {
        ...session,
        user: {
          ...session.user,
          id: String(token.id),
        },
      }
    },
  },
  pages: {
    signIn: "/sign-in",
  },
})
