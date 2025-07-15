"use client"

import { signIn } from "next-auth/react"
import { useState } from "react"

import { Button, type ButtonProps } from "@/components/ui/button"
import { IconGitHub, IconSpinner } from "@/components/ui/icons"
import { cn } from "@/lib/utils"

interface LoginButtonProps extends ButtonProps {
  showGithubIcon?: boolean
  text?: string
}

export function LoginButton({
  text = "Login with GitHub",
  showGithubIcon = true,
  className,
  ...props
}: LoginButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  return (
    <Button
      variant="outline"
      onClick={() => {
        setIsLoading(true)
        signIn("github")
      }}
      disabled={isLoading}
      className={cn(className)}
      {...props}
    >
      {showGithubIcon && (isLoading ? <IconSpinner className="mr-2 animate-spin" /> : <IconGitHub className="mr-2" />)}
      {!showGithubIcon && isLoading ? <IconSpinner className="mr-1 animate-spin" /> : text}
    </Button>
  )
}
