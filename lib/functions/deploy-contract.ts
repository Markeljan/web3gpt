const solc = require("solc");
import { DeployContractConfig, DeployContractResponse } from "@/lib/functions/types";
import handleImports from "@/lib/deploy-contract/handle-imports";
import { getRpcUrl, createViemChain, getExplorerUrl } from "@/lib/viem-utils";
import ipfsUpload from "@/lib/deploy-contract/ipfs-upload";
import verifyContract from "@/lib/deploy-contract/verify-contract";
import { Hex, createPublicClient, createWalletClient, encodeDeployData, http } from "viem";
import { sepolia } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";

export default async function deployContract({
    chainName = 'sepolia',
    contractName = "W3GPTContract",
    sourceCode,
    constructorArgs,
}: DeployContractConfig
): Promise<DeployContractResponse> {
    const viemChain = createViemChain(chainName) || sepolia;
    const fileName = (contractName.replace(/[\/\\:*?"<>|.\s]+$/g, "_")) + ".sol";

    // Prepare the sources object for the Solidity compiler
    const handleImportsResult = await handleImports(sourceCode);

    const sources = {
        [fileName]: {
            content: handleImportsResult?.sourceCode,
        },
        ...handleImportsResult?.sources,
    };
    // loop through sources and log the keys
    const sourcesKeys = Object.keys(sources);
    console.log("sourcesKeys", sourcesKeys);

    // Loop over each source
    for (const sourceKey of sourcesKeys) {
        let sourceCode = sources[sourceKey].content;

        // Find all import statements in the source code
        const importStatements = sourceCode.match(/import\s+["'][^"']+["'];/g) || [];

        // Loop over each import statement
        for (const importStatement of importStatements) {
            // Extract the file name from the import statement
            const importPathMatch = importStatement.match(/["']([^"']+)["']/);

            // If no import path is found, continue to the next statement
            if (!importPathMatch) continue;

            // Extract the file name from the path
            const importPath = importPathMatch[1];
            const fileName = importPath.split("/").pop() || importPath;

            // Replace the import statement with the new import statement
            sourceCode = sourceCode.replace(importStatement, `import "${fileName}";`);
        }

        // Update the source content in your sources object
        sources[sourceKey].content = sourceCode;
    }

    // Compile the contract
    const StandardJsonInput = {
        language: "Solidity",
        sources,
        settings: {
            evmVersion: "london",
            outputSelection: {
                "*": {
                    "*": ["*"],
                },
            },
        },
    };

    const output = JSON.parse(solc.compile(JSON.stringify(StandardJsonInput)));
    if (output.errors) {
        // Filter out warnings
        const errors = output.errors.filter(
            (error: { severity: string }) => error.severity === "error"
        );
        if (errors.length > 0) {
            const error = new Error(errors[0].formattedMessage);
            console.log(error);
        }
    }
    const contract = output.contracts[fileName];

    // Get the contract ABI and bytecode
    const abi = contract[contractName].abi;
    let bytecode = contract[contractName].evm.bytecode.object;
    if (!bytecode.startsWith('0x')) {
        bytecode = '0x' + bytecode;
    }

    const rpcUrl = getRpcUrl(viemChain);

    //Prepare provider and signer
    const publicClient = createPublicClient({
        chain: viemChain,
        transport: rpcUrl ? http(rpcUrl) : http()
    })

    if (!(await publicClient.getChainId())) {
        const error = new Error(`Provider for chain ${viemChain.name} not available`);
        console.log(error);
    }
    console.log("Provider OK");
    const deployerPk: Hex = `0x${process.env.DEPLOYER_PRIVATE_KEY}`;
    const account = privateKeyToAccount(deployerPk);

    const walletClient = createWalletClient({
        account,
        chain: viemChain,
        transport: rpcUrl ? http(rpcUrl) : http()
    })

    if (!(await walletClient.getAddresses())) {
        const error = new Error(`Wallet for chain ${viemChain.name} not available`);
        console.log(error);
    }
    console.log("Wallet OK");

    const deployData = encodeDeployData({
        abi: abi,
        bytecode: bytecode,
        args: constructorArgs || [],
    });
    console.log("Building deployData OK.")

    const deployHash = await walletClient.deployContract({
        abi: abi,
        bytecode: bytecode,
        account: account,
        args: constructorArgs || [],
    });

    console.log("Contract deployment OK");

    // Add the flattened source code to the sources object
    // const flattenedCode = flattenSolidity(sources);
    // const flattenedFileName = fileName.split(".")[0] + "_flattened.sol";
    // sources[flattenedFileName] = { content: flattenedCode };

    //upload contract data to an ipfs directory
    const ipfsCid = await ipfsUpload(sources, JSON.stringify(abi), bytecode, JSON.stringify(StandardJsonInput));
    
    const ipfsUrl = `https://nftstorage.link/ipfs/${ipfsCid}`;
    console.log(`IPFS URL: ${ipfsUrl}`)

    const encodedConstructorArgs = deployData.slice(bytecode?.length);
    
    const deployReceipt = await publicClient.waitForTransactionReceipt({ hash: deployHash, confirmations: 4 })

    if (deployReceipt.status === "success" && deployReceipt.contractAddress) {
        try {
            const verifyResponse = await verifyContract(deployReceipt.contractAddress, JSON.stringify(StandardJsonInput), "v0.8.20+commit.a1b79de6", encodedConstructorArgs, fileName, contractName, viemChain, constructorArgs,
            );
            console.log(verifyResponse);
        } catch (error) {
            console.log(error);
        }
    }
    const contractAddress = deployReceipt?.contractAddress || '0x'

    const explorerUrl = `${getExplorerUrl(viemChain)}/address/${contractAddress}`;

    const deploymentData = { name: fileName, chain: viemChain?.name, contractAddress, explorerUrl, ipfsUrl };

    console.log(`Deployment data: `, deploymentData);

    return deploymentData;
};
