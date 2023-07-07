import { Chain } from "viem";
import { API_KEYS, API_URLS } from "@/lib/viem-utils";

const verifyContract = async (address: `0x${string}`, standardJsonInput: string, compilerVersion: string, encodedConstructorArgs: string, fileName: string, contractName: string, viemChain: Chain, constructorArgs?: Array<string | string[]>
) => {
    const apiUrl = API_URLS[viemChain['name']];
    const apiKey = API_KEYS[viemChain['name']];
    if (!apiKey) {
        throw new Error(`Unsupported chain or API_KEY.  Network: ${viemChain["network"]}`);
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
        constructorArgs?.length && (
            params.append('constructorArguements', encodedConstructorArgs))
        params.append('evmversion', 'london'); // leave blank for compiler default
        const response = await fetch(apiUrl + '/api', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
            },
            body: new URLSearchParams(params).toString()
        });
        const result = await response.json();
        return result;
    } catch (error) {
        console.error(error);
    }

}

export default verifyContract;