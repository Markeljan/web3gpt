# Web3GPT 🚀

Web3GPT is an AI-powered smart contract development platform that combines Large Language Models (LLMs) with specialized AI agents to streamline blockchain development. Try it live at [w3gpt.ai](https://w3gpt.ai) or check out our [documentation](https://docs.w3gpt.ai).

![image](https://github.com/Markeljan/Web3GPT/assets/12901349/c84ec7ed-3657-4d19-a739-2285e25c29a1)

## Key Features 🌟

- **Multi-Chain Smart Contract Development:** Deploy contracts across multiple EVM-compatible testnets including:
  - Arbitrum Sepolia
  - Optimism Sepolia
  - Base Sepolia
  - Metis Sepolia
  - Mantle Sepolia
  - Celo Alfajores
  - Polygon Amoy
  - Sepolia

- **Specialized AI Agents:**
  - Web3GPT - Core smart contract development agent
  - GENT - first token agent launched on W3GPT
  - Unstoppable Domains - Domain resolution specialist
  - OpenZeppelin 5.0 - Security-focused development using latest OZ libraries
  - CTF Agent - Interactive Capture The Flag challenges
  - Creator - Custom AI agent creation

- **GitHub Authentication:** Secure login and persistence of your development sessions

- **Share & Collaborate:** Share your smart contract development conversations with unique shareable URLs

## Getting Started 🛠️

1. Clone the repository
2. Configure environment variables (see `.env.example`)
3. Install dependencies and run the development server

```bash
bun install
```

```bash
bun dev
```

## Deploying Contracts with Local Imports

Web3GPT now supports deploying factory contracts that rely on local Solidity imports. Provide additional source files alongside your main contract and reference them with relative paths (e.g., `import "./AddressBook.sol";`). The compiler will include these dependencies automatically, enabling factory patterns without flattening contracts.
