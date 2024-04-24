import NextAuth, { type DefaultSession } from "next-auth"
import GitHub from "next-auth/providers/github"
import { storeUser } from "@/app/actions"

// override type definitions for session
declare module "next-auth" {
  interface Session {
    user: {
      id?: string | null | undefined
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
        token.id = String(profile.id)
        const user = {
          ...token,
          ...profile,
          id: String(profile.id)
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

    // uncomment to require authentication
    // authorized({ auth }) {
    //   return !!auth?.user
    // }
  },
  pages: {
    signIn: "/sign-in"
  }
})
