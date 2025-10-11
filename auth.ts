import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import GitHub from "next-auth/providers/github"
import { SiweMessage } from "siwe"

import { getUserIdByWallet, storeUser } from "@/lib/data/kv"

function getCsrfTokenFromRequest(request: Request) {
  const cookieHeader = request.headers.get("cookie")
  if (!cookieHeader) return undefined

  const csrfCookie = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith("next-auth.csrf-token="))

  if (!csrfCookie) return undefined

  const [, value] = csrfCookie.split("=")
  return decodeURIComponent(value ?? "").split("|")[0]
}

function resolveDomain(request: Request) {
  const origin = request.headers.get("origin")
  if (origin) {
    return new URL(origin).host
  }

  const forwardedHost = request.headers.get("x-forwarded-host")
  const forwardedProto = request.headers.get("x-forwarded-proto") ?? "https"
  if (forwardedHost) {
    return new URL(`${forwardedProto}://${forwardedHost}`).host
  }

  return new URL(request.url).host
}

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  providers: [
    Credentials({
      name: "Ethereum",
      credentials: {
        message: {
          label: "Message",
          type: "text",
          placeholder: "0x0",
        },
        signature: {
          label: "Signature",
          type: "text",
          placeholder: "0x0",
        },
      },
      async authorize(credentials, request) {
        try {
          const message = credentials?.message
          const signature = credentials?.signature
          const csrfToken = credentials?.csrfToken

          if (!message || typeof message !== "string") {
            return null
          }

          if (!signature || typeof signature !== "string") {
            return null
          }

          const siweMessage = new SiweMessage(JSON.parse(message))
          const nonce =
            typeof csrfToken === "string" && csrfToken.length > 0 ? csrfToken : getCsrfTokenFromRequest(request)
          if (!nonce) {
            return null
          }

          const domain = resolveDomain(request)
          const verification = await siweMessage.verify({
            signature,
            nonce,
            domain,
          })

          if (!verification.success) {
            return null
          }

          const normalizedAddress = siweMessage.address.toLowerCase()
          const linkedUserId = await getUserIdByWallet(normalizedAddress)

          return {
            id: linkedUserId ?? normalizedAddress,
            address: siweMessage.address,
            walletAddress: siweMessage.address,
          }
        } catch (error) {
          console.error("Failed SIWE authorization", error)
          return null
        }
      },
    }),
    GitHub,
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user, account, profile }) {
      if (account?.provider === "credentials" && user) {
        const walletAddress =
          (user as { walletAddress?: string | null; address?: string | null })?.walletAddress ||
          (user as { address?: string | null })?.address ||
          String(user.id)

        token.walletAddress = walletAddress

        if (!token.id) {
          token.id = String(user.id)
        }

        await storeUser({
          id: String(token.id),
          walletAddress,
          githubId: token.githubId ?? null,
        })
      }

      if (account?.provider === "github" && profile) {
        const profileId = String(profile.id)
        const profileData = profile as {
          name?: string | null
          login?: string | null
          email?: string | null
          avatar_url?: string | null
        }

        token.id = profileId
        token.githubId = profileId

        const profileName = profileData.name ?? profileData.login
        if (profileName) {
          token.name = profileName
        }

        if (profileData.email) {
          token.email = profileData.email
        }

        if (profileData.avatar_url) {
          token.picture = profileData.avatar_url
        }

        await storeUser({
          id: profileId,
          name: token.name ?? null,
          email: token.email ?? null,
          image: token.picture ?? null,
          githubId: profileId,
          walletAddress: token.walletAddress ?? null,
        })
      }

      return token
    },

    session({ session, token }) {
      if (!session.user) {
        return session
      }

      if (token?.id) {
        session.user.id = String(token.id)
      }

      session.user.walletAddress = token.walletAddress ?? null
      session.user.githubId = token.githubId ?? null

      if (token?.name && !session.user.name) {
        session.user.name = token.name
      }

      if (token?.email && !session.user.email) {
        session.user.email = token.email
      }

      if (token?.picture && !session.user.image) {
        session.user.image = token.picture
      }

      return session
    },
  },
  pages: {
    signIn: "/sign-in",
  },
})
