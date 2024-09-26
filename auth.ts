import NextAuth, { type DefaultSession } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GitHub from "next-auth/providers/github"

import { storeUser } from "@/lib/data/kv"
import { createSiweMessage } from "viem/siwe"

declare module "next-auth" {
  interface User {
    id: string
    address: string
  }

  interface Session extends DefaultSession {
    user: {
      id: string
      address: string
    } & DefaultSession["user"]
  }
}

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut
} = NextAuth({
  providers: [
    GitHub,
    CredentialsProvider({
      name: "Ethereum",
      credentials: {
        message: {
          label: "Message",
          type: "text",
          placeholder: "0x0"
        },
        signature: {
          label: "Signature",
          type: "text",
          placeholder: "0x0"
        }
      }
      // async authorize(credentials) {
      //   try {
      //     const siwe = createSiweMessage(JSON.parse(credentials?.message || "{}"))
      //     const nextAuthUrl = new URL(process.env.AUTH_URL)

      //     const result = await siwe.verify({
      //       signature: credentials?.signature || "",
      //       domain: nextAuthUrl.host,
      //       nonce: await getCsrfToken({ req })
      //     })

      //     if (result.success) {
      //       return {
      //         id: siwe.address
      //       }
      //     }
      //     return null
      //   } catch (e) {
      //     return null
      //   }
      // }
    })
  ],
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

    session({ session, token, user }) {
      if (token?.id) {
        session.user.id = String(token.id)
      }
      return {
        ...session,
        user: {
          ...session.user,
          id: String(token.id),
          address: user.address
        }
      }
    }
  },
  pages: {
    signIn: "/sign-in"
  }
})
