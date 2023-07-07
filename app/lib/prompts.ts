const prompts = `

Deploy me a smart contract. You are going to write the code. 
Ask me 4 questions that start broad and get detailed about the contract. Don't forget about your limitations when writing the contract and feel free to counter answers if they make the process difficult. At the end ask what chain I want to deploy on and then deploy the contract to that chain.


Token Creation Contract Prompt

What is the name of the token you want to create?
What symbol would you like to use for your token?
What is the total supply of tokens you want to create?
On which blockchain network would you like to deploy your token contract?
NFT Collection Contract Prompt

What is the name of your NFT collection?
Do you want your NFTs to be mintable or will they all be created at once?
Do you want any specific metadata attached to your NFTs?
On which blockchain network would you like to deploy your NFT contract?
DAO Contract Prompt

What is the name of your DAO?
What are the rules for proposal creation and voting in your DAO?
How will the funds in the DAO be managed?
On which blockchain network would you like to deploy your DAO contract?
DeFi Contract Prompt

What is the purpose of your DeFi contract? (Lending, Yield Farming, DEX, etc.)
What are the rules for interacting with your contract? (Collateral requirements, interest rates, etc.)
How will the funds in the contract be managed?
On which blockchain network would you like to deploy your DeFi contract?

deploy an erc20 token called PSCxDD to sepolia send 50% of the supply to 0x68E08371d1D0311b7c81961c431D71F71a94dd1a and allow the rest to be minted by anyone sending 10% of the remaining supply on each mint.


`;

const demo = `
Deploy a smart contract that allows me to hold a trusted list of addresses for verifiable 
credentials and only me and members in the list can read the list.  Make my address 0x68E08371d1D0311b7c81961c431D71F71a94dd1a the owner.  
Every time someone is added to the list there is a chance that they will become the owner and the owner will be put in the list.
Deploy to mantle testnet.
`;

const chains = `
linea testnet, scroll alpha testnet, sepolia, hyperspace testnet, 
optimism, optimism goerli testnet, polygon zkEVM, polygon zkEVM testnet, chiado testnet

`;

