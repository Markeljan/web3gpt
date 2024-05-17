import { useEffect, useState } from "react"

import { useSession } from "next-auth/react"

export const useAvatar = () => {
  const [avatar, setAvatar] = useState<string | null | undefined>()
  const session = useSession()

  useEffect(() => {
    const fetchAvatar = async () => {
      setAvatar(session?.data?.user?.image)
    }

    fetchAvatar()
  }, [session])

  return avatar
}
