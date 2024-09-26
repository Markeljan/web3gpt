import { auth } from "@/auth"

const getCurrentUser = async () => {
  const session = await auth()
  const userId = session?.user.id

  return userId || null
}

type ActionWithUser<T, R> = (data: T, userId: string) => Promise<R>

export function withUser<T, R>(action: ActionWithUser<T, R>) {
  return async (data: T): Promise<R | undefined> => {
    const userId = await getCurrentUser()
    if (!userId) return

    return action(data, userId)
  }
}
