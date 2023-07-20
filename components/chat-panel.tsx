import { Button } from '@/components/ui/button'
import { PromptForm } from '@/components/prompt-form'
import { ButtonScrollToBottom } from '@/components/button-scroll-to-bottom'
import { IconRefresh, IconStop } from '@/components/ui/icons'
import { UseChatHelpers } from "ai/react/dist"
import { functionSchemas } from '@/lib/functions/schemas'
import { useLocalStorage } from '@/lib/hooks/use-local-storage' // assuming the hook is in this file

export interface ChatPanelProps
  extends Pick<
    UseChatHelpers,
    | 'append'
    | 'isLoading'
    | 'reload'
    | 'messages'
    | 'stop'
    | 'input'
    | 'setInput'
  > {
  id?: string
}

export function ChatPanel({
  id,
  isLoading,
  stop,
  append,
  reload,
  input,
  setInput,
  messages
}: ChatPanelProps) {
  // TODO: default to false or remove entirely
  const [isZkMeVerified] = useLocalStorage('isZkMeVerified', true);

  return (
    <div className="fixed inset-x-0 bottom-0 bg-gradient-to-b from-muted/10 from-10% to-muted/30 to-50%">
      <ButtonScrollToBottom />
      <div className="mx-auto sm:max-w-2xl sm:px-4">
      <div className="flex h-10 items-center justify-center pb-5">
          {isLoading ? (
            <Button
              variant="outline"
              onClick={() => stop()}
              className="bg-background"
            >
              <IconStop className="mr-2" />
              Stop generating
            </Button>
          ) : (
            messages?.length > 1 && (
              <Button
                variant="outline"
                onClick={() => reload()}
                className="bg-background"
                disabled={!isZkMeVerified}
              >
                <IconRefresh className="mr-2" />
                Regenerate response
              </Button>
            )
          )}
        </div>
        <div className="space-y-4 border-t bg-background px-4 py-2 shadow-lg sm:rounded-t-xl sm:border md:py-4">
          <PromptForm
            onSubmit={async value => {
              await append({
                id,
                content: value,
                role: 'user'
              },
                { functions: functionSchemas })
            }}
            input={input}
            setInput={setInput}
            isLoading={isLoading}
            disabled={!isZkMeVerified}
          />
        </div>
      </div>
    </div>
  )
}
