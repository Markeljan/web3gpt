// Recursive function to resolve imports in a source code.  Fetches the source code of the imports one by one and returns the final source code with all imports resolved and urls / aliases replaced with relative paths.
export async function resolveImports(sourceCode: string, sourcePath?: string, localSources?: Record<string, string>) {
  const sources: { [fileName: string]: { content: string } } = {}
  const importRegex = /import\s+(?:{[^}]+}\s+from\s+)?["']([^"']+)["'];/g
  const matches = Array.from(sourceCode.matchAll(importRegex))
  let sourceCodeWithImports = sourceCode
  for (const match of matches) {
    const importPath = match[1]
    const { sources: importedSources, sourceCode: mainSourceCode } = await fetchImport(
      importPath,
      sourcePath,
      localSources,
    )

    // Merge the imported sources into the main sources object
    Object.assign(sources, importedSources)

    let sourceFileName = importPath.split("/").pop() || importPath

    // if sources[sourceFileName] already exists and the content is the same, then skip, otherwise change the sourceFileName to keep the folder structure but still be a relative path
    if (sources[sourceFileName] && sources[sourceFileName].content !== mainSourceCode) {
      sourceFileName = importPath.split("/").slice(-2).join("/")
    }

    sources[sourceFileName] = {
      content: mainSourceCode,
    }
    sourceCodeWithImports = sourceCodeWithImports.replace(match[0], `import "${sourceFileName}";`)
  }
  return { sources, sourceCode: sourceCodeWithImports }
}

async function fetchImport(importPath: string, sourcePath?: string, localSources?: Record<string, string>) {
  // Check if the import exists in provided local sources
  if (localSources) {
    let localPath = importPath
    if (importPath[0] === "." && sourcePath) {
      localPath = resolveImportPath(importPath, sourcePath)
    }
    localPath = localPath.replace(/^\.\//, "")
    if (localSources[localPath]) {
      const importedSource = localSources[localPath]
      const { sources, sourceCode } = await resolveImports(importedSource, localPath, localSources)
      return { sources, sourceCode }
    }
  }

  // Determine the URL to fetch
  let urlToFetch: string
  if (importPath[0] === "." && sourcePath) {
    // If the import path starts with '.', it's a relative path, so resolve the path
    const finalPath = resolveImportPath(importPath, sourcePath)
    urlToFetch = finalPath
  } else if (importPath[0] !== "@") {
    // If the import path starts with anything other than '@', use it directly
    urlToFetch = importPath
  } else {
    // Otherwise, convert the import path to an unpkg URL
    urlToFetch = `https://unpkg.com/${importPath}`
  }
  // Convert GitHub URLs to raw content URLs
  if (urlToFetch.includes("github.com")) {
    urlToFetch = urlToFetch.replace("github.com", "raw.githubusercontent.com").replace("/blob/", "/")
  }

  // Fetch the imported file
  const response = await fetch(urlToFetch)

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  const importedSource = await response.text()

  // Handle any imports within the fetched source code
  const { sources, sourceCode } = await resolveImports(importedSource, urlToFetch, localSources)

  return { sources, sourceCode }
}

/// utility function to handle relative paths
function resolveImportPath(importPath: string, sourcePath: string) {
  const importSegments = importPath.split("/")
  const sourceSegments = sourcePath.split("/")

  // Remove the last segment (file name) from the source path
  sourceSegments.pop()

  // Process each segment of the import path
  while (importSegments.length > 0 && importSegments[0] === "..") {
    // Remove one directory level for each '..'
    sourceSegments.pop()
    importSegments.shift()
  }

  // Special handling for './'
  if (importSegments.length > 0 && importSegments[0] === ".") {
    importSegments.shift()
  }

  // Reconstruct the final path
  return sourceSegments.concat(importSegments).join("/")
}

export const getContractFileName = (contractName: string): string => {
  return `${contractName.replace(/[/\\:*?"<>|.\s]+$/g, "_")}.sol`
}

export async function prepareContractSources(
  contractName: string,
  sourceCode: string,
  localSources?: Record<string, string>,
) {
  const fileName = getContractFileName(contractName)

  const handleImportsResult = await resolveImports(sourceCode, fileName, localSources)

  const sources = {
    [fileName]: {
      content: handleImportsResult?.sourceCode,
    },
    ...handleImportsResult?.sources,
  }

  const sourcesKeys = Object.keys(sources)

  for (const sourceKey of sourcesKeys) {
    let sourceCode = sources[sourceKey].content
    const importStatements = sourceCode.match(/import\s+["'][^"']+["'];/g) || []

    for (const importStatement of importStatements) {
      const importPathMatch = importStatement.match(/["']([^"']+)["']/)
      if (!importPathMatch) continue

      const importPath = importPathMatch[1]
      const fileName = importPath.split("/").pop() || importPath
      sourceCode = sourceCode.replace(importStatement, `import "${fileName}";`)
    }

    sources[sourceKey].content = sourceCode
  }

  return sources
}
