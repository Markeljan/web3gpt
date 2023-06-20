import { Chain } from "viem";
import { API_KEYS, API_URLS } from "@/app/lib/helpers/useChains";

const fetchAbi = async (chain: Chain, contractAddress: `0x${string}`): Promise<any> => {
    const apiUrl = API_URLS[chain['network']];
    const apiKey = API_KEYS[chain['network']];
    if (!apiUrl || !apiKey) {
        throw new Error(`Unsupported chain: ${chain}`);
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
            throw new Error(`Error fetching ABI: ${data.result}`);
        }
    } catch (error) {
        console.error(error);
        throw error;
    }
};

export default fetchAbi;