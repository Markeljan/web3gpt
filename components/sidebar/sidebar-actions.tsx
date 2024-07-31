"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useCallback, useState, useTransition } from "react"

import { toast } from "sonner"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog"
import { badgeVariants } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import { IconShare, IconSpinner, IconTrash, IconUsers } from "@/components/ui/icons"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { APP_URL } from "@/lib/config"
import type { DbChatListItem, ServerActionResult } from "@/lib/types"
import { cn, formatDate } from "@/lib/utils"

interface SidebarActionsProps {
  chat: DbChatListItem
  deleteChat: (args: { id: string; path: string }) => ServerActionResult<void>
  shareChat: (chat: DbChatListItem) => ServerActionResult<DbChatListItem>
}

export function SidebarActions({ chat, deleteChat, shareChat }: SidebarActionsProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [shareDialogOpen, setShareDialogOpen] = useState(false)
  const [isRemovePending, startRemoveTransition] = useTransition()
  const [isSharePending, startShareTransition] = useTransition()
  const router = useRouter()
  const fullShareUrl = `${APP_URL}/share/${chat.id}`

  const copyShareLink = useCallback(() => {
    navigator.clipboard.writeText(fullShareUrl)
    setShareDialogOpen(false)
    toast.success("Share link copied to clipboard", {
      style: {
        borderRadius: "10px",
        background: "#333",
        color: "#fff",
        fontSize: "14px"
      },
      icon: "📋"
    })
  }, [fullShareUrl])

  return (
    <>
      <div className="space-x-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" className="size-6 p-0 hover:bg-background" onClick={() => setShareDialogOpen(true)}>
              <IconShare />
              <span className="sr-only">Share</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Share chat</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              className="size-6 p-0 hover:bg-background"
              disabled={isRemovePending}
              onClick={() => setDeleteDialogOpen(true)}
            >
              <IconTrash />
              <span className="sr-only">Delete</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Delete chat</TooltipContent>
        </Tooltip>
      </div>
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share link to chat</DialogTitle>
            <DialogDescription>Anyone with the URL will be able to view the shared chat.</DialogDescription>
          </DialogHeader>
          <div className="space-y-1 rounded-md border p-4 text-sm">
            <div className="font-medium">{chat.title}</div>
            <div className="text-muted-foreground">{formatDate(chat.createdAt)}</div>
          </div>
          <DialogFooter className="items-center">
            {chat.published && (
              <Link
                href={`/share/${chat.id}`}
                className={cn(badgeVariants({ variant: "secondary" }), "mr-auto")}
                target="_blank"
                rel="noopener noreferrer"
              >
                <IconUsers className="mr-2" />
                {`/share/${chat.id}`}
              </Link>
            )}
            <Button
              disabled={isSharePending}
              onClick={() => {
                startShareTransition(async () => {
                  if (chat.published) {
                    await new Promise((resolve) => setTimeout(resolve, 500))
                    copyShareLink()
                    return
                  }

                  const result = await shareChat(chat)

                  if ("error" in result) {
                    toast.error(result.error)
                    return
                  }

                  copyShareLink()
                })
              }}
            >
              {isSharePending ? (
                <>
                  <IconSpinner className="mr-2 animate-spin" />
                  Copying...
                </>
              ) : (
                <>Copy link</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete your chat message and remove your data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRemovePending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={isRemovePending}
              onClick={(event) => {
                event.preventDefault()
                startRemoveTransition(async () => {
                  const result = await deleteChat({
                    id: chat.id,
                    path: `chat/${chat.id}`
                  })

                  if (result && "error" in result) {
                    toast.error(result.error)
                    return
                  }

                  setDeleteDialogOpen(false)
                  router.refresh()
                  router.push("/")
                  toast.success("Chat deleted")
                })
              }}
            >
              {isRemovePending && <IconSpinner className="mr-2 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
