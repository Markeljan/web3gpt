"use client"

import { type FC, memo, useEffect, useState } from "react"

import { useTheme } from "next-themes"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { coldarkCold, coldarkDark } from "react-syntax-highlighter/dist/cjs/styles/prism"

import { DeployContractButton } from "@/components/deploy-contract-button"
import { Button } from "@/components/ui/button"
import { IconCheck, IconCopy, IconDownload } from "@/components/ui/icons"
import { useCopyToClipboard } from "@/lib/hooks/use-copy-to-clipboard"
import { nanoid } from "@/lib/utils"

type CodeBlockProps = {
  language: string
  value: string
}

export const PROGRAMMING_LANGUAGES: Record<string, string> = {
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
  clarity: ".clar"
}

const CodeBlock: FC<CodeBlockProps> = memo(({ language, value }) => {
  const { resolvedTheme } = useTheme()
  const [isDarkMode, setIsDarkMode] = useState(resolvedTheme === "dark")
  const { isCopied, copyToClipboard } = useCopyToClipboard({ timeout: 2000 })

  useEffect(() => {
    setIsDarkMode(resolvedTheme === "dark")
  }, [resolvedTheme])

  const downloadAsFile = () => {
    if (typeof window === "undefined") {
      return
    }
    const fileExtension = PROGRAMMING_LANGUAGES[language] || ".file"
    const suggestedFileName = `W3GPT-${nanoid(6)}${fileExtension}`
    const fileName = window.prompt("Enter file name" || "", suggestedFileName)

    if (!fileName) {
      // User pressed cancel on prompt.
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
  }

  const onCopy = () => {
    if (isCopied) return
    copyToClipboard(value)
  }

  return (
    <div className="codeblock relative w-full font-sans dark:bg-zinc-950 bg-gray-200">
      <div
        className={`flex w-full items-center justify-between ${
          isDarkMode ? "bg-zinc-800 text-zinc-100" : "bg-gray-300 text-gray-950"
        } px-6 py-3 pr-4`}
      >
        <span className="text-xs lowercase">{language}</span>
        <div className="flex items-center space-x-1">
          {language === "solidity" && <DeployContractButton getSourceCode={() => value} />}
          <Button
            variant="ghost"
            className="focus-visible:ring-1 focus-visible:ring-gray-700 focus-visible:ring-offset-0"
            onClick={downloadAsFile}
            size="icon"
          >
            <IconDownload />
            <span className="sr-only">Download</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-xs focus-visible:ring-1 focus-visible:ring-gray-700 focus-visible:ring-offset-0"
            onClick={onCopy}
          >
            {isCopied ? <IconCheck /> : <IconCopy />}
            <span className="sr-only">Copy code</span>
          </Button>
        </div>
      </div>
      <SyntaxHighlighter
        language={language}
        style={isDarkMode ? coldarkDark : coldarkCold}
        PreTag="div"
        showLineNumbers
        customStyle={{
          margin: 0,
          width: "100%",
          background: "transparent",
          padding: "1.5rem 1rem"
        }}
        codeTagProps={{
          style: {
            fontSize: "0.9rem",
            fontFamily: "var(--font-mono)"
          }
        }}
      >
        {value}
      </SyntaxHighlighter>
    </div>
  )
})
CodeBlock.displayName = "CodeBlock"

export { CodeBlock }
