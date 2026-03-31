const LANGUAGE_ALIASES: Record<string, string> = {
  bash: "shell",
  js: "javascript",
  jsx: "javascript",
  sh: "shell",
  sol: "solidity",
  ts: "typescript",
  tsx: "typescript",
  zsh: "shell",
}

const SOLIDITY_CODE_REGEX =
  /(?:pragma\s+solidity\b|SPDX-License-Identifier:|(?:contract|interface|library|abstract\s+contract)\s+[A-Za-z_]\w*|import\s+["']@openzeppelin\/)/m

export const normalizeCodeLanguage = (language?: string | null, value?: string) => {
  const normalizedLanguage = language?.trim().toLowerCase()

  if (normalizedLanguage) {
    return LANGUAGE_ALIASES[normalizedLanguage] ?? normalizedLanguage
  }

  if (value && SOLIDITY_CODE_REGEX.test(value)) {
    return "solidity"
  }

  return ""
}
