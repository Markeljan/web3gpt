"use client"

import { generateId } from "ai"
import { useTheme } from "next-themes"
import { memo, useCallback, useMemo } from "react"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { coldarkCold, coldarkDark } from "react-syntax-highlighter/dist/cjs/styles/prism"

import { DeployContractButton } from "@/components/deploy-contract-button"
import { DeployTokenScriptButton } from "@/components/deploy-tokenscript-button"
import { Button } from "@/components/ui/button"
import { IconCheck, IconCopy, IconDownload } from "@/components/ui/icons"
import { useCopyToClipboard } from "@/lib/hooks/use-copy-to-clipboard"
import { useIsClient } from "@/lib/hooks/use-is-client"

const PROGRAMMING_LANGUAGES: Record<string, string> = {
  javascript: ".js",
  python: ".py",
  java: ".java",
  c: ".c",
  cpp: ".cpp",
  "c++": ".cpp",
  "c#": ".cs",
  ruby: ".rb",
  php: ".php",
  swift: ".swift",
  "objective-c": ".m",
  kotlin: ".kt",
  typescript: ".ts",
  go: ".go",
  perl: ".pl",
  rust: ".rs",
  scala: ".scala",
  haskell: ".hs",
  lua: ".lua",
  shell: ".sh",
  sql: ".sql",
  html: ".html",
  css: ".css",
  solidity: ".sol",
  clarity: ".clar",
  tokenscript: ".xml",
  tokenscripttsml: ".tsml",
}

type CodeBlockProps = {
  language: string
  value: string
}

export const CodeBlock = memo(({ language, value }: CodeBlockProps) => {
  const isClient = useIsClient()
  const { resolvedTheme } = useTheme()
  const { isCopied, copyToClipboard } = useCopyToClipboard({ timeout: 2000 })

  const isDarkMode = isClient ? resolvedTheme === "dark" : true

  const memoizedHighlighter = useMemo(
    () => (
      <SyntaxHighlighter
        codeTagProps={{
          style: {
            fontSize: "0.9rem",
            fontFamily: "var(--font-mono)",
          },
        }}
        customStyle={{
          margin: 0,
          width: "100%",
          background: "transparent",
          padding: "1.5rem 1rem",
        }}
        language={language}
        PreTag="div"
        style={isDarkMode ? coldarkDark : coldarkCold}
      >
        {value}
      </SyntaxHighlighter>
    ),
    [value, language, isDarkMode]
  )

  const downloadAsFile = useCallback(() => {
    if (typeof window === "undefined") {
      return
    }
    const fileExtension = PROGRAMMING_LANGUAGES[language] || ".file"
    const suggestedFileName = `web3gpt-${generateId(6)}${fileExtension}`
    const fileName = window.prompt("Enter file name", suggestedFileName)

    if (!fileName) {
      return
    }

    const blob = new Blob([value], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.download = fileName
    link.href = url
    link.style.display = "none"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }, [value, language])

  const renderDeployButton = useCallback(() => {
    if (language === "solidity") {
      return <DeployContractButton sourceCode={value} />
    }
    if (["tokenscript", "tokenscripttsml", "xml"].includes(language)) {
      return <DeployTokenScriptButton sourceCode={value} />
    }
    return null
  }, [language, value])

  return (
    <div className="relative w-full bg-muted/95 font-sans dark:bg-muted/50">
      <div className="flex w-full items-center justify-between border-b bg-secondary-foreground/40 px-6 py-3 pr-4 dark:bg-secondary-foreground/10">
        <span className="text-xs lowercase dark:text-secondary-foreground">{language}</span>
        <div className="flex items-center space-x-1">
          {renderDeployButton()}
          <Button
            className="focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-0"
            onClick={downloadAsFile}
            size="icon"
            variant="ghost"
          >
            <IconDownload />
            <span className="sr-only">Download</span>
          </Button>
          <Button
            className="text-xs focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-0"
            onClick={() => copyToClipboard(value)}
            size="icon"
            variant="ghost"
          >
            {isCopied ? <IconCheck /> : <IconCopy />}
            <span className="sr-only">Copy code</span>
          </Button>
        </div>
      </div>
      {memoizedHighlighter}
    </div>
  )
})
