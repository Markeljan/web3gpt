export default async function handleImports(sourceCode: string, sourcePath?: string) {
    const sources: { [fileName: string]: { content: any; }; } = {};
    const importRegex = /import\s+["']([^"']+)["'];/g;
    const matches = Array.from(sourceCode.matchAll(importRegex));
    for (const match of matches) {
        const importPath = match[1]
        const { sources: importedSources, sourceCode: mainSourceCode } = await fetchImport(importPath, sourcePath);

        // Merge the imported sources into the main sources object
        Object.assign(sources, importedSources);

        let sourceFileName = importPath.split("/").pop() || importPath;
        sources[sourceFileName] = {
            content: mainSourceCode,
        };
        sourceCode = sourceCode.replace(match[0], `import "${sourceFileName}";`);
    }
    return { sources, sourceCode };
}


async function fetchImport(importPath: string, sourcePath?: string) {
    console.log("Figuring out how to fetch import:", importPath)
    // Determine the URL to fetch
    let urlToFetch;
    if (importPath[0] === '.' && sourcePath) {
        // If the import path starts with '.', it's a relative path, so remove the last path component from the source path and append the import path
        console.log("Import case 1");
        urlToFetch = `${sourcePath.split('/').slice(0, -1).join('/')}/${importPath}`;
    } else if (importPath[0] !== '@') {
        // If the import path starts with anything other than '@', use it directly
        console.log("Import case 2");
        urlToFetch = importPath;
    } else {
        // Otherwise, convert the import path to an unpkg URL
        console.log("Import case 3");
        urlToFetch = `https://unpkg.com/${importPath}`;
    }
    // Convert GitHub URLs to raw content URLs
    if (urlToFetch.includes('github.com')) {
        urlToFetch = urlToFetch.replace('github.com', 'raw.githubusercontent.com').replace('/blob/', '/');
    }


    // Fetch the imported file
    console.log("Fetching import:", urlToFetch)
    const response = await fetch(urlToFetch);

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    let importedSource = await response.text();

    // Handle any imports within the fetched source code
    const { sources, sourceCode } = await handleImports(importedSource, urlToFetch);

    return { sources, sourceCode };
}
