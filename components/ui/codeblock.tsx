"use client"

import { type FC, memo, useEffect, useState } from "react"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { coldarkCold, coldarkDark } from "react-syntax-highlighter/dist/cjs/styles/prism"

import { useCopyToClipboard } from "@/lib/hooks/use-copy-to-clipboard"
import { IconCheck, IconCopy, IconDownload } from "@/components/ui/icons"
import { Button } from "@/components/ui/button"
import { useTheme } from "next-themes"
import { DeployContractButton } from "../deploy-contract-button"
import { useGlobalStore } from "@/app/state/global-store"
import { DeployFrontendButton } from "../deploy-frontend-button"

interface Props {
  language: string
  value: string
}

interface languageMap {
  [key: string]: string | undefined
}

export const programmingLanguages: languageMap = {
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
  solidity: ".sol"
  // add more file extensions here, make sure the key is same as language prop in CodeBlock.tsx component
}

export const generateRandomString = (length: number, lowercase = false) => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXY3456789" // excluding similar looking characters like Z, 2, I, 1, O, 0
  let result = ""
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return lowercase ? result.toLowerCase() : result
}

const CodeBlock: FC<Props> = memo(({ language, value }) => {
  const { resolvedTheme } = useTheme()
  const [isDark, setIsDark] = useState(resolvedTheme === "dark")
  const { isCopied, copyToClipboard } = useCopyToClipboard({ timeout: 2000 })
  const { isGenerating } = useGlobalStore()

  useEffect(() => {
    setIsDark(resolvedTheme === "dark")
  }, [resolvedTheme])

  const downloadAsFile = () => {
    if (typeof window === "undefined") {
      return
    }
    const fileExtension = programmingLanguages[language] || ".file"
    const suggestedFileName = `W3GPT${generateRandomString(3, false)}${fileExtension}`
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
    <div className={`codeblock relative w-full ${isDark ? "bg-zinc-950" : "bg-gray-200"} font-sans`}>
      <div
        className={`flex w-full items-center justify-between ${
          isDark ? "bg-zinc-800 text-zinc-100" : "bg-gray-300 text-gray-950"
        } px-6 py-3 pr-4`}
      >
        <span className="text-xs lowercase">{language}</span>
        <div className="flex items-center space-x-1">
          {language === "solidity" && <DeployContractButton sourceCode={value} />}
          {language === "html" && <DeployFrontendButton sourceCode={value} />}
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
        style={isDark ? coldarkDark : coldarkCold}
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
