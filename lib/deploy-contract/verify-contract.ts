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

    while (await publicClient.getTransactionConfirmations({ hash: deployHash }) < 5) {
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    const deployReceipt = await publicClient.getTransactionReceipt({ hash: deployHash }).catch(error => {
        throw new Error(`Error getting transaction receipt: ${error.message}`);
    });

    const verificationResult = await verifyContractRequest({
        address: deployReceipt.contractAddress as Hex,
        standardJsonInput,
        compilerVersion: "v0.8.20+commit.a1b79de6", //TODO: make this dynamic
        encodedConstructorArgs,
        fileName,
        contractName,
        viemChain
    });

    if (verificationResult === "success") {
        console.log('verification success');
        return deployReceipt.contractAddress;
    } else if (verificationResult === "already_verified") {
        return "already_verified";
    } else {
        console.log('verification failure');
        return null;
    }

}

const verifyContractRequest = async ({ address, standardJsonInput, compilerVersion, encodedConstructorArgs, fileName, contractName, viemChain }: VerifyContractRequestParams): Promise<"success" | "already_verified" | "failed"> => {
    const apiUrl = API_URLS[viemChain['name']];
    const apiKey = API_KEYS[viemChain['name']];
    // mantle does not require an API_KEY
    if (!apiKey && (viemChain.name !== "Mantle Testnet" && viemChain.name !== "Mantle Mainnet")) {
        throw new Error(`Unsupported chain or explorer API_KEY.  Network: ${viemChain["network"]}`);
    }

    try {
        const params = new URLSearchParams();
        apiKey && params.append('apikey', apiKey);
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
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
            },
            body: new URLSearchParams(params).toString()
        });
        const json = await response.json();
        console.log('verification api response status: ', response.status);
        console.log('verification api response json: ', json);
        console.log('verification api response ok: ', response.ok);
        if (json.message == 'OK') {
            return "success";
        } else if (json.message == 'Smart-contract already verified.') {
            return "already_verified";
        } else {
            return "failed";
        }
    } catch (error) {
        console.log('verification api error: ', error);
        console.log('verification api error stack: ', (error as Error).stack);
        throw new Error(`Error verifying contract: ${(error as Error).message}`);
    }
}


export default verifyContract;
