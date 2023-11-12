export default async function handleImports(sourceCode: string, sourcePath?: string) {
    const sources: { [fileName: string]: { content: any; }; } = {};
    const importRegex = /import\s+(?:{[^}]+}\s+from\s+)?["']([^"']+)["'];/g
    const matches = Array.from(sourceCode.matchAll(importRegex));
    for (const match of matches) {
        const importPath = match[1]
        const { sources: importedSources, sourceCode: mainSourceCode } = await fetchImport(importPath, sourcePath);

        // Merge the imported sources into the main sources object
        Object.assign(sources, importedSources);
       
        let sourceFileName = importPath.split("/").pop() || importPath;


        // if sources[sourceFileName] already exists and the content is the same, then skip, otherwise change the sourceFileName to keep the folder structure but still be a relative path
        if (sources[sourceFileName] && sources[sourceFileName].content !== mainSourceCode) {
            console.log(`sources[${sourceFileName}] already exists but content does not match, saving sourceFileName with relative path`)
            sourceFileName = importPath.split("/").slice(-2).join("/");
        }

        sources[sourceFileName] = {
            content: mainSourceCode,
        };
        sourceCode = sourceCode.replace(match[0], `import "${sourceFileName}";`);
    }
    return { sources, sourceCode };
}

async function fetchImport(importPath: string, sourcePath?: string) {
    console.log("Fetching import: ", importPath)
    // Determine the URL to fetch
    let urlToFetch;
    if (importPath[0] === '.' && sourcePath) {
        // If the import path starts with '.', it's a relative path, so resolve the path
        let finalPath = resolveImportPath(importPath, sourcePath);
        urlToFetch = finalPath
        console.log('urlToFetch using relative path:', urlToFetch)
    } else if (importPath[0] !== '@') {
        // If the import path starts with anything other than '@', use it directly
        urlToFetch = importPath;
        console.log('urlToFetch using actual import:', urlToFetch)
    } else {
        // Otherwise, convert the import path to an unpkg URL
        urlToFetch = `https://unpkg.com/${importPath}`;
        console.log('urlToFetch using unpkg: ', urlToFetch)
    }
    // Convert GitHub URLs to raw content URLs
    if (urlToFetch.includes('github.com')) {
        urlToFetch = urlToFetch.replace('github.com', 'raw.githubusercontent.com').replace('/blob/', '/');
        console.log('using raw.github: ', urlToFetch)
    }


    // Fetch the imported file
    const response = await fetch(urlToFetch);


    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    let importedSource = await response.text();

    // Handle any imports within the fetched source code
    const { sources, sourceCode } = await handleImports(importedSource, urlToFetch);

    return { sources, sourceCode };
}


/// utility function to handle relative paths
function resolveImportPath(importPath: string, sourcePath: string) {
    let importSegments = importPath.split('/');
    let sourceSegments = sourcePath.split('/');

    // Remove the last segment (file name) from the source path
    sourceSegments.pop();

    // Process each segment of the import path
    while (importSegments.length > 0 && importSegments[0] === '..') {
        // Remove one directory level for each '..'
        sourceSegments.pop();
        importSegments.shift();
    }

    // Special handling for './'
    if (importSegments.length > 0 && importSegments[0] === '.') {
        importSegments.shift();
    }

    // Reconstruct the final path
    return sourceSegments.concat(importSegments).join('/');
}
