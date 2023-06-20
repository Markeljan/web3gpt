import { Chain } from "viem";
import { API_KEYS, API_URLS } from "@/app/lib/helpers/useChains";

const fetchAbi = async (chain: Chain, contractAddress: `0x${string}`): Promise<any> => {
    const apiUrl = API_URLS[chain['name']];
    const apiKey = API_KEYS[chain['name']];
    if (!apiUrl || !apiKey) {
        throw new Error(`Unsupported chain: ${chain['name']}`);
    }

    const url = `${apiUrl}/api?module=contract&action=getabi&address=${contractAddress}&apikey=${apiKey}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.status === '1') {
            return JSON.parse(data.result);
        } else {
            throw new Error(`Error fetching ABI: ${data.result} here`);
        }
    } catch (error) {
        console.error(error);
        throw error;
    }
};

export default fetchAbi;