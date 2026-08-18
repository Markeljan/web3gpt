import "server-only"
import { betterAuth } from "better-auth"
import { nextCookies } from "better-auth/next-js"
import { oAuthProxy } from "better-auth/plugins"
import { headers } from "next/headers"
import { APP_URL, PRODUCTION_URL } from "@/lib/config"
import { storeUser } from "@/lib/data/kv"

const THIRTY_DAYS_IN_SECONDS = 60 * 60 * 24 * 30
const ONE_DAY_IN_SECONDS = 60 * 60 * 24

export const auth = betterAuth({
  appName: "Web3GPT",
  baseURL: APP_URL,
  secret: process.env.BETTER_AUTH_SECRET || process.env.AUTH_SECRET,
  // No database: sessions are signed/encrypted into the cookie, matching the
  // JWT strategy this app used under next-auth. User records live in KV.
  session: {
    expiresIn: THIRTY_DAYS_IN_SECONDS,
    updateAge: ONE_DAY_IN_SECONDS,
  },
  user: {
    additionalFields: {
      githubId: {
        type: "string",
        required: false,
        input: true,
      },
    },
  },
  socialProviders: {
    github: {
      clientId: process.env.BETTER_AUTH_GITHUB_ID || process.env.AUTH_GITHUB_ID || "",
      clientSecret: process.env.BETTER_AUTH_GITHUB_SECRET || process.env.AUTH_GITHUB_SECRET || "",
      mapProfileToUser: (profile) => ({
        githubId: String(profile.id),
        // GitHub omits the email when the user keeps it private and the
        // /user/emails lookup finds nothing public.
        email: profile.email || `${profile.id}+${profile.login}@users.noreply.github.com`,
      }),
    },
  },
  databaseHooks: {
    user: {
      create: {
        // Every KV key in this app is scoped by the GitHub numeric id that
        // next-auth used as `session.user.id`. Pinning the id here keeps
        // existing chats, agents and deployments attached to their owners.
        before: (user) => {
          const githubId = typeof user.githubId === "string" ? user.githubId : null
          if (!githubId) {
            return Promise.resolve()
          }
          return Promise.resolve({ data: { ...user, id: githubId } })
        },
        after: async (user) => {
          await storeUser({
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image ?? null,
          })
        },
      },
    },
  },
  // Bounces the OAuth callback through the production origin whenever the app is
  // not served from there, replacing next-auth's AUTH_REDIRECT_PROXY_URL. Inert
  // in production, where baseURL and productionURL are the same origin.
  plugins: [oAuthProxy({ productionURL: PRODUCTION_URL }), nextCookies()],
})

export async function getSession() {
  return await auth.api.getSession({ headers: await headers() })
}
