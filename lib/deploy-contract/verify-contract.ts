import { Hex, createPublicClient, http } from "viem";
import { API_KEYS, API_URLS, getRpcUrl } from "@/lib/viem-utils";
import { VerifyContractParams, VerifyContractRequestParams } from "@/lib/functions/types";


const verifyContract = async ({ deployHash, standardJsonInput, encodedConstructorArgs, fileName, contractName, viemChain }: VerifyContractParams) => {
    const rpcUrl = getRpcUrl(viemChain);

    //Prepare provider
    const publicClient = createPublicClient({
        chain: viemChain,
        transport: rpcUrl ? http(rpcUrl) : http()
    })

    if (!(await publicClient.getChainId())) {
        throw new Error(`Provider for chain ${viemChain.name} not available`);
    }

    const txConfirmations = await publicClient.getTransactionConfirmations({ hash: deployHash })
        .catch(error => {
            throw new Error(`Error waiting for transaction receipt: ${error.message}`);
        });

    if (txConfirmations >= 4) {
        const deployReceipt = await publicClient.getTransactionReceipt({ hash: deployHash }).catch(error => {
            throw new Error(`Error getting transaction receipt: ${error.message}`);
        });
        const verificationOK = await verifyContractRequest({
            address: deployReceipt.contractAddress as Hex,
            standardJsonInput,
            compilerVersion: "v0.8.20+commit.a1b79de6", //TODO: make this dynamic
            encodedConstructorArgs,
            fileName,
            contractName,
            viemChain
        });
        if (verificationOK) {
            return deployReceipt.contractAddress;
        } else {

            throw new Error("Contract verification failed");
        }
    } else {
        throw new Error("Contract deployment failed");
    }
}

const verifyContractRequest = async ({ address, standardJsonInput, compilerVersion, encodedConstructorArgs, fileName, contractName, viemChain }: VerifyContractRequestParams) => {
    const apiUrl = API_URLS[viemChain['name']];
    const apiKey = API_KEYS[viemChain['name']];
    console.log("apiurl", apiUrl)
    console.log("apikay", apiKey)
    if (!apiKey) {
        throw new Error(`Unsupported chain or explorer API_KEY.  Network: ${viemChain["network"]}`);
    }

    try {
        const params = new URLSearchParams();
        params.append('apikey', apiKey);
        params.append('module', 'contract');
        params.append('action', 'verifysourcecode');
        params.append('contractaddress', address);
        params.append('sourceCode', standardJsonInput);
        params.append('codeformat', 'solidity-standard-json-input');
        params.append('contractname', fileName + ':' + contractName);
        params.append('compilerversion', compilerVersion);
        params.append('optimizationused', '0');
        if (encodedConstructorArgs) {
            params.append('constructorArguements', encodedConstructorArgs);
        }
        params.append('evmversion', 'london'); // leave blank for compiler default
        const response = await fetch(apiUrl + '/api', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
            },
            body: new URLSearchParams(params).toString()
        });
        if (!response.ok) {
            throw new Error(`Explorer API request failed with status ${response.status}`);
        }
        return response.ok;
    } catch (error) {
        throw new Error(`Error verifying contract: ${(error as Error).message}`);
    }
}


export default verifyContract;