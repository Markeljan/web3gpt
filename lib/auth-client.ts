import { createAuthClient } from "better-auth/react"

export const authClient = createAuthClient()

export const { signIn, signOut, useSession } = authClient

export type AuthUser = typeof authClient.$Infer.Session.user
