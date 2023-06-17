import parser from 'solidity-parser-diligence';

class Graph {
    adjacencyList: { [node: string]: string[] } = {};
  
    addNode(node: string) {
      if (!this.adjacencyList[node]) this.adjacencyList[node] = [];
    }
  
    addEdge(node1: string, node2: string) {
      this.addNode(node1);
      this.addNode(node2);
      this.adjacencyList[node1].push(node2);
    }
  
    topologicalSortUtil(node: string, visited: { [node: string]: boolean }, stack: string[]): void {
      visited[node] = true;
      this.adjacencyList[node].forEach((n) => {
        if (!visited[n]) this.topologicalSortUtil(n, visited, stack);
      });
      stack.push(node); // Change unshift to push
    }
  
    topologicalSort(): string[] {
      const visited: { [node: string]: boolean } = {};
      const stack: string[] = [];
  
      Object.keys(this.adjacencyList).forEach((node) => {
        if (!visited[node]) this.topologicalSortUtil(node, visited, stack);
      });
  
      return stack.reverse(); // Reverse the stack to get the correct order
    }
  }
  
  function getDependencies(sourceCode: string): { [contractName: string]: string[] } {
    const dependencies: { [contractName: string]: string[] } = {};

    console.log('Parsing the source code...');
    let ast;
    try {
      ast = parser.parse(sourceCode, { tolerant: true });
      console.log('Source code parsed successfully.');
    } catch (error) {
      console.log('Error parsing source code:', error);
      // Return the current list of dependencies if parsing fails
      return dependencies;
    }

    try {
      parser.visit(ast, {
        ContractDefinition(node: any) {
          console.log('Found ContractDefinition:', node.name);
          // Add a new entry for this contract, even if it has no dependencies
          if (!dependencies[node.name]) {
            dependencies[node.name] = [];
          }
          if (node.baseContracts.length > 0) {
            node.baseContracts.forEach((base: any) => {
              console.log('Found base contract:', base.baseName.namePath);
              dependencies[node.name].push(base.baseName.namePath);
            });
          }
        },
        ImportDirective(node: any) {
          console.log('Found ImportDirective:', node.path);
          // Add the imported file as a dependency for all contracts in this file
          for (const contract in dependencies) {
            dependencies[contract].push(node.path);
          }
        },
      });
    } catch (error) {
      console.log('Error visiting nodes:', error);
      // Return the current list of dependencies if visiting nodes fails
    }

    console.log('Final list of dependencies:', dependencies);
    return dependencies;
}

  
  
  

function sortContracts(contracts: { [name: string]: string[] }): string[] {
    const graph = new Graph();
  
    // Add a node to the graph for each contract
    for (const contract in contracts) {
      graph.addNode(contract);
    }
  
    // Add an edge to the graph for each dependency of each contract
    for (const contract in contracts) {
      const dependencies = contracts[contract];
      dependencies.forEach(dependency => graph.addEdge(dependency, contract)); // Reverse the direction of the edge
    }
  
    return graph.topologicalSort();
}


function flatten(sources: { [fileName: string]: { content: string; }; }): string {
    let flattenedCode = '';
    let licenseLine = '';
  
    for (const fileName in sources) {
      let sourceCode = sources[fileName]?.content;
      if (sourceCode) {
      const licenseMatch = sourceCode?.match(/\/\/ SPDX-License-Identifier: .*/g);
      if (licenseMatch && licenseMatch.length > 0) {
        if (!licenseLine) {
          licenseLine = licenseMatch[0];
        }
        sourceCode = sourceCode?.replace(/\/\/ SPDX-License-Identifier: .*/g, '');
      }

      sourceCode = sourceCode?.replace(/import .*/g, '');
      flattenedCode += sourceCode + '\n';
    }
    }
  
    flattenedCode = licenseLine + '\n' + flattenedCode;
    return flattenedCode;
}

function preprocessSourceCode(sourceCode: string): string {
    // Regular expression to match Solidity constructor definitions
    const constructorRegex = /constructor\(([^)]*)\)/g;
  
    // Replace constructor definitions without visibility specifiers with definitions that include 'public'
    const processedSourceCode = sourceCode.replace(constructorRegex, 'constructor($1) public');
  
    return processedSourceCode;
  }
  
  export function flattenSolidity(sources: { [fileName: string]: { content: string; }; }): string {
    const contracts: { [name: string]: string[] } = {};
    console.log('source names: ', Object.keys(sources))
  
    for (const fileName in sources) {
      let sourceCode = sources[fileName]?.content;
      if (sourceCode) {
        // Preprocess the source code to add 'public' to constructor definitions
        sourceCode = preprocessSourceCode(sourceCode);
        sources[fileName].content = sourceCode; // Save the updated source code back to the sources object
        const fileDependencies = getDependencies(sourceCode);
        console.log('fileDependencies: ', fileDependencies);
        // Merge the dependencies of all contracts in the file into the contracts object
        Object.assign(contracts, fileDependencies);
      }
    }
  
    const sortedContracts = sortContracts(contracts);
  
    const sortedSources: { [fileName: string]: { content: string; }; } = {};
    sortedContracts.forEach(contract => {
      // Find the file that contains this contract
      const fileName = Object.keys(sources).find(name => sources[name].content.includes(`contract ${contract}`));
      sortedSources[contract] = sources[fileName!] || { content: '' };
    });
  
    return flatten(sortedSources);
}